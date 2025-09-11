// Variables for managing the current state
let dragOffset = false;
let selectedElement = null;
let selectedPreview = -1;
let toolbarMode = 'Move';

const SVG_NS = 'http://www.w3.org/2000/svg';

const initialShape = [
  {
    tag: 'circle',
    cx: 128,
    cy: 128,
    r: 50,
    fill: '#e4e6ff',
    stroke: '#007bff',
    'stroke-width': 6,
  },
  {
    tag: 'rect',
    x: 78,
    y: 170,
    width: 100,
    height: 50,
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