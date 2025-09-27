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

    this.createControlArmPoints();
  }

  createControlArmPoints() {
    armsContainer.innerHTML = '';
    if (this.arm1) {
      this.controlPoint1 = this._createControlArmPoints(this.arm1);
    }
    if (this.arm2) {
      this.controlPoint2 = this._createControlArmPoints(this.arm2);
    }
  }

  _createControlArmPoints(p){
    const controlPoint = createSVGElement('circle', { cx: p.x, cy: p.y, r: 4 });
    armsContainer.appendChild(controlPoint);
    return controlPoint;
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
      this._updateArm(1);
    }
    if (this.armElement2) {
      this._updateArm(2);
    }

    if (this.path) {
      this.path.updatePath();
    }
  }

  _updateArm(n) {
    const armElement = this[`armElement${n}`];
    const arm = this[`arm${n}`];
    const controlPoint = this[`controlPoint${n}`];

    if (!armElement || !arm) return;
    armElement.setAttribute("x1", this.x);
    armElement.setAttribute("y1", this.y);
    armElement.setAttribute("x2", arm.x);
    armElement.setAttribute("y2", arm.y);
    controlPoint.setAttribute("cx", arm.x);
    controlPoint.setAttribute("cy", arm.y);
  }
}
