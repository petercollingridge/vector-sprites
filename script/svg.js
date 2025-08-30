
let selectedElement = null;

function createSVGElement(tag, attrs) {
  const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const attr in attrs) {
    elem.setAttribute(attr, attrs[attr]);
  }
  return elem;
}

function selectElement(element) {
  selectedElement = element;
  renderEditShapePanel(element);
}

function constructSVG(svgElement, shapes) {
  const elementGroup = createSVGElement('g', { 'class': 'elements' });
  svgElement.appendChild(elementGroup);

  shapes.forEach(shape => {
    const elem = createSVGElement(shape.type, shape);
    elem.addEventListener('click', (event) => {
      selectElement(elem);
      event.stopPropagation();
    });
    elementGroup.appendChild(elem);
  });
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
  constructSVG(svg, initialShape);
}
