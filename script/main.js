// Entry point for Vector Sprites scripts

document.addEventListener('DOMContentLoaded', () => {
  addTransform(selectionBox, 0, 0);
  addTransform(pointsContainer, 0, 0);

  addActiveSpritePanelEventHandlers();
  initToolbar();
  initPreview();
});
