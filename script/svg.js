function createSVGElement(tag, attrs) {
  const elem = document.createElementNS(SVG_NS, tag);
  for (const attr in attrs) {
    if (attr !== 'type') {
      elem.setAttribute(attr, attrs[attr]);
    }
  }
  return elem;
}

// Convert a path d string into an array of command objects
function parseDAttr(dString) {  
    const reDigits = /(-?\d*\.?\d+)/g;

    // Converts a string of digits to an array of floats
    const getDigits = function(digitString) {
      const digits = [];
      
      if (digitString) {
        let digit;
        while (digit = reDigits.exec(digitString)) {
          digits.push(parseFloat(digit[1]));
        }
      }
      return digits;
    };

    let commands;
    const pathData = [];
    const reCommands = /([ACHLMQSTVZ])([-\+\d\.\s,e]*)/gi;

    while (commands = reCommands.exec(dString)) {
      const commandValues = { command: commands[1] };
      const digits = getDigits(commands[2]);
      if (digits && digits.length) {
        commandValues.coords = digits;
      }
      pathData.push(commandValues);
    }

    return pathData;
}

// Convert a path d string into an array of control points
function dStringToControlPoints(dString, path) {
  const pathData = parseDAttr(dString);
  const points = [];

  for (let i = 0; i < pathData.length; i++) {
    const cmd = pathData[i];
    if (cmd.command !== 'Z' && cmd.coords) {
      const n = cmd.coords.length;
      const point = new NodeControlPoint(cmd.coords[n - 2], cmd.coords[n - 1], path);
      if (cmd.command === 'C') {
        // Add control points for Bezier curves
        point.addArm(1, cmd.coords[2], cmd.coords[3]);
        points[points.length - 1].addArm(2, cmd.coords[0], cmd.coords[1]);
      }
      points.push(point);
    }
  }

  // Close path
  const n = points.length;
  if (pathData[pathData.length - 1].command === 'Z' && points[0].x === points[n - 1].x && points[0].y === points[n - 1].y) {
    points[0].arms[1] = points[n - 1].arms[1];
    points.splice(n - 1, 1);
  }

  return points;
}

function controlPointsToDString(points, closed) {
  let dString = '';
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p = points[i];
    if (i === 0) {
      dString += `M${p.x} ${p.y} `;
    } else {
      if (p.arms[2] && points[i - 1].arms[1]) {
        dString += `C${points[i - 1].arms[2].x} ${points[i - 1].arms[2].y}, ${p.arms[1].x} ${p.arms[1].y}, ${p.x} ${p.y} `;
      } else {
        dString += `L${p.x} ${p.y} `;
      }
    }
  }

  // Closed path
  if (closed) {
    if (points[0].arms[1] && points[n - 1].arms[2]) {
      dString += `C${points[n - 1].arms[2].x} ${points[n - 1].arms[2].y}, ${points[0].arms[1].x} ${points[0].arms[1].y}, ${points[0].x} ${points[0].y} Z`;
    } else {
      dString += 'Z';
    }
  }

  return dString.trim();
}

function addTransform(element, dx, dy) {
  // Try to get existing translation
  const transforms = element.transform.baseVal;

  let transform;
  if (transforms.length > 0) {
    transform = transforms.getItem(0);
  } else {
    transform = element.ownerSVGElement.createSVGTransform();
    element.transform.baseVal.insertItemBefore(transform, 0);
  }

  transform.setTranslate(dx, dy);
  return transform;
}

function translateElement(element, dx, dy) {
  const transform = element.transform.baseVal.getItem(0);
  transform.setTranslate(dx, dy);
}

function clearTransforms(element) {
  const transforms = element.transform.baseVal;
  while (transforms.numberOfItems > 0) {
    transforms.removeItem(0);
  }
}

function getAttrs(element) {
  const attrs = {};
  for (const attr of element.attributes) {
    attrs[attr.name] = attr.value;
  }
  return attrs;
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
    selectedElement.element.style.cursor = 'pointer';
  }
}

// Called when deselecting all elements
function deselectElement() {
  deselectCurrentElement();
  selectedElement = null;
  emptyEditElementPanel();
  selectionBox.style.display = 'none';

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
  // const backgroundRect = document.getElementById('background-rect');
  // backgroundRect.addEventListener('click', deselectElement);

  // Add event listeners to the main SVG
  const svg = document.querySelector('#main-svg');
  svg.addEventListener('mousedown', mouseDownOnSVG);
  svg.addEventListener('mousemove', mouseMoveOnSVG);
  svg.addEventListener('mouseup', mouseUpOnSVG);
}
