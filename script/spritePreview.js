// Clone the main SVG content into the sprite preview
function createPreview() {
  const mainSVG = document.getElementById('main-svg');
  const spritePreview = document.querySelector('.sprite-preview');
  const previewSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  previewSVG.setAttribute('viewBox', mainSVG.getAttribute('viewBox'));
  spritePreview.appendChild(previewSVG);
}

// Update the sprite preview with the current main SVG content
function updatePreview(index) {
  const spritePreview = document.querySelector('.sprite-preview');
  const previewSVG = spritePreview.children[index];

  const elements = document.getElementById('sprite-elements');
  previewSVG.innerHTML = elements.innerHTML;
}

// Add new sprite preview SVG
function addPreview(initialShapes) {
  const spritePreview = document.querySelector('.all-sprites');
  const svgContainer = document.createElement('div');
  svgContainer.classList.add('sprite-preview');
  spritePreview.appendChild(svgContainer);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 256 256');

  if (initialShapes) {
    
  }

  svgContainer.appendChild(svg);
  return svg;
}

// Create the initial preview SVG with example shapes
function createInitialSVG(initialSVG) {
  initialShape.forEach(({ tag, ...attrs }) => {
    const shapeElement = createSVGElement(tag, attrs)
    initialSVG.appendChild(shapeElement);
  });
}

function selectSprite(index) {
  const allSprites = document.querySelectorAll('.sprite-preview');
  allSprites.forEach((sprite, i) => {
    sprite.classList.toggle('selected', i === index);
  });

  // Copy the selected sprite's content to the main SVG
  const selectedSprite = allSprites[index].children[0];
  const elements = selectedSprite.children;
  createEditableElements(elements);
}

function initPreview() {
  const initialPreview = addPreview();
  createInitialSVG(initialPreview);
  selectSprite(0);
}

