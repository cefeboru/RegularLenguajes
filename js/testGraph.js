$(function(){ // on dom ready

var cy = cytoscape({
  container: document.getElementById('cy'),
  
  boxSelectionEnabled: false,
  autounselectify: true,
  
  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center'
      }
    },
    {
      selector: '$node > node',
      css: {
        'padding-top': '10px',
        'padding-left': '10px',
        'padding-bottom': '10px',
        'padding-right': '10px',
        'text-valign': 'top',
        'text-halign': 'center',
        'background-color': '#bbb'
      }
    },
    {
      selector: 'edge',
      css: {
        'target-arrow-shape': 'triangle'
      },
      style: {
        'label': 'data(label)',
        'width': 3,
        'line-color': '#ccc'
      }
    },
    {
      selector: ':selected',
      css: {
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      }
    }
  ],
  
  elements: {
    nodes: [
      { data: { id: 'a' }, position: { x: 215, y: 85 } },
      { data: { id: 'd' }, position: { x: 150, y: 175 } },
      { data: { id: 'f' }, position: { x: 300, y: 175 } }
    ],
    edges: [
      { data: { id: 'ad', source: 'a', target: 'd', label: '1' } },
      { data: { id: 'ae', source: 'a', target: 'f', label: '2'} }
      
    ]
  },
  
  layout: {
    name: 'preset',
    padding: 5
  }
});

}); // on dom ready