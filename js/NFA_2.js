function treeNode(parent, node) {
  this.childs = [];
  this.parent = parent;
  this.nodeName = node;
  this.edgeIn = ""
  this.edgeOut = ""
}

function treeEdge() {
  this.origin = "";
  this.target = "";
  this.character = "";
}

function tree() {
	this.nodes = [];
	this.edges = [];

	this.addNode = function(node) {
		this.nodes.push(node);
	}
}

var cy;//Cytoscape CORE
var Q = [];
var Sigma;
var q0;
var F = [];
var transiciones = [];
var CyNodes = [];
var treeRoot;
var pathTree = new tree();


function syncLoop(iterations, process, exit) {  
  var index = 0,
  done = false,
  shouldExit = false;
  var loop = {
    next:function(){
      if(done){
        if(shouldExit && exit){
                    return exit(); // Exit if we're done
                  }
                }
            // If we're not finished
            if(index < iterations){
                index++; // Increment our index
                process(loop); // Run our process, pass in the loop
            // Otherwise we're done
          } else {
                done = true; // Make sure we say we're done
                if(exit) exit(); // Call the callback on exit
              }
            },
            iteration:function(){
            return index - 1; // Return the loop number we're on
          },
          break:function(end){
            done = true; // End the loop
            shouldExit = end; // Passing end as true means we still call the exit callback
          }
        };
        loop.next();
        return loop;
}

function submitData() {
	var alfa = document.getElementById("iA").value;
	var estados = document.getElementById("iQ").value;
	var trans = document.getElementById("iSigma").value;

	Q = estados.split(",");

	//Trim all states
	for (var i = Q.length - 1; i >= 0; i--) {
	  Q[i] = Q[i].trim();
	};

	Sigma = alfa.split(",");
	for (var i = Sigma.length - 1; i >= 0; i--) {
	  Sigma[i] = Sigma[i].trim();
	};

	transarr = trans.split(";")

	if (estados.length == 0) {
	  window.alert("Conjunto de estados no valido");
	}
	else 
	{
	  if (alfa.length == 0) {
	    window.alert("Alfabeto no valido");
	  }
	  else {
	    transarr = trans.split(";");//Split the transicions

	    try{

	      for (var i = 0; i < transarr.length; i++) {
	        //Split in Qi:a and Qj
	        var arr = transarr[i].split(",");
	        //Split in Node and Alphabet Symbol
	        var param1 = arr[0].split(':');
	        var fromNode = param1[0].split('(')[1];//Remove the initial '('
	        var alphabetSymbol = param1[1]
	        //Handling Multiple Nodes

	        var regexVar = /\{(.*)\}/;//Get the string inside {}
	        var regexExec = regexVar.exec(transarr[i]);
	        //console.log("Regex Match: " + regexExec[1]);
	        if(regexExec.length > 1) {//If there is a match inside {} the array will be at least size 2
	          var capturedString = regexExec[1].split(',');
	          for( var j= 0; j < capturedString.length; j++){
	            var toNode = capturedString[j];
	            //console.log("Origen: '" + fromNode + "'");
	            //console.log("Destino: '" + toNode + "'");
	            //console.log("Symbolo: '" + alphabetSymbol + "'");
	            transiciones.push({   
	              origen: fromNode.trim(), 
	              destino:toNode.trim(), 
	              simbolo:alphabetSymbol.trim() 
	            });
	            //console.log("--------------------------------------");
	          }
	        }
	      }
	    }catch(ex){
	      console.log(ex);
	    }
	    

	    q0 = document.getElementById("iQ0").value.trim();
	    F = document.getElementById("iFinal").value.split(",");
	    document.getElementsByClassName("formulario")[0].style = "display:none;"
	    dibujarNFA();
	  }
	}
}

