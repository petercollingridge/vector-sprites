// Variables for managing the current state
let dragOffset = false;
let selectedElement = null;
let svgObject = null;
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