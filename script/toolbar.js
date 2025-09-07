const newShapeStyles = {
    fill: 'white',
    stroke: 'black',
    'stroke-width': 2
};

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
  const coords = clientToSVGCoords(event);
  return createEditableElement({
    tag: 'rect',
    x: coords.x,
    y: coords.y,
    width: 0,
    height: 0,
    ...newShapeStyles,
  });
}

function addEllipse(event) {
  const coords = eventToSVGCoords(event);
  return createEditableElement({
    tag: 'ellipse',
    cx: coords.x,
    cy: coords.y,
    rx: 0,
    ry: 0,
    ...newShapeStyles,
  });
}

function addLine(event) {
  const coords = eventToSVGCoords(event);
  return createEditableElement({
    tag: 'line',
    x1: coords.x - 30,
    y1: coords.y,
    x2: coords.x + 30,
    y2: coords.y,
    ...newShapeStyles,
  });
}

function addPolyline(event) {
  const coords = eventToSVGCoords(event);
  return createEditableElement({
    tag: 'polyline',
    points: `${coords.x - 30},${coords.y - 30} ${coords.x + 30},${coords.y - 30} ${coords.x - 30},${coords.y + 30} ${coords.x + 30},${coords.y + 30}`,
    ...newShapeStyles,
    'fill-opacity': 0,
  });
}

const addShapes = {
  'Add rectangle': addRect,
  'Add ellipse': addEllipse,
  'Add line': addLine,
  'Add polyline': addPolyline,
};
