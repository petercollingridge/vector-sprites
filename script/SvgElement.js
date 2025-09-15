// Wrapper for SVG element that allows it to be editable
class EditableElement {
  constructor(container, element) {
    this.points = [];

    // Create a new SVG node
    this.element = element.cloneNode(true);
    container.appendChild(this.element);

    // Add a translation transform
    this.transform = this.element.ownerSVGElement.createSVGTransform();
    this.transform.setTranslate(0, 0);
    this.element.transform.baseVal.insertItemBefore(this.transform, 0);

    // Add event listeners
    this.element.addEventListener('mousedown', this.mouseDown.bind(this));
  }

  mouseDown(event) {
    renderEditElementPanel(this.element);

    if (toolbarMode === 'Move') {
      this.dragging = true;
      // deselectCurrentElement();
      selectedElement = this;
      this.element.style.cursor = 'move';
      this.showBoundingBox();

      const matrix = this.transform.matrix;
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
      this.transform.setTranslate(
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
    const matrix = this.transform.matrix;

    selectionBox.setAttribute('x', matrix.e + bbox.x);
    selectionBox.setAttribute('y', matrix.f + bbox.y);
    selectionBox.setAttribute('width', bbox.width);
    selectionBox.setAttribute('height', bbox.height);
    selectionBox.style.display = 'block';

    this.showEditPoints()
  }

  showEditPoints() {
    const container = document.getElementById('selection-points');
    container.innerHTML = '';

    this.points.forEach((p) => {
      const point = createSVGElement('circle');
      point.setAttribute('cx', p[0]);
      point.setAttribute('cy', p[1]);
      point.setAttribute('r', 4);
      point.setAttribute('fill', 'blue');
      container.appendChild(point);
    });
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
    this._transformToZero();
    this.points = this.pathData.map(d => d.coords).filter(d => d.length);
  }


  _parsePoints(dString) {
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
      if (digits) {
        commandValues.coords = digits;
      }
      pathData.push(commandValues);
    }

    return pathData;
  }

  _transformToZero() {
    // Move the points of the path so they are centred on the origin
    // then translate back to its original position
    const { x, y } = this._getMidPoint();
    
    this.pathData.forEach(cmd => {
      // This assumes coords is length 2
      cmd.coords = [cmd.coords[0] - x, cmd.coords[1] - y]
  });

    // Update element path d attribute
    const pathString = this._writePathString(this.pathData);
    this.element.setAttribute('d', pathString);

    // Add a translation transform
    this.transform = this.element.ownerSVGElement.createSVGTransform();
    this.transform.setTranslate(x, y);
    this.element.transform.baseVal.insertItemBefore(this.transform, 0);
  }

  _getMidPoint() {
    const coords = this.pathData.map(cmd => cmd.coords).filter(d => d.length);
    const minX = Math.min(...coords.map(p => p[0]));
    const minY = Math.min(...coords.map(p => p[1]));
    const maxX = Math.max(...coords.map(p => p[0]));
    const maxY = Math.max(...coords.map(p => p[1]));
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  }

  _writePathString(pathData) {
    const commands = pathData.map(cmd => {
      const coords = cmd.coords.join(',');
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