	  var Q = ["q1","q2","q3"];
      var Sigma = ["a","b"];
      var q0 = "q1";
      var F = ["q3"];
      var transiciones = [];
      validof=0;
      validotra=0;
      
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
                    dibujarNFA();
                  }
                }
            }
        }
      }
	  
	  
		function DibujarNFA()
		{
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
		  //MOSTRAR NFA
		  document.getElementsByClassName("dfaCanvas")[0].style = "display: block;"
		 

		}
			
			
			function post2nfa(var postfix){
				var fragmentStack = new OwnStack();
				var completeNfa = new Fragment();
				var matchstate = new State();
				for (var i = 0; i < postfix.length(); i++){
					var c = postfix.charAt(i);
					if(isLiteral(c)){
						var literalState = new State(c);
						fragmentStack.push(new Fragment(literalState, literalState));
					}
					else if (isConcatenation(c)){
						var previous2 = fragmentStack.pop();
						var previous1 = fragmentStack.pop();
						patchFragmentToAState(previous1, previous2.getStart());
						fragmentStack.push(new Fragment(previous1.getStart(), previous2.getOutArrows() ) );
					}
					else if (isAlternation(c)){
						var previous2 = fragmentStack.pop();
						var previous1 = fragmentStack.pop();
						var newState = new State(previous1.getStart(), previous2.getStart());
						fragmentStack.push(new Fragment(newState, appendOutArrows(previous1.getOutArrows(), previous2.getOutArrows())));
					}
					else if (isStar(c)){
						var previous = fragmentStack.pop();
						var newState = new State(previous.getStart(), null);
						patchFragmentToAState(previous, newState);
						fragmentStack.push(new Fragment(newState, newState));

					}
				}
				completeNfa = fragmentStack.pop();
				patchFragmentToAState(completeNfa, matchstate);
				return completeNfa.getStart();
			}

			function isLiteral(var c) {
				return !isConcatenation(c) && !isAlternation(c) && !isStar(c);
			}

			function isStar(var c) {
				return c == '*';
			}

			function isAlternation(var c) {
				return c == '|';
			}

			function isConcatenation(var c) {
				return c == '.';
			}
			function appendOutArrows(var a, var b){
				var appended = new OwnArrayList ();
				for (var i = 0; i < a.size(); i++){
					appended.add(a.get(i));
				}
				for (var i = 0; i < b.size(); i++){
					appended.add(b.get(i));
				}
				return appended;
			}
			function patchFragmentToAState(var a, var s){
				var toBePatched = a.getOutArrows();
				for (var i = 0; i < toBePatched.size(); i++){
					var openarrows = toBePatched.get(i);
					openarrows.patch(s);
				}
			}