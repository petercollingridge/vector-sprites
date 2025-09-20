// Entry point for Vector Sprites scripts

document.addEventListener('DOMContentLoaded', () => {
  // Add initial transforms
  addTransform(selectionBox, 0, 0);
  addTransform(pointsContainer, 0, 0);

  addActiveSpritePanelEventHandlers();
  initToolbar();
  initPreview();
});


const testDString = initialShape[0].d;
const controlPoints = dStringToControlPoints(testDString);
const dString = controlPointsToDString(controlPoints);
console.log(testDString);
console.log(controlPoints);
console.log(dString);

