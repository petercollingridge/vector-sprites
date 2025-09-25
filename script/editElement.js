const PARSE_STYLE_PROP = {
  'number': parseFloat,
  'color': value => {
    // If value is in the form rgb(r, g, b), convert to hex
    const rgbMatch = value.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      return (
        '#' +
        [r, g, b]
          .map(x => x.toString(16).padStart(2, '0'))
          .join('')
      );
    }
    // If already hex or other format, return as is
    return value;
  }
};

function createInputElement(name, type, value, container) {
  const input = createElement('input', {type, value, id: name + '-input' });
  const label = createElement('label', {}, name + ': ');
  label.appendChild(input);
  container.appendChild(label);
  return input;
}

function createTransformEditOptions(name, editorDiv, value, onUpdate) {
  const input = createInputElement(name, 'number', value, editorDiv);

}

// Create input element for editing
function createStyleEditOptions(editorDiv, element, prop, value) {
  const input = createInputElement(prop.name, prop.type, value, editorDiv);

  input.addEventListener('input', (e) => {
    let newValue = e.target.value;
    // For number types, ensure value is a valid number
    if (prop.type === 'number') {
      newValue = parseFloat(newValue);
      if (isNaN(newValue)) return;
    }
    element.setAttribute(prop.name, newValue);
  });
}

// When a shape is selected, render its properties in the edit panel
function renderEditElementPanel(element) {
  const editorDiv = document.getElementById('edit-element');
  editorDiv.innerHTML = '';

  if (!element) {
    emptyEditElementPanel();
    return;
  }

  const computedStyle = window.getComputedStyle(element);

  // Delete element button
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = 'Delete Element';
  deleteButton.addEventListener('click', () => {
    deselectElement();
    element.remove();
    emptyEditElementPanel();
  });
  editorDiv.appendChild(deleteButton);

  // Position and size (x, y, width, height)
  editorDiv.appendChild(createElement('h3', {}, 'Position & Size'));
  const transforms = element.transform.baseVal;
  const matrix = transforms.getItem(0).matrix;
  const translateX = createInputElement('x', 'number', matrix.e, editorDiv);
  const translateY = createInputElement('y', 'number', matrix.f, editorDiv);
  translateX.addEventListener('input', (e) => {
    const newX = parseFloat(e.target.value);
    if (isNaN(newX)) return;
    selectedElement.updateTranslation(newX, matrix.f);
  });
  translateY.addEventListener('input', (e) => {
    const newY = parseFloat(e.target.value);
    if (isNaN(newY)) return;
    selectedElement.updateTranslation(matrix.e, newY);
  });
  
  // Edit styles
  editorDiv.appendChild(createElement('h3', {}, 'Styles'));
  STYLE_PROPS_LIST.forEach(prop => {
    let value = computedStyle.getPropertyValue(prop.name);
    value = PARSE_STYLE_PROP[prop.type](value);
    createStyleEditOptions(editorDiv, element, prop, value);
  });
}

function emptyEditElementPanel() {
  const editorDiv = document.getElementById('edit-element');
  editorDiv.innerHTML = '';
  editorDiv.textContent = 'Click on a shape to edit it';
}