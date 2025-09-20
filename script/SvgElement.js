// Wrapper for SVG element that allows it to be editable

class EditablePath {
  constructor(attrs) {
    // Extract points and shift so they are centered on the origin
    this.points = dStringToControlPoints(attrs.d, this);
    this.mid = this.getMidPoint(this.points);
    this.translate(-this.mid.x, -this.mid.y);
    this.closed = true;
    this.curved = true;

    // Create a new SVG node
    this.element = this._createElement(attrs);
    mainSVG.appendChild(this.element);

    // Transform shape to where it's mid point should be
    this.transform = addTransform(this.element, this.mid.x, this.mid.y);

    // Add event listeners
    this.element.addEventListener('mousedown', this.mouseDown.bind(this));
  }

  _createElement(attrs) {
    const newElement = createSVGElement('path', attrs);
    const pathString = controlPointsToDString(this.points, this.closed);
    // Update element path d attribute
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

  getBounds(points) {
    return {
      minX: Math.min(...points.map(p => p.x)),
      minY: Math.min(...points.map(p => p.y)),
      maxX: Math.max(...points.map(p => p.x)),
      maxY: Math.max(...points.map(p => p.y)),
    };
  }

  getMidPoint(points) {
    const bounds = this.getBounds(points);
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
      // Hide control points
      pointsContainer.innerHTML = '';
      const matrix = this.transform.matrix;
      this.dragOffset = {
        x: event.clientX - matrix.e,
        y: event.clientY - matrix.f
      };
      this.showBoundingBox();
    } else if (toolbarMode === 'Edit points') {
      this.element.style.cursor = 'default';
      this.hideBoundingBox();
      this.showControlPoints();
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
    const bounds = this.getBounds(this.points);
    selectionBox.setAttribute('x', bounds.minX);
    selectionBox.setAttribute('y', bounds.minY);
    selectionBox.setAttribute('width', bounds.maxX - bounds.minX);
    selectionBox.setAttribute('height', bounds.maxY - bounds.minY);

    const matrix = this.transform.matrix;
    translateElement(selectionBox, matrix.e, matrix.f);
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

  // Create SVG element for this path's control points
  showControlPoints() {
    pointsContainer.innerHTML = '';
    const matrix = this.transform.matrix;
    translateElement(pointsContainer, matrix.e, matrix.f);

    this.points.forEach((point) => {
      point.createElement();
    });
  }

  remove() {
    this.element.remove();
  }

  updatePath() {
    const pathString = controlPointsToDString(this.points, this.closed);
    this.element.setAttribute('d', pathString);
  }

  updateTranslation(dx, dy) {
    this.transform.setTranslate(dx, dy);
    translateElement(selectionBox, dx, dy);
    translateElement(pointsContainer, dx, dy);
  }

  translate(dx, dy) {
    // Move the points of the path so they are centred on the origin
    // then translate back to its original position
    this.points.forEach((point) => {
      point.translate(dx, dy);
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
function createSvgObjectFromElements(elements) {
  mainSVG.innerHTML = '';

  // Update svgObject to contain new elements
  svgObject = Array.from(elements).map((element) => {
    const attrs = getAttrs(element);
    return new EditablePath(attrs);
  });
  
  return svgObject;
}

// TODO: Create a function to create path from attrs
function createSVGPath(attrs) {
  const element = new EditablePath(attrs);
  svgObject.push(element);
  return element;
}