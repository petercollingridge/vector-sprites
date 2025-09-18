// Wrapper for SVG element that allows it to be editable
class EditableElement {
  constructor(container, element) {
    // this.points = [];

    // // Create a new SVG node
    // this.element = element.cloneNode(true);
    // container.appendChild(this.element);

    // // Add a translation transform
    // this.shapetransform = this.element.ownerSVGElement.createSVGTransform();
    // this.shapetransform.setTranslate(0, 0);
    // this.element.transform.baseVal.insertItemBefore(this.shapetransform, 0);

    // // Add event listeners
    // this.element.addEventListener('mousedown', this.mouseDown.bind(this));
  }

  mouseDown(event) {
    renderEditElementPanel(this.element);

    if (toolbarMode === 'Move') {
      this.dragging = true;
      // deselectCurrentElement();
      selectedElement = this;
      this.element.style.cursor = 'move';
      this.showBoundingBox();

      const matrix = this.shapeTransform.matrix;
      this.dragOffset = {
        x: event.clientX - matrix.e,
        y: event.clientY - matrix.f
      };
    }
  }

  mouseUp() {
    this.dragging = false;
  } 

  drag(event) {
    if (this.dragging) {
      this.shapeTransform.setTranslate(
        event.clientX - this.dragOffset.x,
        event.clientY - this.dragOffset.y
      );
      this.showBoundingBox();
    }
  }

  showBoundingBox() {
    // TODO: take into account stroke width
    // TODO: Apply the same transform as the element
    // Update position of the edit points
    const selectionBox = document.getElementById('selection-box');
    const bbox = this.element.getBBox();
    const matrix = this.shapeTransform.matrix;

    selectionBox.setAttribute('x', matrix.e + bbox.x);
    selectionBox.setAttribute('y', matrix.f + bbox.y);
    selectionBox.setAttribute('width', bbox.width);
    selectionBox.setAttribute('height', bbox.height);
    selectionBox.style.display = 'block';

    this.showEditPoints()
  }

  showEditPoints() {
    // const container = document.getElementById('control-points');
    // container.innerHTML = '';

    // this.points.forEach((p) => {
    //   const point = createSVGElement('circle');
    //   point.setAttribute('cx', p[0]);
    //   point.setAttribute('cy', p[1]);
    //   point.setAttribute('r', 4);
    //   point.setAttribute('fill', 'blue');
    //   container.appendChild(point);
    // });
  }

  update(attrs) {
    for (const key in attrs) {
      this.element.setAttribute(key, attrs[key]);
    }
  }

  remove() {
    this.element.remove();
  }
}

class EditableRect extends EditableElement {
  constructor(container, element) {
    super(container, element);

    const x = parseFloat(this.element.getAttribute('x'));
    const y = parseFloat(this.element.getAttribute('y'));
    const width = parseFloat(this.element.getAttribute('width'));
    const height = parseFloat(this.element.getAttribute('height'));

    this.points = [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height]
    ];
  }

  getBoundingBox() {
    console.log(this.points);
  }
}

class EditablePath extends EditableElement {
  constructor(container, element) {
    super(container, element);

    this.pathData = this._parsePoints(element.getAttribute('d'));
    this.mid = this.getMidPoint(this.pathData);
    this.pathData = this.translatePathData(this.pathData, -this.mid.x, -this.mid.y);

    // Create a new SVG node
    this.element = this._createElement(element, this.pathData);
    container.appendChild(this.element);

    // Set up control elements
    this.selectionBox = document.getElementById('selection-box');
    this.pointsContainer = document.getElementById('control-points');
    this._addTransforms(this.mid.x, this.mid.y);

    // Add event listeners
    this.element.addEventListener('mousedown', this.mouseDown.bind(this));
  }

  _createElement(element, pathData) {
    // Update element path d attribute
    const pathString = this._writePathString(pathData);
    
    const newElement = element.cloneNode(true);
    newElement.setAttribute('d', pathString);
    return newElement;
  }

  _addTransforms(x, y) {
    this.shapeTransform = addTransform(this.element, x, y);
    this.boxTransform = addTransform(this.selectionBox, x, y);
    this.pointsTransform = addTransform(this.pointsContainer, x, y);
  }

