class ControlPoint {
  constructor(container, x, y) {
    this.x = x;
    this.y = y;
    this.element = this.createElement();
    container.appendChild(this.element);
  }

  createElement() {
    const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    point.setAttribute("cx", this.x);
    point.setAttribute("cy", this.y);
    point.setAttribute("r", 5);
    point.setAttribute("fill", "red");
    return point;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.element.setAttribute("cx", x);
    this.element.setAttribute("cy", y);
  }
}
