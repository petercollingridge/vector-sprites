class ControlPoint {
  constructor(x, y, path) {
    this.x = x;
    this.y = y;
    this.path = path;
  }

  showPoint() {
    if (!this.element) {
      this.element = createSVGElement('circle', { cx: this.x, cy: this.y, r: 5 });
      this.element.addEventListener('mousedown', this.mouseDown.bind(this));
      pointsContainer.appendChild(this.element);
    }
  }

  drag(event) {
    if (this.dragging) {
      const translateX = event.clientX - this.dragOffset.x;
      const translateY = event.clientY - this.dragOffset.y;
      const dx = translateX - this.element.cx.baseVal.value;
      const dy = translateY - this.element.cy.baseVal.value;

      this.translate(dx, dy);

      if (this.path) {
        this.path.updatePath();
      }

      if (this.onUpdate) {
        this.onUpdate();
      }
    }
  }

  mouseDown(event) {
    this.dragging = true;
    selectedElement = this;

    this.dragOffset = {
      x: event.clientX - this.element.cx.baseVal.value,
      y: event.clientY - this.element.cy.baseVal.value
    };

    if (this._mouseDown) {
      this._mouseDown(event);
    }
  }

  mouseUp() {
    this.dragging = false;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.setElementPosition();
  }

  translate(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.setElementPosition();

    if (this._translate) {
      this._translate(dx, dy);
    }
  }

  // Update position of the control point element
  setElementPosition() {
    if (this.element) {
      this.element.setAttribute("cx", this.x);
      this.element.setAttribute("cy", this.y);
    }
  }
}

// A control point that controls the position of a path node and its control arms
class NodeControlPoint extends ControlPoint {
  constructor(x, y, path) {
    super(x, y, path);
    this.arms = {};
    this.armElements = {};
  }

  addArm(armNum, x, y) {
    if (!this.arms[armNum]) {
      this.arms[armNum] = new ControlPoint(x, y, this.path);
      this.arms[armNum].onUpdate = () => this.updateArmElement(armNum);
    } else {
      this.arms[armNum].updatePosition(x, y);
    }
  }

  showPoint() {
    Object.values(this.arms).forEach((arm, index) => {
      const armElement = createSVGElement('line', {
        x1: this.x,
        y1: this.y,
        x2: arm.x,
        y2: arm.y,
        stroke: 'blue',
        'stroke-width': 1
      });
      this.armElements[index + 1] = armElement;
      pointsContainer.appendChild(armElement);
    });

    this.element = createSVGElement('circle', { cx: this.x, cy: this.y, r: 5 });
    this.element.addEventListener('mousedown', this.mouseDown.bind(this));
    pointsContainer.appendChild(this.element);
  }

  _mouseDown() {
    this._createControlArmPoints();
  }

  _createControlArmPoints() {
    armsContainer.innerHTML = '';
    Object.values(this.arms).forEach(arm => {
      arm.showPoint();
    });
  }

  _translate(dx, dy) {
    // When control point moves, also move arms
    Object.values(this.arms).forEach(arm => {
      arm.translate(dx, dy);
    });

    Object.keys(this.arms).forEach(this.updateArmElement.bind(this));
  }

  updateArmElement(armNum) {
    const arm = this.arms[armNum];
    const armElement = this.armElements[armNum];
    armElement.setAttribute("x1", this.x);
    armElement.setAttribute("y1", this.y);
    armElement.setAttribute("x2", arm.x);
    armElement.setAttribute("y2", arm.y);
  }

  // Called when creating/scaling an ellipse
  updatePointAndArms(x, y, x1, y1, x2, y2) {
    this.x = x;
    this.y = y;
    if (this.arms[1]) {
      this.arms[1].x = x1;
      this.arms[1].y = y1;
    }
    if (this.arms[2]) {
      this.arms[2].x = x2;
      this.arms[2].y = y2;
    }
  }

  // When the control point is moved, also update the arms
  _setElementPosition(x, y) {
    Object.values(this.arms).forEach(arm => {
      arm.setElementPosition(x, y);
    });
  }
}
