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
  return addPath({d, ...newShapeStyles});
}

function addEllipse(event) {
  const {x, y} = eventToSVGCoords(event);
  let d = `M${x} ${y}`;
  d += ` C0 0 0 0 ${x + 1} ${y}`;
  d += ` C0 0 0 0 ${x + 1} ${y + 1}`;
  d += ` C0 0 0 0 ${x} ${y + 1}`;
  d += ` C0 0 0 0 ${x} ${y} Z`;
  return addPath({d, ...newShapeStyles});
}

function addPolyline(event) {
  toolbarMode = 'Adding polyline';
  const {x, y} = clientToSVGCoords(event);
  return addPath({d: `M${x} ${y}`, ...newShapeStyles, 'fill-opacity': 0});
}

function addCurvedLine(event) {
  toolbarMode = 'Adding curved line';
  const {x, y} = clientToSVGCoords(event);
  return addPath({d: `M${x} ${y}`, ...newShapeStyles, 'fill-opacity': 0});
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

function movePolylinePoint(event) {
  if (selectedElement) {
    const {x, y} = eventToSVGCoords(event);
    const points = selectedElement.points;
    const n = points.length;
    points[n - 1].updatePosition(x, y);
    selectedElement.updatePath();
    if (n > 2) {
      const dist = Math.hypot(points[0].x - x, points[0].y - y);
      selectedElement.element.style['fill-opacity'] = dist <= 4 ? 0.3 : 0;
    }
  }
}

function addPolylinePoint(event) {
  if (selectedElement) {
    const {x, y} = eventToSVGCoords(event);
    const points = selectedElement.points;
    const n = points.length;
    const lastPoint = points[n - 1];
    lastPoint.updatePosition(x, y);

    if (n > 1) {
      // If last two points very close then stop drawing line
      let dist = Math.hypot(points[n - 2].x - x, points[n - 2].y - y);
      if (dist <= 4) {
        return endPolyline();
      }

      // If close to start point then create a closed shape
      dist = Math.hypot(points[0].x - x, points[0].y - y);
      if (dist <= 4) {
        selectedElement.closed = true;
        selectedElement.points.splice(n - 1, 1); // Remove last point
        selectedElement.updatePath();
        return endPolyline();
      }

    }

    selectedElement.addPoint(x, y);
    selectedElement.updatePath();
  }
}

function endPolyline() {
  toolbarMode = 'Add polyline';
  updatePreview();
}

const mouseDownFunctions = {
  'Move': deselectElement,
  'Add rectangle': addRect,
  'Add ellipse': addEllipse,
  'Add polyline': addPolyline,
  'Add curved line': addCurvedLine,
};

const mouseMoveFunctions = {
  'Move': dragSelectedElement,
  'Edit points': dragSelectedElement,
  'Add rectangle': scaleRect,
  'Add ellipse': scaleEllipse,
  'Adding polyline': movePolylinePoint,
  'Adding curved line': movePolylinePoint,
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
  if (toolbarMode === 'Adding polyline') {
    addPolylinePoint(event);
  } else {
    updatePreview();
  }
}
