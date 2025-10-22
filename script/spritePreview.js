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

function saveAsSVG() {
  const spritePreviews = document.querySelectorAll('.sprite-preview');
  const spritePreview = spritePreviews[selectedPreview];
  const previewSVG = spritePreview.querySelector('svg');

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(previewSVG);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'sprite.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function saveAsPNG(svg, filename) {  
  // Convert SVG into an image string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);

  const svgBlob = new Blob([svgString], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const DOM_URL = window.URL || window.webkitURL || window;
  const url = DOM_URL.createObjectURL(svgBlob);

  // Draw image to canvas
  const canvas = document.createElement('canvas');
  const viewBox = svg.viewBox.baseVal;
  const img = new Image();
  img.src = url;

  img.onload = function () {
    canvas.width = viewBox.width;
    canvas.height = viewBox.height;
    canvas.getContext('2d').drawImage(img, 0, 0, viewBox.width, viewBox.height);
    DOM_URL.revokeObjectURL(url);

    // Create hidden download link that links to the new image
    const MIME_TYPE = 'image/png';
    const dlLink = document.createElement('a');
    dlLink.download = `${filename}.png`;
    dlLink.href = canvas.toDataURL(MIME_TYPE).replace(MIME_TYPE, 'image/octet-stream');
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

    // Create the link, click it and then remove it
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
  };
}

function saveAllImagesAsPng(filenamePrefix) {
  document.querySelectorAll('.sprite-preview').forEach((spritePreview, index) => {
    const svg = spritePreview.querySelector('svg');
    const filename = filenamePrefix ? `${filenamePrefix}-${index}` : `sprite-${index}`;
    saveAsPNG(svg, filename);
  });
}

function openSaveAsPngDialogue() {
  const filename = prompt('Enter filename for PNG (without extension):', 'sprite');
  if (filename !== null) {
    saveAllImagesAsPng(filename);
  }
}

// Create the initial preview SVG with example shapes
function createInitialSVG(container) {
  const svgElement = container.querySelector('svg');
  initialShape.forEach(({ tag, ...attrs }) => {
    const shapeElement = createSVGElement(tag, attrs)
    svgElement.appendChild(shapeElement);
  });
}

// Copy the selected sprite's content into the main SVG and make it editable
function updateMainSVG(container) {
  const svgElements = container.querySelector('svg');
  createSvgObjectFromElements(svgElements.children);
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

// When sprite is selected, copy its elements to the main SVG
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

