class ControlPoint {
  constructor(point, onUpdate) {
    this.cmd = point.cmd
    this.coords = point.coords;
    this.onUpdate = onUpdate;
    
    const coords = point.coords.slice(-2);
    this.element = createSVGElement('circle', { cx: coords[0], cy: coords[1], r: 5 });
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

  updatePosition(x, y) {
    const dx = x - this.element.cx.baseVal.value;
    const dy = y - this.element.cy.baseVal.value;
    for (let i = 0; i < this.coords.length; i++) {
      this.coords[i] = (i % 2) ? (this.coords[i] + dy) : (this.coords[i] + dx);
    }

    this.element.setAttribute("cx", x);
    this.element.setAttribute("cy", y);
    if (this.onUpdate) this.onUpdate();
  }
}
