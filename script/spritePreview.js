// Clone the main SVG content into the sprite preview
function createPreview() {
  const mainSVG = document.getElementById('main-svg');
  const spritePreview = document.querySelector('.sprite-preview');
  const previewSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  previewSVG.setAttribute('viewBox', mainSVG.getAttribute('viewBox'));
  spritePreview.appendChild(previewSVG);
}

// Update the sprite preview with the current main SVG content
function updatePreview() {
  const spritePreviews = document.querySelectorAll('.sprite-preview');
  const spritePreview = spritePreviews[selectedPreview];
  const previewSVG = spritePreview.querySelector('svg');

  const sourceElements = document.getElementById('sprite-elements');
  previewSVG.innerHTML = sourceElements.innerHTML;
}

// Add new sprite preview SVG
function addPreview() {
  const spritePreview = document.querySelector('.all-sprites');
  const svgContainer = document.createElement('div');
  svgContainer.classList.add('sprite-preview');
  spritePreview.appendChild(svgContainer);
  
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 256 256');
  svgContainer.appendChild(svg);

  // Select this svg when container clicked
  svgContainer.addEventListener('click', () => selectSprite(svgContainer));
  return svgContainer;
}

// Create the initial preview SVG with example shapes
function createInitialSVG(container) {
  const svgElement = container.querySelector('svg');
  initialShape.forEach(({ tag, ...attrs }) => {
    const shapeElement = createSVGElement(tag, attrs)
    svgElement.appendChild(shapeElement);
  });
}

function selectSprite(container) {
  const allSprites = document.querySelectorAll('.sprite-preview');
  allSprites.forEach((sprite, index) => {
    const isSelected = sprite === container;
    if (isSelected) {
      selectedPreview = index;
    }
    sprite.classList.toggle('selected', isSelected);
  });

  // Copy the selected sprite's content to the main SVG
  const svgElements = container.querySelector('svg');
  createEditableElements(svgElements.children);
}

function initPreview() {
  const initialPreview = addPreview();
  createInitialSVG(initialPreview);
  selectSprite(initialPreview);
}

