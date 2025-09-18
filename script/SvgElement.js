// Wrapper for SVG element that allows it to be editable

class EditablePath {
  constructor(container, element) {
    this.pathData = this._parsePoints(element.getAttribute('d'));
    this.mid = this.getMidPoint(this.pathData);
    this.pathData = this.translatePathData(this.pathData, -this.mid.x, -this.mid.y);

    // Create a new SVG node
    this.element = this._createElement(element, this.pathData);
    container.appendChild(this.element);

    // Transform shape to where it's mid point should be
    this.transform = addTransform(this.element, this.mid.x, this.mid.y);

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

  drag(event) {
    if (this.dragging) {
      const translateX = event.clientX - this.dragOffset.x;
      const translateY = event.clientY - this.dragOffset.y;
      this.updateTranslation(translateX, translateY);
    }
  }

  getBounds(pathData) {
    // Get the coordinates of the path data
    // Only works for absolute coordinates and ignores coordinates of control points
    // i.e. gets the final two digits of a command
    const coords = pathData
      .filter(cmd => cmd.coords)
      .map(cmd => cmd.coords.slice(-2));

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
      const matrix = this.transform.matrix;
      this.dragOffset = {
        x: event.clientX - matrix.e,
        y: event.clientY - matrix.f
      };
      this.showBoundingBox();
    } else if (toolbarMode === 'Edit points') {
      this.element.style.cursor = 'default';
      this.hideBoundingBox();
      this.createEditPoints();
    }
  }

  mouseUp() {
    this.dragging = false;
    if (toolbarMode === 'Edit points') {
      // TODO: calculate new mid point and translate path data
    }
  }

  showBoundingBox() {
    // TODO: take into account stroke width
    const bounds = this.getBounds(this.pathData);
    selectionBox.setAttribute('x', bounds.minX);
    selectionBox.setAttribute('y', bounds.minY);
    selectionBox.setAttribute('width', bounds.maxX - bounds.minX);
    selectionBox.setAttribute('height', bounds.maxY - bounds.minY);
    translateElement(selectionBox, this.mid.x, this.mid.y);
    selectionBox.style.display = 'block';

    // this.createBoundingPoints();
  }

  hideBoundingBox() {
    selectionBox.style.display = 'none';
  }

  createBoundingPoints() {
    pointsContainer.innerHTML = '';

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
    pointsContainer.innerHTML = '';
    const matrix = this.transform.matrix;
    translateElement(pointsContainer, matrix.e, matrix.f);

    this.controlPoints = this.pathData.map((point) => {
      if (!point.coords) return null;
      return new ControlPoint(point, this.updatePath.bind(this));
    });
  }

  remove() {
    this.element.remove();
  }

  updatePath() {
    this.element.setAttribute('d', this._writePathString(this.pathData));
  }

  updateTranslation(dx, dy) {
    this.transform.setTranslate(dx, dy);
    translateElement(selectionBox, dx, dy);
    translateElement(pointsContainer, dx, dy);
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
      const newCoords = coords.map((value, index) => index % 2 === 0 ? value + dx : value + dy);
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

// Create an SVG object, based on a set of SVG elements
// This will create a list of SVGElement object to handle editing and rendering the SVG elements
function createSvgObject(elements) {
  const mainSVG = document.getElementById('sprite-elements');
  mainSVG.innerHTML = '';

  // Update svgObject to contain new elements
  svgObject = Array.from(elements).map((element) => {
    new EditablePath(mainSVG, element);
  });
  
  return svgObject;
}