// Add event handlers to toolbar button to activate the respective tool
function initToolbar() {
	const toolbar = document.querySelector('.toolbar');
	if (!toolbar) return;

	const buttons = toolbar.querySelectorAll('button');
	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			// Remove selected class from all buttons
			buttons.forEach(b => b.classList.remove('selected'));
			// Add selected class to clicked button
			btn.classList.add('selected');
			// Set mode
			toolbarMode = btn.getAttribute('title');
		});
	});
}

function addRect(event) {
  const {x, y} = eventToSVGCoords(event);
  const d = `M${x} ${y} L${x + 1} ${y} L${x + 1} ${y + 1} L${x} ${y + 1} Z`;
  return addPathElement({d, ...newShapeStyles});
}

function addEllipse(event) {
  const {x, y} = eventToSVGCoords(event);
  let d = `M${x} ${y}`;
  d += ` C0 0 0 0 ${x + 1} ${y}`;
  d += ` C0 0 0 0 ${x + 1} ${y + 1}`;
  d += ` C0 0 0 0 ${x} ${y + 1}`;
  d += ` C0 0 0 0 ${x} ${y} Z`;
  return addPathElement({d, ...newShapeStyles}, true);
}

function addPath(event, isCurved = false) {
  toolbarMode = 'Move path point';
  const {x, y} = clientToSVGCoords(event);
  return addPathElement({d: `M${x} ${y}`, ...newShapeStyles, 'fill-opacity': 0}, isCurved);
}

function dragSelectedElement(event) {
  if (selectedElement) {
    selectedElement.drag(event);
  }
}

// Get bounding box from two points
const getBoundsFromPoints = (p1, p2) => ({
  x: Math.min(p1.x, p2.x),
  y: Math.min(p1.y, p2.y),
  width: Math.abs(p2.x - p1.x),
  height: Math.abs(p2.y - p1.y),
});

function scaleRect(event) {
  if (selectedElement && dragOffset) {
    const currentPosition = eventToSVGCoords(event);
    const {x, y, width, height} = getBoundsFromPoints(dragOffset, currentPosition);
    selectedElement.points[0].updatePosition(x, y);
    selectedElement.points[1].updatePosition(x + width, y);
    selectedElement.points[2].updatePosition(x + width, y + height);
    selectedElement.points[3].updatePosition(x, y + height);
    selectedElement.updatePath();
  }
}

function scaleEllipse(event) {
  if (selectedElement && dragOffset) {
    const currentPosition = eventToSVGCoords(event);
    const {x, y, width, height} = getBoundsFromPoints(dragOffset, currentPosition);
    const mx = x + width / 2;
    const my = y + height / 2;
    const dx = width / 2 * 0.552; // Approximation for control point offset
    const dy = height / 2 * 0.552;

    selectedElement.points[0].updatePointAndArms(mx, y, mx - dx, y, mx + dx, y);
    selectedElement.points[1].updatePointAndArms(x + width, my, x + width, my - dy, x + width, my + dy);

    selectedElement.points[2].updatePointAndArms(mx, y + height, mx + dx, y + height, mx - dx, y + height);
    selectedElement.points[3].updatePointAndArms(x, my, x, my + dy, x, my - dy);
    selectedElement.updatePath();
  }
}

const areClose = (p, x, y, threshold = 4) => Math.hypot(p.x - x, p.y - y) <= threshold;

