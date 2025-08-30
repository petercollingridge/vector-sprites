const SVG_NS = 'http://www.w3.org/2000/svg';
let selectedElement = null;

function createSVGElement(tag, attrs) {
  const elem = document.createElementNS(SVG_NS, tag);
  for (const attr in attrs) {
    elem.setAttribute(attr, attrs[attr]);
  }
  return elem;
}

function selectElement(element) {
  selectedElement = element;
  showSelectionBox(element)
  renderEditElementPanel(element);
}

function showSelectionBox(element) {
  const selectionBox = document.getElementById('selection-box');
  const bbox = element.getBBox();
  selectionBox.setAttribute('x', bbox.x - 2);
  selectionBox.setAttribute('y', bbox.y - 2);
  selectionBox.setAttribute('width', bbox.width + 4);
  selectionBox.setAttribute('height', bbox.height + 4);
  selectionBox.style.display = 'block';
}

function deselectElement() {
  selectedElement = null;
  renderEditElementPanel(null);
  const selectionBox = document.getElementById('selection-box');
  if (selectionBox) {
    selectionBox.style.display = 'none';
  }
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

function initActiveSpritePanel() {
  const backgroundRect = document.getElementById('background-rect');
  backgroundRect.addEventListener('click', deselectElement);
}

function renderInitialShapes() {
  const svg = document.querySelector('#sprite-elements');
  constructSVG(svg, initialShape);
}
