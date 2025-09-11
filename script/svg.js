function createSVGElement(tag, attrs) {
  const elem = document.createElementNS(SVG_NS, tag);
  for (const attr in attrs) {
    if (attr !== 'type') {
      elem.setAttribute(attr, attrs[attr]);
    }
  }
  return elem;
}

function cloneSVGElement(element) {
  const tag = element.tagName.toLowerCase();
  const newElement = document.createElementNS(SVG_NS, tag);

  for (const attr of element.attributes) {
    newElement.setAttribute(attr.name, attr.value);
  }
  return newElement;
}

function makeEditable(element) {
  element.addEventListener('mousedown', (event) => {
    if (toolbarMode === 'Move') {
      selectElement(element);
      startDrag(event);
      event.stopPropagation();
    }
  });
}

// Given an SVG element, create a new editable SVG element
function createEditableElement(element) {
  const newElement = cloneSVGElement(element);
  makeEditable(newElement);
  return newElement;
}

function addEditableElement({ tag, ...attrs }) {
  const newElement = createSVGElement(tag, attrs);
  makeEditable(newElement);
  const mainSVG = document.getElementById('sprite-elements');
  mainSVG.appendChild(newElement);
  return newElement;
}

// Given an HTMLCollection of SVG element, add them to the main-svg elements with the
// event handlers we need
function createEditableElements(elements) {
  const mainSVG = document.getElementById('sprite-elements');
  mainSVG.innerHTML = '';

  for (const element of elements) {
    const newElement = createEditableElement(element);
    mainSVG.appendChild(newElement);
  }
}

// Convert mouse event.client coordinates to SVG coordinates
function clientToSVGCoords(x, y) {
  const svg = document.querySelector('#main-svg');
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function eventToSVGCoords(event) {
  return clientToSVGCoords(event.clientX, event.clientY);
}

function selectElement(element) {
  if (toolbarMode === 'Move') {
    deselectCurrentElement();
    selectedElement = element;
    selectedElement.style.cursor = 'move';
    showSelectionBox(element)
    renderEditElementPanel(element);
  }
}

// Called when selecting a different element
function deselectCurrentElement() {
  if (selectedElement) {
    selectedElement.style.cursor = 'pointer';
  }
}

// Called when deselecting all elements
function deselectElement() {
  deselectCurrentElement();
  selectedElement = null;
  emptyEditElementPanel();

  const selectionBox = document.getElementById('selection-box');
  if (selectionBox) {
    selectionBox.style.display = 'none';
  }
}

// Update the selected element with a dict of attributes
function updateSelectedElement(attrs) {
  if (selectedElement) {
    for (const key in attrs) {
      selectedElement.setAttribute(key, attrs[key]);
    }
  }
}

function showSelectionBox(element) {
  const selectionBox = document.getElementById('selection-box');
  // Get the bounding box in local coordinates
  const bbox = element.getBBox();

  let x = bbox.x - 2;
  let y = bbox.y - 2;

  const transforms = selectedElement.transform.baseVal;
  if (transforms.length > 0) {
    const matrix = transforms.getItem(0).matrix;
    x += matrix.e;
    y += matrix.f;
  }

  selectionBox.setAttribute('x', x);
  selectionBox.setAttribute('y', y);
  selectionBox.setAttribute('width', bbox.width + 4);
  selectionBox.setAttribute('height', bbox.height + 4);
  selectionBox.style.display = 'block';
}

function addActiveSpritePanelEventHandlers() {
  const backgroundRect = document.getElementById('background-rect');
  // backgroundRect.addEventListener('click', deselectElement);
  
  const svg = document.querySelector('#main-svg');
  svg.addEventListener('mousedown', mouseDownOnSVG);
  svg.addEventListener('mousemove', mouseMoveOnSVG);
  svg.addEventListener('mouseup', mouseUpOnSVG);
}
