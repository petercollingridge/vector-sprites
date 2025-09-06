let toolbarMode = 'move';
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
  const coords = getClickCoords(event);
  createEditableElement({
    tag: 'rect',
    x: coords.x - 30,
    y: coords.y - 30,
    width: 60,
    height: 60,
    ...newShapeStyles,
  });
}

function addEllipse(event) {
  const coords = getClickCoords(event);
  createEditableElement({
    tag: 'ellipse',
    cx: coords.x,
    cy: coords.y,
    rx: 30,
    ry: 20,
    ...newShapeStyles,
  });
}

function addLine(event) {
  const coords = getClickCoords(event);
  createEditableElement({
    tag: 'line',
    x1: coords.x - 30,
    y1: coords.y,
    x2: coords.x + 30,
    y2: coords.y,
    ...newShapeStyles,
  });
}

function addPolyline(event) {
  const coords = getClickCoords(event);
  createEditableElement({
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
