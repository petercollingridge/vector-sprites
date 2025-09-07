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
  const element = createSVGElement(tag, attrs);

  element.addEventListener('mousedown', (event) => {
    if (toolbarMode === 'Move') {
      selectElement(element);
      startDrag(event);
      event.stopPropagation();
    }
  });
  SPRITE_ELEMENTS_GROUP.appendChild(element);
  return element;
}


function constructSVG(shapes) {
  shapes.forEach(createEditableElement);
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

function scaleRect(event) {
  if (selectedElement && dragOffset) {
    const currentPosition = { x: event.clientX, y: event.clientY };
    const x = Math.min(dragOffset.x, currentPosition.x);
    const y = Math.min(dragOffset.y, currentPosition.y);
    const pos = clientToSVGCoords(x, y);
    const width = Math.abs(currentPosition.x - dragOffset.x);
    const height = Math.abs(currentPosition.y - dragOffset.y);
    updateSelectedElement({
      x: pos.x,
      y: pos.y,
      width: width,
      height: height
    });
  }
}

function scaleEllipse(event) {
  if (selectedElement && dragOffset) {
    const currentPosition = { x: event.clientX, y: event.clientY };
    const x = Math.min(dragOffset.x, currentPosition.x);
    const y = Math.min(dragOffset.y, currentPosition.y);
    const width = Math.abs(currentPosition.x - dragOffset.x);
    const height = Math.abs(currentPosition.y - dragOffset.y);
    const pos = clientToSVGCoords(x + width / 2, y + height / 2);
    updateSelectedElement({
      cx: pos.x,
      cy: pos.y,
      rx: width / 2,
      ry: height / 2
    });
  }
}

function mouseDownOnSVG(event) {
  const addShape = addShapes[toolbarMode];
  if (addShape) {
    selectedElement = addShape(event);
    dragOffset = { x: event.clientX, y: event.clientY };
  }
}

const mouseMoveOnSVGFuncs = {
  'Move': dragSelectedElement,
  'Add rectangle': scaleRect,
  'Add ellipse': scaleEllipse,
  // 'Add polyline': scaleSelectedElement,
};

function mouseMoveOnSVG(event) {
  const mouseMoveFunc = mouseMoveOnSVGFuncs[toolbarMode];
  if (mouseMoveFunc) {
    mouseMoveFunc(event);
  }
}

function addActiveSpritePanelEventHandlers() {
  const backgroundRect = document.getElementById('background-rect');
  backgroundRect.addEventListener('click', deselectElement);
  
  const svg = document.querySelector('#main-svg');
  svg.addEventListener('mousemove', mouseMoveOnSVG);
  svg.addEventListener('mouseup', () => { dragOffset = false; });
  svg.addEventListener('mousedown', mouseDownOnSVG);
}

function renderInitialShapes() {
  constructSVG(initialShape);
}
