// Variables for managing the current state
let dragOffset = false;
let selectedElement = null;
let svgObject = null;
let selectedPreview = -1;
let toolbarMode = 'Move';

const mainSVG = document.getElementById('sprite-elements');
const selectionBox = document.getElementById('selection-box');
const pointsContainer = document.getElementById('control-points');

const SVG_NS = 'http://www.w3.org/2000/svg';

const newShapeStyles = {
    fill: '#007bff',
    stroke: 'black',
    'stroke-width': 2
};

const initialShape = [
  {
    tag: 'path',
    d: "M178 128 C178 155.614, 155.614 178, 128 178 C100.386 178, 78 155.614, 78 128 C78 100.386, 100.386 78, 128 78 C155.614 78, 178 100.386, 178 128 Z",
    fill: '#e4e6ff',
    stroke: '#007bff',
    'stroke-width': 6,
  },
  {
    tag: 'path',
    d: 'M80 170 L178 170 L178 220 L80 220 Z',
    fill: '#e7c5a0ff',
    stroke: '#ff9d00ff',
    'stroke-width': 6,
  }
];

// List of styles that can be edited

const STYLE_PROPS_LIST = [
  {name: 'fill', type: 'color'},
  {name: 'stroke', type: 'color'},
  {name: 'stroke-width', type: 'number'},
  {name: 'opacity', type: 'number'},  
  {name: 'fill-opacity', type: 'number'}
];