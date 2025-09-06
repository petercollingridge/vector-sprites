const SVG_NS = 'http://www.w3.org/2000/svg';
const SPRITE_ELEMENTS_GROUP = document.querySelector('#sprite-elements');

let selectedElement = null;
let dragOffset = false;

function createSVGElement(tag, attrs) {
  const elem = document.createElementNS(SVG_NS, tag);
  for (const attr in attrs) {
    if (attr !== 'type') {
      elem.setAttribute(attr, attrs[attr]);
    }
  }
  return elem;
}

function createEditableElement({tag, ...attrs}) {
  const elem = createSVGElement(tag, attrs);

  elem.addEventListener('mousedown', (event) => {
    if (toolbarMode === 'Move') {
      selectElement(elem);
      startDrag(event);
      event.stopPropagation();
    }
  });
  SPRITE_ELEMENTS_GROUP.appendChild(elem);
}


function constructSVG(shapes) {
  shapes.forEach(createEditableElement);
}

function getClickCoords(event) {
  // Convert mouse coordinates to SVG coordinates
  const svg = document.querySelector('#main-svg');
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function mouseDownOnSVG(event) {
  const addShape = addShapes[toolbarMode];
  if (addShape) {
    addShape(event);
  }
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

function startDrag(event) {
  if (!selectedElement) return;
  dragOffset = { x: event.clientX, y: event.clientY };

  // Get all the transforms currently on this element
  const transforms = selectedElement.transform.baseVal;
  // Ensure the first transform is a translate transform
  if (transforms.length === 0 ||
      transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
    // Create an transform that translates by (0, 0)
    const translate = selectedElement.ownerSVGElement.createSVGTransform();
    translate.setTranslate(0, 0);
    // Add the translation to the front of the transforms list
    selectedElement.transform.baseVal.insertItemBefore(translate, 0);
  } else {
    const matrix = transforms.getItem(0).matrix;
    dragOffset.x -= matrix.e;
    dragOffset.y -= matrix.f;
  }
}

function dragSelectedElement(event) {
  if (selectedElement && dragOffset) {
    const transform = selectedElement.transform.baseVal.getItem(0);
    transform.setTranslate(event.clientX - dragOffset.x, event.clientY - dragOffset.y);
    showSelectionBox(selectedElement);
  }
}

function initActiveSpritePanel() {
  const backgroundRect = document.getElementById('background-rect');
  backgroundRect.addEventListener('click', deselectElement);
  
  const svg = document.querySelector('#main-svg');
  svg.addEventListener('mousemove', dragSelectedElement);
  svg.addEventListener('mouseup', () => { dragOffset = false; });
  svg.addEventListener('mousedown', mouseDownOnSVG);
}

function renderInitialShapes() {
  constructSVG(initialShape);
}
