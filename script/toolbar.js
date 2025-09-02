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
  createEditableElement('rect', {
    x: coords.x - 30,
    y: coords.y - 30,
        width: 60,
        height: 60,
      ...newShapeStyles,
    });
}
