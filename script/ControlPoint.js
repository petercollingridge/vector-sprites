class ControlPoint {
  constructor(container, point, onUpdate) {
    this.point = point
    this.container = container
    this.element = createSVGElement('circle', { cx: point[0], cy: point[1], r: 5 });
    container.appendChild(this.element);
    this.element.addEventListener('mousedown', this.mouseDown.bind(this));
    this.onUpdate = onUpdate;
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
    this.point[0] = x;
    this.point[1] = y;
    this.element.setAttribute("cx", x);
    this.element.setAttribute("cy", y);
    if (this.onUpdate) this.onUpdate();
  }
}
