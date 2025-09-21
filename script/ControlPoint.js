class ControlPoint {
  constructor(x, y, path) {
    this.x = x;
    this.y = y;
    this.path = path;
    this.arm1 = null;
    this.arm2 = null;
  }

  createElement() {
    if (this.arm1) {
      this.armElement1 = createSVGElement('line', {
        x1: this.x,
        y1: this.y,
        x2: this.arm1.x,
        y2: this.arm1.y,
        stroke: 'blue',
        'stroke-width': 1
      });
      pointsContainer.appendChild(this.armElement1);
    }

    if (this.arm2) {
      this.armElement2 = createSVGElement('line', {
        x1: this.x,
        y1: this.y,
        x2: this.arm2.x,
        y2: this.arm2.y,
        stroke: 'blue',
        'stroke-width': 1
      });
      pointsContainer.appendChild(this.armElement2);
    }

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
      this.updateElementPosition(translateX, translateY);
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

  updatePosition(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    this.translate(dx, dy); 
  }

  updatePointAndArms(x, y, x1, y1, x2, y2) {
    this.x = x;
    this.y = y;
    if (this.arm1) {
      this.arm1.x = x1;
      this.arm1.y = y1;
    }
    if (this.arm2) {
      this.arm2.x = x2;
      this.arm2.y = y2;
    }
  }

  // Update position of the control point element
  updateElementPosition(x, y) {
    const dx = x - this.element.cx.baseVal.value;
    const dy = y - this.element.cy.baseVal.value;
    this.translate(dx, dy);

    this.element.setAttribute("cx", x);
    this.element.setAttribute("cy", y);

    if (this.armElement1) {
      this.armElement1.setAttribute("x1", this.x);
      this.armElement1.setAttribute("y1", this.y);
      this.armElement1.setAttribute("x2", this.arm1.x);
      this.armElement1.setAttribute("y2", this.arm1.y);
    }

    if (this.armElement2) {
      this.armElement2.setAttribute("x1", this.x);
      this.armElement2.setAttribute("y1", this.y);
      this.armElement2.setAttribute("x2", this.arm2.x);
      this.armElement2.setAttribute("y2", this.arm2.y);
    }

    if (this.path) {
      this.path.updatePath();
    }
  }
}
