// Entry point for Vector Sprites scripts

document.addEventListener('DOMContentLoaded', () => {
  // Add initial transforms
  addTransform(selectionBox, 0, 0);
  addTransform(pointsContainer, 0, 0);

  addActiveSpritePanelEventHandlers();
  initToolbar();
  initPreview();
});


console.log(dStringToControlPoints(initialShape[0].d))