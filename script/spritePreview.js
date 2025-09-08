function addSVGPreview() {
  const spritePreview = document.querySelector('.sprite-preview');
  const mainSVG = document.getElementById('main-svg');
  const elements = mainSVG.getElementById('sprite-elements');

  // Clone the main SVG content into the sprite preview
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', mainSVG.getAttribute('viewBox'));
  spritePreview.innerHTML = '';
  spritePreview.appendChild(svg);
  svg.innerHTML = elements.innerHTML;
}

function initPreview() {
  addSVGPreview();
}

