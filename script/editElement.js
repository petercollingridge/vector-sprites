// List of styles that can be edited

const STYLE_PROPS_LIST = [
  {name: 'fill', type: 'color'},
  {name: 'stroke', type: 'color'},
  {name: 'stroke-width', type: 'number'},
  {name: 'opacity', type: 'number'}
];

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

// When a shape is selected, render its properties in the edit panel
function renderEditElementPanel(element) {
  const editElementDiv = document.getElementById('edit-element');
  editElementDiv.innerHTML = '';

  if (element && element instanceof SVGElement) {
    const computedStyle = window.getComputedStyle(element);

    STYLE_PROPS_LIST.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop.name);

      // Create input element for editing
      const input = document.createElement('input');
      input.type = prop.type;
      input.value = PARSE_STYLE_PROP[prop.type](value);
      input.id = prop.name + '-input';

      input.addEventListener('input', (e) => {
        let newValue = e.target.value;
        // For number types, ensure value is a valid number
        if (prop.type === 'number') {
          newValue = parseFloat(newValue);
          if (isNaN(newValue)) return;
        }
        element.setAttribute(prop.name, newValue);
      });

      // Create label for input
      const label = document.createElement('label');
      label.textContent = prop.name + ': ';
      label.appendChild(input);
      editElementDiv.appendChild(label);
    });

  } else {
    editElementDiv.textContent = 'Click on a shape to edit it';
  }
}