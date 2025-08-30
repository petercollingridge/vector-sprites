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

function renderEditShapePanel(shape) {
  const editElementDiv = document.getElementById('edit-element');
  editElementDiv.innerHTML = '';

  if (shape) {
    const form = document.createElement('form');

    for (const key in shape) {
      const label = document.createElement('label');
      label.textContent = key + ': ';
      const input = document.createElement('input');
      input.type = typeof shape[key] === 'number' ? 'number' : 'text';
      input.value = shape[key];
      input.id = key + '-input';
      label.appendChild(input);
      form.appendChild(label);
    }

    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Update';
    form.appendChild(button);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      updateShapeFromForm(e);
    });

    editElementDiv.appendChild(form);
  } else {
    editElementDiv.textContent = 'Click on a shape to edit it';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderInitialShapes();
  renderEditShapePanel();
  // populateForm();
});
