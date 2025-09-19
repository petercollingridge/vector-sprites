const newShapeStyles = {
    fill: 'white',
    stroke: 'black',
    'stroke-width': 2
};

// Add event handlers to toolbar button to activate the respective tool
function initToolbar() {
	const toolbar = document.querySelector('.toolbar');
	if (!toolbar) return;

	const buttons = toolbar.querySelectorAll('button');
	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			// Remove selected class from all buttons
			buttons.forEach(b => b.classList.remove('selected'));
			// Add selected class to clicked button
			btn.classList.add('selected');
			// Set mode
			toolbarMode = btn.getAttribute('title');
		});
	});
}

function addRect(event) {
  const coords = clientToSVGCoords(event);
  return addEditableElement({
    tag: 'path',
    d: `M${coords.x} ${coords.y}`,
    ...newShapeStyles,
  });
}

function addEllipse(event) {
  const coords = eventToSVGCoords(event);
  return addEditableElement({
    tag: 'ellipse',
    cx: coords.x,
    cy: coords.y,
    rx: 0,
    ry: 0,
    ...newShapeStyles,
  });
}

function addPolyline(event) {
  const coords = eventToSVGCoords(event);
  toolbarMode = 'Adding polyline';
  return addEditableElement({
    tag: 'polyline',
    points: `${coords.x},${coords.y}`,
    ...newShapeStyles,
    'fill-opacity': 0,
  });
}

// function startDrag(event) {
//   if (!selectedElement) return;
//   dragOffset = { x: event.clientX, y: event.clientY };

//   // Get all the transforms currently on this element
//   const transforms = selectedElement.transform.baseVal;
//   // Ensure the first transform is a translate transform
//   if (transforms.length === 0 ||
//       transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
//     // Create an transform that translates by (0, 0)
//     const translate = selectedElement.ownerSVGElement.createSVGTransform();
//     translate.setTranslate(0, 0);
//     // Add the translation to the front of the transforms list
//     selectedElement.transform.baseVal.insertItemBefore(translate, 0);
//   } else {
//     const matrix = transforms.getItem(0).matrix;
//     dragOffset.x -= matrix.e;
//     dragOffset.y -= matrix.f;
//   }
// }

function dragSelectedElement(event) {
  if (selectedElement) {
    selectedElement.drag(event);
  }
}

function scaleRect(event) {
  if (selectedElement && dragOffset) {
    const currentPosition = { x: event.clientX, y: event.clientY };
    const x = Math.min(dragOffset.x, currentPosition.x);
    const y = Math.min(dragOffset.y, currentPosition.y);
    const pos = clientToSVGCoords(x, y);
    const width = Math.abs(currentPosition.x - dragOffset.x);
    const height = Math.abs(currentPosition.y - dragOffset.y);
    updateSelectedElement({
      x: pos.x,
      y: pos.y,
      width: width,
      height: height
    });
  }
}

function scaleEllipse(event) {
  if (selectedElement && dragOffset) {
    const currentPosition = { x: event.clientX, y: event.clientY };
    const x = Math.min(dragOffset.x, currentPosition.x);
    const y = Math.min(dragOffset.y, currentPosition.y);
    const width = Math.abs(currentPosition.x - dragOffset.x);
    const height = Math.abs(currentPosition.y - dragOffset.y);
    const pos = clientToSVGCoords(x + width / 2, y + height / 2);
    updateSelectedElement({
      cx: pos.x,
      cy: pos.y,
      rx: width / 2,
      ry: height / 2
    });
  }
}

function movePolylinePoint(event) {
  if (selectedElement) {
    const coords = eventToSVGCoords(event);
    const fixedPoints = selectedElement.getAttribute('points').trim().split(' ').slice(0, -1);
    selectedElement.setAttribute('points', `${fixedPoints.join(' ')} ${coords.x},${coords.y}`);
  }
}

function addPolylinePoint() {
  if (selectedElement) {
    const points = selectedElement.getAttribute('points').trim();
    const pointsArr = points.split(' ');
    const [x1, y1] = pointsArr[pointsArr.length - 1].split(',').map(Number);

    // If last two points very close then stop drawing line
    if (pointsArr.length > 1) {
      const [x2, y2] = pointsArr[pointsArr.length - 2].split(',').map(Number);
      const dist = Math.hypot(x2 - x1, y2 - y1);
      if (dist < 3) {
        return endPolyline();
      }
    }

    selectedElement.setAttribute('points', `${points} ${x1},${y1}`);
  }
}

function endPolyline() {
  toolbarMode = 'Add polyline';
  updatePreview();
}

const mouseDownFunctions = {
  'Add rectangle': addRect,
  'Add ellipse': addEllipse,
  'Add polyline': addPolyline,
};

const mouseMoveFunctions = {
  'Move': dragSelectedElement,
  'Edit points': dragSelectedElement,
  'Add rectangle': scaleRect,
  'Add ellipse': scaleEllipse,
  'Adding polyline': movePolylinePoint,
};

function mouseDownOnSVG(event) {
  const func = mouseDownFunctions[toolbarMode];
  if (func) {
    selectedElement = func(event);
    dragOffset = { x: event.clientX, y: event.clientY };
  }
}

function mouseMoveOnSVG(event) {
  const func = mouseMoveFunctions[toolbarMode];
  if (func) {
    func(event);
  }
}

function mouseUpOnSVG(event) {
  if (selectedElement) {
    console.log(selectedElement);
    selectedElement.mouseUp(event);
  }
  dragOffset = false;
  if (toolbarMode === 'Adding polyline') {
    addPolylinePoint(event);
  } else {
    updatePreview();
  }
}
