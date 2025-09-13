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
    const selectionBox = document.getElementById('selection-box');
    const bbox = this.element.getBBox();
    const matrix = this.transform.matrix;

    selectionBox.setAttribute('x', matrix.e + bbox.x - 2);
    selectionBox.setAttribute('y', matrix.f + bbox.y - 2);
    selectionBox.setAttribute('width', bbox.width + 4);
    selectionBox.setAttribute('height', bbox.height + 4);
    selectionBox.style.display = 'block';
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

    const x = this.element.getAttribute('x');
    const y = this.element.getAttribute('y');
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');

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

const EditableClasses = {
  rect: EditableRect,
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