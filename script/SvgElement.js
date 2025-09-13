// Wrapper for SVG element that allows it to be editable
class EditableElement {
  constructor(container, element) {
    this.points = [];

    this.element = element.cloneNode(true);
    container.appendChild(this.element);

    this.element.addEventListener('mousedown', this.mouseDown.bind(this));
  }

  mouseDown(event) {
    this.showBoundingBox();
  }

  showBoundingBox() {
    const bbox = this.element.getBBox();
    console.log('Bounding box:', bbox);
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

  showBoundingBox() {
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