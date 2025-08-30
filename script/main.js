// script/main.js
// Entry point for Vector Sprites scripts

function populateForm() {
  const shape = initialShape[0];
  document.getElementById('cx-input').value = shape.cx;
  document.getElementById('cy-input').value = shape.cy;
  document.getElementById('r-input').value = shape.r;
  document.getElementById('fill-input').value = shape.fill;
  document.getElementById('stroke-input').value = shape.stroke;
  document.getElementById('stroke-width-input').value = shape['stroke-width'];
}

function updateShapeFromForm(e) {
  e.preventDefault();
  const shape = initialShape[0];
  shape.cx = Number(document.getElementById('cx-input').value);
  shape.cy = Number(document.getElementById('cy-input').value);
  shape.r = Number(document.getElementById('r-input').value);
  shape.fill = document.getElementById('fill-input').value;
  shape.stroke = document.getElementById('stroke-input').value;
  shape['stroke-width'] = Number(document.getElementById('stroke-width-input').value);
  // Clear and re-render SVG
  const svg = document.querySelector('#main-svg');
  svg.innerHTML = '';
  renderInitialShapes();
}

document.addEventListener('DOMContentLoaded', () => {
  renderInitialShapes();
  renderEditShapePanel();
  // populateForm();
});
