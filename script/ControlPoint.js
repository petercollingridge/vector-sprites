class ControlPoint {
  constructor(x, y, path) {
    this.x = x;
    this.y = y;
    this.path = path;
    this.arm1 = null;
    this.arm2 = null;
  }

  createElement() {
    this.element = createSVGElement('circle', { cx: this.x, cy: this.y, r: 5 });
    this.element.addEventListener('mousedown', this.mouseDown.bind(this));
    pointsContainer.appendChild(this.element);
  }

  mouseDown(event) {
    this.dragging = true;
    selectedElement = this;

    this.dragOffset = {
      x: event.clientX - this.element.cx.baseVal.value,
      y: event.clientY - this.element.cy.baseVal.value
    };
  }

  drag(event) {
    if (this.dragging) {
      const translateX = event.clientX - this.dragOffset.x;
      const translateY = event.clientY - this.dragOffset.y;
      this.updatePosition(translateX, translateY);
    }
  }

  mouseUp() {
    this.dragging = false;
  } 

  // Move the control point and its arms
  translate(dx, dy) {
    this.x += dx;
    this.y += dy;
    if (this.arm1) {
      this.arm1.x += dx;
      this.arm1.y += dy;
    }
    if (this.arm2) {
      this.arm2.x += dx;
      this.arm2.y += dy;
    }
  }

  // Update position of the control point element
  updatePosition(x, y) {
    const dx = x - this.element.cx.baseVal.value;
    const dy = y - this.element.cy.baseVal.value;
    this.translate(dx, dy);

    this.element.setAttribute("cx", x);
    this.element.setAttribute("cy", y);
    if (this.path) {
      this.path.updatePath();
    }
  }
}