  drag(event) {
    if (this.dragging) {
      const translateX = event.clientX - this.dragOffset.x;
      const translateY = event.clientY - this.dragOffset.y;
      this.updateTranslation(translateX, translateY);
    }
  }

  getBounds(pathData) {
    const coords = pathData.map(cmd => cmd.coords).filter(Boolean);
    return {
      minX: Math.min(...coords.map(p => p[0])),
      minY: Math.min(...coords.map(p => p[1])),
      maxX: Math.max(...coords.map(p => p[0])),
      maxY: Math.max(...coords.map(p => p[1])),
    };
  }

  getMidPoint(pathData) {
    const bounds = this.getBounds(pathData);
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2
    };
  }

  mouseDown(event) {
    renderEditElementPanel(this.element);

    if (toolbarMode === 'Move') {
      this.dragging = true;
      // deselectCurrentElement();
      selectedElement = this;
      this.element.style.cursor = 'move';
      const matrix = this.shapeTransform.matrix;
      this.dragOffset = {
        x: event.clientX - matrix.e,
        y: event.clientY - matrix.f
      };
      this.showBoundingBox();
    } else if (toolbarMode === 'Edit points') {
      this.createEditPoints();
    }
  }

  showBoundingBox() {
    // TODO: take into account stroke width
    const bounds = this.getBounds(this.pathData);
    this.selectionBox.setAttribute('x', bounds.minX);
    this.selectionBox.setAttribute('y', bounds.minY);
    this.selectionBox.setAttribute('width', bounds.maxX - bounds.minX);
    this.selectionBox.setAttribute('height', bounds.maxY - bounds.minY);
    this.selectionBox.style.display = 'block';

    // this.createBoundingPoints();
  }

  createBoundingPoints() {
    this.pointsContainer.innerHTML = '';

    const p = this.getBounds(this.pathData);
    const points = [
      [p.minX, p.minY], [p.maxX, p.minY], [p.maxX, p.maxY], [p.minX, p.maxY]
    ];

    // points.forEach((point) => {
    //   const controlPoint = new ControlPoint(this.pointsContainer, point[0], point[1]);
    //   this.points.push(controlPoint);
    // });
  }

  createEditPoints() {
    this.pointsContainer.innerHTML = '';

    this.controlPoints = this.pathData.map((point) => {
      if (!point.coords) return null;
      return new ControlPoint(this.pointsContainer, point.coords, this.updatePath.bind(this));
    });
  }

  updatePath() {
    this.element.setAttribute('d', this._writePathString(this.pathData));
  }

  updateTranslation(dx, dy) {
    this.shapeTransform.setTranslate(dx, dy);
    this.boxTransform.setTranslate(dx, dy);
    this.pointsTransform.setTranslate(dx, dy);
  }

  _parsePoints(dString) {
    // Convert a path d attribute string into an array of command objects
    const reCommands = /([ACHLMQSTVZ])([-\+\d\.\s,e]*)/gi;
    const reDigits = /(-?\d*\.?\d+)/g;
    const pathData = [];

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

  translatePathData(pathData, dx, dy) {
    // Move the points of the path so they are centred on the origin
    // then translate back to its original position

    return pathData.map(({ command, coords }) => {
      if (!coords) {
        return { command };
      }
      const newCoords = [coords[0] + dx, coords[1] + dy];
      return { command, coords: newCoords };
    });
  }

  _writePathString(pathData) {
    const commands = pathData.map(cmd => {
      const coords = cmd.coords ? cmd.coords.join(',') : '';
      return `${cmd.command} ${coords}`;
    });
    return commands.join(' ');
  }
}

const EditableClasses = {
  rect: EditableRect,
  path: EditablePath,
};

const EditableElementFactory = (type) => EditableClasses[type] || EditableElement;

// Create an SVG object, based on a set of SVG elements
// This will create a list of SVGElement object to handle editing and rendering the SVG elements
function createSvgObject(elements) {
  const mainSVG = document.getElementById('sprite-elements');
  mainSVG.innerHTML = '';

  // Update svgObject to contain new elements
  svgObject = Array.from(elements).map((element) => {
    const EditableElement = EditableElementFactory(element.tagName.toLowerCase());
    return new EditableElement(mainSVG, element);
  });
  
  return svgObject;
}