//Agregado por AG
   
        
      var Q = ["q1","q2","q3"];
      var Sigma = ["a","b"];
      var q0 = "q1";
      var F = ["q3"];
      var transiciones = [];
      validof=0;
      validotra=0;
      /*  
      transiciones.push({ origen:"q1" , destino:"q2" , simbolo:"a" });
      transiciones.push({ origen:"q1" , destino:"q3" , simbolo:"b" });
      transiciones.push({ origen:"q2" , destino:"q2" , simbolo:"a" });
      transiciones.push({ origen:"q2" , destino:"q2" , simbolo:"b" });
      transiciones.push({ origen:"q3" , destino:"q3" , simbolo:"a" });
      transiciones.push({ origen:"q3" , destino:"q3" , simbolo:"b" });
       */ 
      function submitData() {
        var alfa = document.getElementById("iA").value;
        var estados = document.getElementById("iQ").value;
        var trans = document.getElementById("iSigma").value;
        Q = estados.split(",");
        Sigma = alfa.split(",");


        if (estados.length == 0) {
            window.alert("Conjunto de estados no valido");
        }
        else 
        {
            if (alfa.length == 0) {
                window.alert("Alfabeto no valido");
            }
            else {
                validaF()
                if (validof == 0) {
                    window.alert("Conjunto de estados finales no valido");
                }   
                else {  
                  validaTrans();
                  if (validotra==0){
                     window.alert("transiciones no validas"); 
                  } 
                  else{ 
                    result = [];
                    transarr = trans.split(";");
                    for (var i = transarr.length - 1; i >= 0; i--) {
                      var arr = transarr[i].split(":");
                      result.push(arr[0].trim().substring(1));
                      result.push(arr[1].trim());
                      result.push(arr[2].trim().substring(0,2));
                    }
                    for (var i = 0; i <= result.length-1; i=i+3) {
                      transiciones.push({ origen: result[i] , destino:result[i+2] , simbolo:result[i+1] });
                    }

                    q0 = document.getElementById("iQ0").value;
                    F = document.getElementById("iFinal").value.split(",");
                    document.getElementsByClassName("formulario")[0].style = "display:none;"
                    dibujarDFA();
                  }
                }
            }
        }
      }
    function validaF() {  
          var estados = document.getElementById("iQ").value;
          var arrestados = estados.split(",");
          var final = document.getElementById("iFinal").value;
          var arrfinal = final.split(",");
          var estado;
          for (var i = 0; i < arrfinal.length; i++) {
              estado = arrfinal[i];
              for (var j = 0; j < arrestados.length; j++) {
                  if (estado == arrestados[j]) {
                      validof = 1;
                      break;
                  }
                  else {
                      validof = 0;
                  }
              }
              if (validof == 0) {
                  break
              }
          }

      }
      function validaTrans()
      {
            var trans = document.getElementById("iSigma").value;
            result = [];
            transarr = trans.split(";");
            var eorigen="";
            var edestino="";
            var strans="";
            validotra=0;
            var estados = document.getElementById("iQ").value;
            var arrestados = estados.split(",");
            var alfa = document.getElementById("iA").value;
            var arralfa=alfa.split(",");
            for (var i = transarr.length - 1; i >= 0; i--) {
              var arr = transarr[i].split(":");
              result.push(arr[0].trim().substring(1));
              result.push(arr[1].trim());
              result.push(arr[2].trim().substring(0,2));
            }
            for (var i = 0; i <= result.length-1; i=i+3) {
               eorigen = result[i];
               edestino =result[i+2];
               strans = result[i+1];
               //Validar Estado Origen
                for (var j = 0; j < arrestados.length; j++) {
                    if (eorigen == arrestados[j]) {
                        validotra = 1;
                        break;
                    }
                    else {
                        validotra = 0;
                    }               
                 }
                //Validar Estado Destino
                if(validotra==1)
                {
                  for (var j = 0; j < arrestados.length; j++) {
                      if (edestino == arrestados[j]) {
                          validotra = 1;
                          break;
                      }
                      else {
                          validotra = 0;
                      }               
                   }   
                 }
                if(validotra==1)
                {                  
                   //Validar Simbolos 
                  for (var j = 0; j < arralfa.length; j++) {
         
                     if (strans == arralfa[j]) {
                          validotra = 1;
                          break;
                      }
                      else {
                          validotra = 0;
                      }                
                  }                
                }
                  
              if (validotra == 0) {
                  break
              }               
              //transiciones.push({ origen: result[i] , destino:result[i+2] , simbolo:result[i+1] });
            }
      }
      var cy;//Cytoscape CORE

     function dibujarDFA() {
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

      cy.add([
        { group: "nodes", data: { id: q0 }, position: {x: 145, y: 50}, classes: 'root' }
      ]);

      //CREACIÓN DE NODOS
      for (var i = Q.length - 1; i >= 0; i--) {
        if(Q[i] !== q0) {
          if( isFinalState(Q[i],F) ) {
            console.log("Es estado final: " + Q[i]);
            cy.add([
              {group:"nodes", data:{ id : Q[i] } , position: { x: Math.random()*300, y: Math.random()*300 }, classes: 'final' }
            ]);
          } else {
            cy.add([
              {group:"nodes", data:{ id : Q[i] } , position: { x: Math.random()*300, y: Math.random()*300 } }
            ]);  
          }
          
        }
      };
      
      //CREACIÓN DE TRANSICIONES
      for (var i = transiciones.length - 1; i >= 0; i--) {
        var transicionActual = transiciones[i];
        var evaluarTransicion = isDuplicated(transicionActual, transiciones, i);
        console.log(evaluarTransicion);

        if(evaluarTransicion.duplicated) {
          var index = evaluarTransicion.duplicatedIndex;
          var edgeId = transicionActual.origen.concat("-").concat(transicionActual.destino);
          var edgeSigmaSymbol = transicionActual.simbolo.concat(",").concat(transiciones[index].simbolo);
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
      /*cy.add([{ 
                group: "edges", 
                data: { 
                  id: EdgeId, source: transicionActual.origen, target: transicionActual.destino, label: alphabetSymbol
                }
      }]);*/


        //TODO
      //MOSTRAR DFA
      document.getElementsByClassName("dfaCanvas")[0].style = "display: block;"
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

     function getBack(){
        document.getElementById("headerContainer").style = "display:block;";
        document.getElementById("procesarCadenaForm").style = "display:block;";   
        document.getElementById("DFA_Results").innerHTML = "";
        document.getElementById("AcceptedMessage").style = "display:none;"
        document.getElementById("DenniedMessage").style = "display:none;"
     }

     function getBackForm() {
        document.getElementsByClassName("dfaCanvas")[0].style = "display: none;"
        document.getElementsByClassName("formulario")[0].style = "display:block;"
     }


    function procesarCadena() {
      document.getElementById("headerContainer").style = "display:none;";
      document.getElementById("procesarCadenaForm").style = "display:none;";
      var cadena = document.getElementById("inputProcesar").value;
      var start = cy.elements("#"+q0);
      var prevColor = start.style().backgroundColor;

      start.animate({ 
        style: {backgroundColor: "green"},
        duration:1000
      });
      start.animate({ 
        style: {backgroundColor: prevColor},
        duration:1000
      });

      var logElement = document.createElement("p");
      logElement.innerHTML = "M comienza en el estado " + q0;
      document.getElementById("DFA_Results").appendChild(logElement);
      
      var nodoActual = q0;
      syncLoop(cadena.length, function(loop){  
          setTimeout(function(){
              var i = loop.iteration();

                for (var j = 0;j <= transiciones.length - 1; j++) {
                  var transicionActual = transiciones[j];

                  if(transicionActual.origen == nodoActual && transicionActual.simbolo === cadena[i]) {

                    var logElement = document.createElement("p");
                    logElement.innerHTML = "Lee el elemento " + cadena[i]+"<br>";
                    logElement.innerHTML = logElement.innerHTML + "M esta en "+nodoActual
                      +" y se mueve a "+transicionActual.destino;

                    document.getElementById("DFA_Results").appendChild(logElement);

                    console.log("Lee el elemento =" + cadena[i]);
                    console.log("M esta en "+nodoActual+" y se mueve a "+transicionActual.destino);

                    nodoActual = transicionActual.destino;
                    var element = cy.elements("#"+nodoActual);
                    prevColor = element.style().backgroundColor;

                    element.animate( {
                      style: {backgroundColor: "green"},
                      duration:1000
                    });
                    if(i != cadena.length) {
                      element.animate( {
                        style: {backgroundColor: prevColor},
                        duration:1000
                      });  
                    }
                    
                    break;
                  }
                };
              
              loop.next();
          }, 4000);
      }, function(){
        setTimeout(function(){
          var resultDiv;
          if(isFinalState(nodoActual,F)) {

            resultDiv = document.getElementById("AcceptedMessage");
            document.getElementById("correctString").innerHTML = document.getElementById("inputProcesar").value;
          } else {

            resultDiv = document.getElementById("DenniedMessage");
            document.getElementById("wrongString").innerHTML = document.getElementById("inputProcesar").value;
          }
          resultDiv.style = "display:block;";
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

