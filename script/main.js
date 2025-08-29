// script/main.js
// Entry point for Vector Sprites scripts

const initialShape = [
  {
    type: 'circle',
    cx: 128,
    cy: 128,
    r: 50,
    fill: '#e4e6ff',
    stroke: '#007bff',
    'stroke-width': 6,
  },
  {
    type: 'rect',
    x: 78,
    y: 170,
    width: 100,
    height: 50,
    fill: '#e7c5a0ff',
    stroke: '#ff9d00ff',
    'stroke-width': 6,
  }
];

function createSVGElement(tag, attrs) {
  const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const attr in attrs) {
    elem.setAttribute(attr, attrs[attr]);
  }
  return elem;
}

function renderInitialShapes() {
  const svg = document.querySelector('#main-svg');

  // Add rect showing extent of SVG
  const extentRect = createSVGElement('rect', {
    x: 0.5,
    y: 0.5,
    width: 255,
    height: 255,
    fill: 'none',
    stroke: '#ddd',
    'stroke-width': 1,
  });
  svg.appendChild(extentRect);

  initialShape.forEach(shape => {
    const elem = createSVGElement(shape.type, shape);
    svg.appendChild(elem);
  });
}


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
  populateForm();
  document.getElementById('circle-form').addEventListener('submit', updateShapeFromForm);
});
