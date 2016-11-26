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
        Sigma = alfa.split(",");
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
            console.log(transarr.length);

            try{

              for (var i = 0; i >= 0; i--) {
                //Split in Qi:a and Qj
                var arr = transarr[i].split(",");
                //Split in Node and Alphabet Symbol
                var param1 = arr[0].split(':');
                var fromNode = param1[0].split('(')[1];//Remove the initial '('
                var alphabetSymbol = param1[1]
                //Handling Multiple Nodes

                var regexVar = /\{(.*)\}/;//Get the string inside {}
                var regexExec = regexVar.exec(transarr[i]);
                if(regexExec.length > 1) {
                  var capturedString = regexExec[1].split(',');
                  for (var i = capturedString.length - 1; i >= 0; i--) {
                    var toNode = capturedString[i];
                    console.log("Origen:" + fromNode);
                    console.log("Destino:" + toNode);
                    console.log("Symbolo:" + alphabetSymbol);
                    transiciones.push({   
                      origen: fromNode.trim(), 
                      destino:toNode.trim(), 
                      simbolo:alphabetSymbol.trim() 
                    });
                  }
                }
              }
            }catch(ex){
              console.log(ex);
            }
            

            q0 = document.getElementById("iQ0").value.trim();
            F = document.getElementById("iFinal").value.split(",");
            document.getElementsByClassName("formulario")[0].style = "display:none;"
            dibujarPDA();
          }
        }
      }


      var cy;//Cytoscape CORE

      function dibujarPDA() {
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
             'text-halign': 'center'
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
             'content': 'data(id)',
             'background-color': '#DC143C'
           }
         },
         {
           selector: 'edge',
           css: {
             'label': 'data(label)',
             'width': 3,
             'line-color': '#ccc',
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
        { group: "nodes", data: { id: q0 }, position: {x: 145, y: 50}, classes: 'root' }
        ]));

      //CREACIÓN DE NODOS
      for (var i = Q.length - 1; i >= 0; i--) {
        if(Q[i] !== q0) {
          if( isFinalState(Q[i],F) ) {
            cy.add([
              {group:"nodes", data:{ id : Q[i].trim() } , position: { x: Math.random()*300, y: Math.random()*300 }, classes: 'final' }
              ]);
          } else {
            cy.add([
              {group:"nodes", data:{ id : Q[i].trim() } , position: { x: Math.random()*300, y: Math.random()*300 } }
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
              id: edgeId, source: transicionActual.origen, target: transicionActual.destino, label: edgeSigmaSymbol
            }
          });
          transiciones[i].duplicated = true;

        } else if(! transiciones[i].duplicated) {
          var edgeId = transicionActual.origen.concat("-").concat(transicionActual.destino);
          var edgeSigmaSymbol = transicionActual.simbolo;
          cy.add([{
            group: "edges",
            data: {
             id: edgeId, source: transicionActual.origen, target: transicionActual.destino, label: edgeSigmaSymbol 
           }
         }]);
        }
      };

      //MOSTRAR PDA
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

    function procesarCadena() {
      document.getElementById("headerContainer").style = "display:none;";
      document.getElementById("procesarCadenaForm").style = "display:none;";
      var cadena = document.getElementById("inputProcesar").value;
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

          for (var j = 0;j <= transiciones.length - 1; j++) {
            var transicionActual = transiciones[j];

            var tempArray = transicionActual.simbolo.split("->");
            var inputT = tempArray[0].split(",")[0];
            var stackElement = tempArray[0].split(",")[1];
            var pushElement = tempArray[1];

            var input = cadena[stringIndex];

            

            logElement = document.createElement("p");
            var logText = '';

            console.log(transicionActual.origen +'-'+nodoActual);

            if(transicionActual.origen == nodoActual) {

              if(inputT == "e" && stackElement == "e") {
                nodoActual = transicionActual.destino;
                if(pushElement != 'e') {
                  stackArray.push(pushElement);
                  logText += 'Inserta "'+pushElement+'" al stack,';
                  flag = true;
                  console.log(0);
                }
                
              }

              if(inputT == "e" && stackElement != "e") {
                var popElement = stackArray.pop();

                if(stackElement == popElement) {

                  logText += 'Inserta "'+pushElement+'" al stack,';
                  if(pushElement != 'e')
                    stackArray.push(pushElement);
                  nodoActual = transicionActual.destino;
                  flag = true;
                  
                } else {
                  stackArray.push(popElement);
                }

              } 

              if(inputT == input) {
        
                var popElement = stackArray.pop();
                if(stackElement == popElement) {
                  
                  nodoActual = transicionActual.destino;
                  stringIndex++;
                  if(pushElement != 'e') {
                    stackArray.push(pushElement);
                  } 
                  flag = true;
                  console.log(2);
                } else if(stackElement = "e"){
                  nodoActual = transicionActual.destino;
                  stringIndex++;
                  stackArray.push(popElement);
                  stackArray.push(pushElement);
                  flag = true;
                  console.log(2);
                } else {
                  stackArray.push(popElement);
                }

                logText += 'Consume el input '+input+',<br>';
                logText += 'busca "'+stackElement+'" en el stack,<br>';
                logText += 'inserta "'+pushElement+'" al stack,';
              }

              if(stackElement == "$") {
                
              }

              if(flag) {
                var id = nodoActual;

                //console.log('id:'+id )
                element = cy.elements('#'+id);
                logText += 'STACK: '+stackArray.toString() ;
                logText += '<br>M se encuentra en '+transicionActual.origen+' y mueve al estado '+nodoActual;
                logElement.innerHTML = logText;
                //console.log(logText);
                document.getElementById("PDA_Results").appendChild(logElement);

                prevColor = element.style().backgroundColor;

                element.animate( {
                  style: {backgroundColor: "green"},
                  duration:500
                });
              
                element.animate( {
                  style: {backgroundColor: prevColor},
                  duration:500
                });  
                
                
                break;
              } 
            }   
          };
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

    function syncLoop(iterations, process, exit){  
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