function movePathPoint(event) {
  if (selectedElement) {
    const {x, y} = eventToSVGCoords(event);
    const points = selectedElement.points;
    const n = points.length;
    points[n - 1].updatePosition(x, y);

    if (selectedElement.isCurved && n > 2) {
      const p0 = points[n - 3];
      const p1 = points[n - 2];
      const p2 = points[n - 1];

      // Midpoint between p0 and p2
      const mx = 0.5 * (p0.x + p2.x);
      const my = 0.5 * (p0.y + p2.y);

      // Vector from p1 to midpoint
      const vx = mx - p1.x;
      const vy = my - p1.y;
      const d = Math.hypot(vx, vy);

      if (d > 0) {
        // Perpendicular unit vector
        const ux = vy / d;
        const uy = -vx / d;

        const dx1 = p1.x - p0.x;
        const dy1 = p1.y - p0.y;
        const dx2 = p2.x - p1.x;
        const dy2 = p2.y - p1.y;

        const dot1 = dx1 * ux + dy1 * uy;
        const dot2 = dx2 * ux + dy2 * uy;

        // Corner points
        const c1x = p1.x - ux * dot1;
        const c1y = p1.y - uy * dot1;
        const c2x = p1.x + ux * dot2;
        const c2y = p1.y + uy * dot2;

        const scale = 0.5; // Adjust this factor to change arm length

        if (n == 3) {
          p0.addArm(1, p0.x - 0.5 * (c1x - p0.x), p0.y - 0.5 * (c1y - p0.y));
          p0.addArm(2, p0.x + 0.5 * (c1x - p0.x), p0.y + 0.5 * (c1y - p0.y));
        }

        p1.addArm(1, p1.x - ux * dot1 * scale, p1.y - uy * dot1 * scale);
        p1.addArm(2, p1.x + ux * dot2 * scale, p1.y + uy * dot2 * scale);

        p2.addArm(1, p2.x + 0.5 * (c2x - p2.x), p2.y + 0.5 * (c2y - p2.y));
        p2.addArm(2, p2.x - 0.5 * (c2x - p2.x), p2.y - 0.5 * (c2y - p2.y));
      }
    }

    selectedElement.updatePath();

    // Fill shape if path is closed
    if (n > 2) {
      const fillShape = areClose(points[0], x, y);
      selectedElement.element.style['fill-opacity'] = fillShape ? 0.3 : 0;
    }
  }
}

function addPathPoint(event) {
  if (selectedElement) {
    const {x, y} = eventToSVGCoords(event);
    const points = selectedElement.points;
    const n = points.length;
    const lastPoint = points[n - 1];
    lastPoint.updatePosition(x, y);


    if (n > 1) {
      // If last two points close then stop drawing line
      if (areClose(points[n - 2], x, y)) {
        selectedElement.points.splice(n - 1, 1);
        return endPolyline();
      }

      // If end point is close to start point then create a closed shape
      if (areClose(points[0], x, y)) {
        selectedElement.closed = true;
        selectedElement.points.splice(n - 1, 1);
        return endPolyline();
      }
    }
    
    selectedElement.addPoint(x, y);
    selectedElement.updatePath();
  }
}

function endPolyline() {
  toolbarMode = 'Add polyline';
  selectedElement.updatePath();
  updatePreview();
}

const mouseDownFunctions = {
  'Move': deselectElement,
  'Add rectangle': addRect,
  'Add ellipse': addEllipse,
  'Add polyline': (evt) => addPath(evt),
  'Add curved line': (evt) => addPath(evt, true),
};

const mouseMoveFunctions = {
  'Move': dragSelectedElement,
  'Edit points': dragSelectedElement,
  'Add rectangle': scaleRect,
  'Add ellipse': scaleEllipse,
  'Move path point': movePathPoint,
};

function mouseDownOnSVG(event) {
  const func = mouseDownFunctions[toolbarMode];
  if (func) {
    selectedElement = func(event);
    dragOffset = eventToSVGCoords(event);
  }
}

function mouseMoveOnSVG(event) {
  const func = mouseMoveFunctions[toolbarMode];
  if (func) {
    func(event);
  }
}

function mouseUpOnSVG(event) {
  if (selectedElement) {
    selectedElement.mouseUp(event);
  }

  dragOffset = false;
  if (toolbarMode === 'Move path point') {
    addPathPoint(event);
  } else {
    updatePreview();
  }
}
