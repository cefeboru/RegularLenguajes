var Q = [];
var Sigma;
var q0;
var F = [];
var transiciones = [];
var CyNodes = [];

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


      var cy;//Cytoscape CORE

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

      for (var i = F.length - 1; i >= 0; i--) {
        if(estado == F[i]) {
          return true;
        }
      };
      return false;
    }

    function treeNode(parent) {
      this.childs = [];
      this.parent = parent;
      this.node = "";
      this.edgeIn = ""
      this.edgeOut = ""
    }

    function treeEdge() {
      this.origin = "";
      this.target = "";
      this.character = "";
    }

    var treeRoot = new treeNode();

    function createChilds(currentNode, cadena) {
        var possiblePaths = cy.edges("[source='"+ currentNode.node +"']");

        console.log("Cadena: " + cadena + " Node: " + currentNode.node + " Paths: " + possiblePaths.length);
        for( var i=0; i < possiblePaths.length; i++ ) {
          var edge = possiblePaths[i].data();
          
          if(cadena.length > 0 && edge.label == cadena[0] ) {

            node.edgeOut = edge;
            
            var childNode = new treeNode()
            childNode.parent = node;
            childNode.edgeIn = edge;
            currentNode.childs.push(childNode)
            var newString = cadena.slice(1,cadena.length);
            reuse(childNode, newString);

          } else if(char == "e"){
            //TODO EPSILON
          }
        } 
      }

    function procesarCadena() {



      document.getElementById("headerContainer").style = "display:none;";
      document.getElementById("procesarCadenaForm").style = "display:none;";
      var cadena = document.getElementById("inputProcesar").value;
      calcPaths(cadena);
      var element = cy.elements("#"+q0);
      var prevColor = element.style().backgroundColor;

      element.animate({
        style: {backgroundColor: "green"},
        duration:1000
      });
      element.animate({ 
        style: {backgroundColor: prevColor},
        duration:1000
      });

      var logElement = document.createElement("p");
      logElement.innerHTML = "M comienza en el estado " + q0;
      document.getElementById("PDA_Results").appendChild(logElement);
      
      var stackArray = [];
      var nodoActual = q0;
      var stringIndex = 0;

      
      syncLoop(cadena.length+2, function(loop){  
        setTimeout(function(){
          var flag = false;
          var i = loop.iteration();

          loop.next();
        }, 2000);
      }, function(){
        setTimeout(function(){
          var resultDiv;

          if(isFinalState(nodoActual,F)) {
            resultDiv = document.getElementById("AcceptedMessage");
            document.getElementById("correctString").innerHTML = inputProcesar.value;

          } else {
            resultDiv = document.getElementById("DenniedMessage");
            document.getElementById("wrongString").innerHTML = inputProcesar.value;
          }
          
          resultDiv.style = "display:block;"
        },4000) 
      });

    }

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