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

// Add new sprite preview SVG after the currently selected one
function addPreview() {
  const spritePreview = document.querySelector('.all-sprites');
  const svgContainer = document.createElement('div');
  svgContainer.classList.add('sprite-preview');

  const previews = spritePreview.querySelectorAll('.sprite-preview');

  if (selectedPreview >= previews.length - 1) {
    spritePreview.appendChild(svgContainer);
  } else {
    spritePreview.insertBefore(svgContainer, previews[selectedPreview + 1]);
  }
  
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 256 256');
  svgContainer.appendChild(svg);

  selectSprite(selectedPreview + 1);

  // Select this svg when container clicked
  svgContainer.addEventListener('click', () => selectSpriteByContainer(svgContainer));
  return svgContainer;
}

// Create a new sprite that's a copy of the selected one
function copyPreview() {
  const spritePreviews = document.querySelectorAll('.sprite-preview');
  const spritePreview = spritePreviews[selectedPreview];
  const newPreview = spritePreview.cloneNode(true);
  newPreview.addEventListener('click', () => selectSpriteByContainer(newPreview));
  spritePreview.parentNode.insertBefore(newPreview, spritePreview.nextSibling);
  selectSprite(selectedPreview + 1);
}

function deletePreview() {
  const spritePreviews = document.querySelectorAll('.sprite-preview');
  const spritePreview = spritePreviews[selectedPreview];
  spritePreview.remove();
  selectSprite(selectedPreview)
}

// Create the initial preview SVG with example shapes
function createInitialSVG(container) {
  const svgElement = container.querySelector('svg');
  initialShape.forEach(({ tag, ...attrs }) => {
    const shapeElement = createSVGElement(tag, attrs)
    svgElement.appendChild(shapeElement);
  });
}

// Copy the selected sprite's content to the main SVG
function updateMainSVG(container) {
  const svgElements = container.querySelector('svg');
  createSvgObject(svgElements.children);
  // createEditableElements(svgElements.children);
  // deselectElement();
}

function selectSpriteByContainer(container) {
  const allSprites = document.querySelectorAll('.sprite-preview');
  allSprites.forEach((sprite, index) => {
    const isSelected = sprite === container;
    sprite.classList.toggle('selected', isSelected);

    if (isSelected && selectedPreview !== index) {
      selectedPreview = index;
      updateMainSVG(container);
    }
  });
}

function selectSprite(index) {
  selectedPreview = index;
  let container;
  const allSprites = document.querySelectorAll('.sprite-preview');
  allSprites.forEach((sprite, i) => {
    if (i === index) {
      container = sprite;
    }
    sprite.classList.toggle('selected', i === index);
  });
  updateMainSVG(container)
}

function initPreview() {
  const initialPreview = addPreview();
  createInitialSVG(initialPreview);
  selectSprite(0);
}