function dibujarNFA() {
       //INICIALIZACIÓN DE CYTOSCAPE
       cy = cytoscape({
         container: document.getElementById('cy'),
         
         boxSelectionEnabled: false,
         autounselectify: true,
         
         style: [
         {
           selector: 'node',
           css: {
             'content': 'data(id)',
             'text-valign': 'center',
             'text-halign': 'center',
             'background-color': '#DFDFDF'
           }
         },
         {
           selector: '.root',
           css: {
             'content': 'data(id)',
             'background-color': '#FFFF00'
           }
         },
         {
           selector: '.final',
           css: {
             'borderWidth':'2'
           }
         },
         {
           selector: 'edge',
           css: {
             'label': 'data(label)',
             'width': 3,
             'line-color': '#CCCCCC',
             'target-arrow-shape': 'triangle'
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

         layout: {
           name: 'preset',
           padding: 5
         }
       });

      //NODO Q0

      CyNodes.push(cy.add([
        { 
          group: "nodes", 
          data: { id: q0.trim() }, 
          position: { x: 145, y: 50 }, 
          classes: 'root' }
        ]));

      //CREACIÓN DE NODOS
      console.log("Creando Nodos");
      for (var i = Q.length - 1; i >= 0; i--) {
        console.log("   Iterarion: " + i);
        var currentNode = Q[i].trim();
        console.log("   currentNode: " + currentNode);
        if(currentNode != q0.trim()) {

          var finalState = isFinalState(currentNode,F);
          console.log("   Is final state? " + finalState);

          if( finalState ) {
            //Does it already exist?
            var tempNode = cy.$("#"+currentNode);

            if(tempNode.length > 0) {
              //If exists just add the final class
              tempNode.addClass("final");
            } else {
              //Add the new node if it does not exist
              var ele = cy.add([{
                group:"nodes", 
                data:{ id : currentNode } , 
                position: { x: Math.random()*300, y: Math.random()*300 }
              }]);
              ele.addClass("final")  
            }
          } else {
            cy.add([
              {
                group:"nodes", 
                data:{ id : currentNode } , 
                position: { x: Math.random()*300, y: Math.random()*300 } 
              }
            ]);  
          }
          
        }
      };
      
      //CREACIÓN DE TRANSICIONES
      for (var i = transiciones.length - 1; i >= 0; i--) {
        var transicionActual = transiciones[i];
        var evaluarTransicion = isDuplicated(transicionActual, transiciones, i);

        if(evaluarTransicion.duplicated) {
          var index = evaluarTransicion.duplicatedIndex;
          var edgeId = transicionActual.origen.concat("-").concat(transicionActual.destino);
          var edgeSigmaSymbol = transicionActual.simbolo.concat(" | ").concat(transiciones[index].simbolo);
          cy.add({
            group: "edges",
            data: {
              id: edgeId, 
              source: transicionActual.origen, 
              target: transicionActual.destino, 
              label: edgeSigmaSymbol
            }
          });
          transiciones[i].duplicated = true;

        } else if(! transiciones[i].duplicated) {
          var edgeId = transicionActual.origen.concat("-").concat(transicionActual.destino);
          var edgeSigmaSymbol = transicionActual.simbolo;
          cy.add([{
            group: "edges",
            data: {
             id: edgeId, 
             source: transicionActual.origen, 
             target: transicionActual.destino, 
             label: edgeSigmaSymbol 
            }
         }]);
        }
      };

      //MOSTRAR NFA
      document.getElementsByClassName("pdaCanvas")[0].style = "display: block;"
}


function isDuplicated(transicionActual, transiciones, index) {
  for (var i = index; i >= 0; i--) {
    var bool1 = Boolean(transicionActual.origen === transiciones[i].origen);
    var bool2 = Boolean(transicionActual.destino === transiciones[i].destino);
    var bool3 = Boolean(transicionActual.simbolo !== transiciones[i].simbolo);
    var duplicated = Boolean(bool1 && bool2 && bool3);

    if(Boolean(duplicated)) {
      return {duplicated: true, duplicatedIndex: i};
    }
  };
  return {duplicated:false};
}

function isFinalState(estado, F) {
	if(estado == null || estado == undefined) {
		return false;
	}
	for (var i = F.length - 1; i >= 0; i--) {
		if(estado == F[i]) {
		  return true;
		}
	};
	return false;
}

var debug;
var string;
function procesarCadena() {
	treeRoot = new treeNode(null, q0);
	var cadena = document.getElementById("inputProcesar").value;
	createChilds(treeRoot, cadena);
	getLeafChilds();
	pathNodes = pathNodes.reverse();

	//Element P for logs
	var logElement = document.createElement("p");

	//Make initial node log
	var startNode = pathNodes[0].split(",")[0];

	//Inner HTML of logP
	string = "Comienza en el estado '" + startNode + "' <br><br>";

	logElement.innerHTML = string;

	//Append Log Element to Body
	document.getElementById("NFA_Results").appendChild(logElement);

	//Hide Elements
	document.getElementById("headerContainer").style = "display:none;";
    document.getElementById("procesarCadenaForm").style = "display:none;";

    var startCyNode = cy.elements("#"+startNode);
    var prevColor = startCyNode.style().backgroundColor;

    startCyNode.animate({ 
        style: {backgroundColor: "green"},
        duration:1000
    });
	startCyNode.animate({ 
		style: {backgroundColor: prevColor},
		duration:1000
	});

	if(pathNodes.length > 0) {
		syncLoop(pathNodes.length-1, function(loop){
			setTimeout(function() {
				
				var i = loop.iteration() + 1;
				
				var params = pathNodes[i].split(",");
				var currentNode = params[0];
				var symbol = params[1];

				string += "Lee es simbolo '" + symbol + "' <br>";
				string += "Se mueve al estado '" + currentNode + "' <br><br>";
				
				logElement.innerHTML = string;

				var currentCyNode = cy.elements("#"+currentNode);
				prevColor = currentCyNode.style().backgroundColor;

			    currentCyNode.animate({ 
			        style: {backgroundColor: "green"},
			        duration:800
			    });
				currentCyNode.animate({ 
					style: {backgroundColor: prevColor},
					duration:800
				});

				loop.next();
			}, 2500);
		}, function(){
			setTimeout(function(){
	         	var resultDiv;
		        resultDiv = document.getElementById("AcceptedMessage");
		        document.getElementById("correctString").innerHTML = document.getElementById("inputProcesar").value;
	         	resultDiv.style = "display:block;";
	        },1000)
		});
	} else {

		resultDiv = document.getElementById("DenniedMessage");
		document.getElementById("wrongString").innerHTML = document.getElementById("inputProcesar").value;	
	}
}

function createChilds(currentNode, cadena) {
    var possiblePaths = cy.edges("[source='"+ currentNode.nodeName +"']");

    console.log("Cadena: "+cadena+" Node: "+currentNode.nodeName+" Paths: " + possiblePaths.length);

    for( var i=0; i < possiblePaths.length; i++ ) {
      var edge = possiblePaths[i].data();
      //console.log(edge);
 
      var edgeSymbols = edge.label.split("|");

      //Remove Spaces
      for(var j=0; j < edgeSymbols.length; j++) {
      	edgeSymbols[j] = edgeSymbols[j].trim();
      	console.log(edgeSymbols[j]);
      }

      //Keep going if the string is long enough and the symbol is in the edge
      if( cadena.length > 0 && edgeSymbols.indexOf(cadena[0]) >= 0 ) {

        //currentNode.edgeOut = edge;
        var simpleEdge = new treeEdge();
        simpleEdge.origin = currentNode;
        simpleEdge.target = edge.target;
        simpleEdge.character = edgeSymbols[edgeSymbols.indexOf(cadena[0])];
        
        var childNode = new treeNode(currentNode, simpleEdge.target)
        childNode.edgeIn = simpleEdge;

        pathTree.addNode(childNode);

        currentNode.childs.push(childNode)

        var newString;

        if(edgeSymbols.indexOf("e") >= 0) {
        	var tempNode = childNode;
        	tempNode.edgeIn.character = "e"; 
        	
			createChilds(childNode, cadena);
        }

        newString = cadena.slice(1,cadena.length);
        createChilds(childNode, newString);

      } else if( edgeSymbols.indexOf("e") ){
        //TODO EPSILON
      }
    } 
  }

var pathNodes = [];

function getLeafChilds() {
	for (var i = pathTree.nodes.length - 1; i >= 0; i--) {
		try{
			if(pathTree.nodes[i].childs.length == 0) {	
				var node = pathTree.nodes[i];
				
				if(isFinalState(node.nodeName, F)) {
					getFinalNodePath(node);
					break;
				}	
			}
		} catch(ex) {
			console.log(ex)
		}	
	}
}

function getFinalNodePath(recursiveNode) {
	var tempNode = recursiveNode;
	while(tempNode.parent != null || tempNode.parent != "" || tempNode.parent != undefined) {
		var symbol = tempNode.edgeIn.character;
		pathNodes.push(tempNode.nodeName + "," + symbol);
		var parentNode = tempNode.parent;
		tempNode = parentNode;

		if(tempNode == null) {
			break;
		}
	}
}