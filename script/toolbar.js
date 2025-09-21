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
  d += ` C${x + 1} ${y} 0 0 0 0`;
  d += ` C${x + 1} ${y + 1} 0 0 0 0`;
  d += ` C${x} ${y + 1} 0 0 0 0`;
  d += ` C${x + 1} ${y} 0 0 0 0Z`;
  return addPath({d, ...newShapeStyles});
}

function addPolyline(event) {
  const {x, y} = clientToSVGCoords(event);
  toolbarMode = 'Adding polyline';
  return addPath({d: `M${x} ${y}`, ...newShapeStyles, 'fill-opacity': 0});
}

function dragSelectedElement(event) {
  if (selectedElement) {
    selectedElement.drag(event);
  }
}

function scaleRect(event) {
  if (selectedElement && dragOffset) {
    const currentPosition = eventToSVGCoords(event);
    const x = Math.min(dragOffset.x, currentPosition.x);
    const y = Math.min(dragOffset.y, currentPosition.y);
    const width = Math.abs(currentPosition.x - dragOffset.x);
    const height = Math.abs(currentPosition.y - dragOffset.y);

    selectedElement.points[0].updatePosition(x, y);
    selectedElement.points[1].updatePosition(x + width, y);
    selectedElement.points[2].updatePosition(x + width, y + height);
    selectedElement.points[3].updatePosition(x, y + height);
    selectedElement.updatePath();
  }
}

function scaleEllipse(event) {
  if (selectedElement && dragOffset) {
    const currentPosition = { x: event.clientX, y: event.clientY };
    const x = Math.min(dragOffset.x, currentPosition.x);
    const y = Math.min(dragOffset.y, currentPosition.y);
    const width = Math.abs(currentPosition.x - dragOffset.x);
    const height = Math.abs(currentPosition.y - dragOffset.y);
    const pos = clientToSVGCoords(x + width / 2, y + height / 2);
    updateSelectedElement({
      cx: pos.x,
      cy: pos.y,
      rx: width / 2,
      ry: height / 2
    });
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
  'Add rectangle': addRect,
  'Add ellipse': addEllipse,
  'Add polyline': addPolyline,
};

const mouseMoveFunctions = {
  'Move': dragSelectedElement,
  'Edit points': dragSelectedElement,
  'Add rectangle': scaleRect,
  'Add ellipse': scaleEllipse,
  'Adding polyline': movePolylinePoint,
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
