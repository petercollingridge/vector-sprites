function createElement(tag, attrs, text) {
  const elem = document.createElement(tag);
  for (const attr in attrs) {
    elem.setAttribute(attr, attrs[attr]);
  }
  if (text) {
    elem.textContent = text;
  }
  return elem;
}
