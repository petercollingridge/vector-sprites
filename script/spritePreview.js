function createPreview() {
  // Clone the main SVG content into the sprite preview
  const mainSVG = document.getElementById('main-svg');
  const spritePreview = document.querySelector('.sprite-preview');
  const previewSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  previewSVG.setAttribute('viewBox', mainSVG.getAttribute('viewBox'));
  spritePreview.appendChild(previewSVG);
}

function updatePreview(index) {
  // Update the sprite preview with the current main SVG content
  const spritePreview = document.querySelector('.sprite-preview');
  const previewSVG = spritePreview.children[index];

  const elements = document.getElementById('sprite-elements');
  previewSVG.innerHTML = elements.innerHTML;
}

function addSprite() {
  const spritePreview = document.querySelector('.all-sprites');
  const svgContainer = document.createElement('div');
  svgContainer.classList.add('sprite-preview');
  spritePreview.appendChild(svgContainer);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 256 256');
  svgContainer.appendChild(svg);
}

function initPreview() {
  createPreview();
  updatePreview(0);

}

