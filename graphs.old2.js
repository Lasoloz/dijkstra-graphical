// Renderer object with special functions for graph rendering
// id => parent div id; width => canvas width; height => canvas height;
// nodeSize => size of the nodes - needed for edge endpoints calculation
// borderStyleStr => style of canvas border
function Renderer(id, nodeSize = 12, renderLabels = true,
                  width = 400, height = 400,
                  borderStyleStr = "1px solid black") {
    // Create a canvas with the specified settings
    this.canvas = document.createElement("canvas");
    this.canvas.style.border = borderStyleStr;
    this.canvas.width = width;
    this.canvas.height = height;

    // Set node size
    this.nodeSize = nodeSize;

    // Create a context for drawing
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "12px Arial";

    // Do we need to render labels?
    this.renderLabels = renderLabels;

    // Append context to parent div
    var parent = document.getElementById(id);
    parent.appendChild(this.canvas);


    // Set text styles --- ! TODO: dynamic settings for these
    this.setNormalTextStyle = function() {
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "black";
    }
    this.setDistTextStyle = function(color="red") {
        this.ctx.font = "9px Arial";
        this.ctx.fillStyle = color;
    }

    // Clear content of context (when we have to update something in the graph)
    this.clear = function(styleStr = "#FFFFFF") {
        this.ctx.fillStyle = styleStr;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.ctx.fillStyle = "#000000";
    }


    this.renderNode = function(x, y, state=0, label="", dist=Infinity) {
        // Render a node
        // console.log(x, y, "44614f");
        // this.ctx.strokeStyle = "#44614f";
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        switch (state) {
        case 0:
            // A node checked
            this.ctx.strokeStyle = "#232323";
            break;
        case 1:
            // An active node (its neighbours are being tested)
            this.ctx.strokeStyle = "#55cf65";
            break;
        case 2:
            // Finished node: it's distance from the centre is already
            // calculated
            this.ctx.strokeStyle = "#254532";
            break;
        default:
            this.ctx.strokeStyle = "#000000";
        }

        // Draw node
        this.ctx.arc(x, y, this.nodeSize, 0, 2*Math.PI);
        // Draw label
        if (this.renderLabels && label != "") {
            // I should consider finding a better and faster way of doing this
            this.setNormalTextStyle();
            this.ctx.fillText(label, x-3.5*label.length, y);
            this.setDistTextStyle();
            if (dist == Infinity) {
                var distString = "∞".toString();
                this.ctx.fillText(distString, x-2*distString.length, y+8);
            } else {
                var distString = dist.toString();
                this.ctx.fillText(distString, x-2*distString.length, y+8);
            }
        }
        this.ctx.stroke();
    }

    this.edgeStateSetup = function(state) {
        // Set up everything for edge rendering
        // Magic values of state:
        //  0 -> valid edge, but never used;
        //  1 -> valid edge, used but not finalized;
        //  2 -> edge being checked
        //  3 -> valid edge, finalized;
        switch (state) {
        case 0:
            // Set style for unchecked
            this.ctx.strokeStyle = "#606060";
            this.ctx.lineWidth = 1;
            // console.log("Here state 0!", x1, y1, x2, y2);
            break;
        case 1:
            // Set style for edge being checked
            this.ctx.strokeStyle = "#55cf65";
            this.ctx.lineWidth = 2;
            // console.log("Here state 1!", x1, y1, x2, y2);
            break;
        case 2:
            // Set style for inactive (finished, but not used)
            this.ctx.strokeStyle = "#121212";
            this.ctx.lineWidth = 1;
            break;
        case 3:
            // Set style for active (finsihed and used)
            this.ctx.strokeStyle = "#559070";
            this.ctx.lineWidth = 1;
            // console.log("Here state 2!", x1, y1, x2, y2);
            break;
        default:
            this.ctx.strokeStyle = "#000000";
            this.ctx.lineWidth = 1;
            // console.log("Here state default!", x1, y1, x2, y2);
        }
        this.setDistTextStyle(this.ctx.strokeStyle);
    }

    this.renderNormalEdge = function(x1, y1, x2, y2,
                                     state=0, length=0) {
        // Render an undirected edge
        this.ctx.beginPath();

        // Set up style of edge
        this.edgeStateSetup(state);
        // We don't want to start from the centre of the node, so we calculate
        // some offsets and new x1, x2, y1, y2
        var lineAngle = Math.atan2(x1 - x2, y1 - y2);
        var lineAngleSin = Math.sin(lineAngle);
        var lineAngleCos = Math.cos(lineAngle);
        x1 -= this.nodeSize * lineAngleSin;
        y1 -= this.nodeSize * lineAngleCos;
        x2 += this.nodeSize * lineAngleSin;
        y2 += this.nodeSize * lineAngleCos;
        // Starting position
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);

        this.ctx.stroke();

        if (this.renderLabels && length) {
            // this.setDistTextStyle(); // edgeStateSetup it!
            this.ctx.fillText(length.toString(),
                              (x1 + x2) / 2,
                              (y1 + y2) / 2);
        }
    }

    this.renderDirectedEdge = function(x1, y1, x2, y2,
                                       state=0, length=0) {
        // variable length: if zero, do not draw text else draw the length of 
        // the edge

        this.ctx.beginPath();

        // We don't want to start from the centre of the node, so we calculate
        // some offsets and new x1, x2, y1, y2
        var lineAngle = Math.atan2(x1 - x2, y1 - y2);
        var lineAngleSin = Math.sin(lineAngle);
        var lineAngleCos = Math.cos(lineAngle);
        x1 -= this.nodeSize * lineAngleSin;
        y1 -= this.nodeSize * lineAngleCos;
        x2 += this.nodeSize * lineAngleSin;
        y2 += this.nodeSize * lineAngleCos;

        // Setup line style
        this.edgeStateSetup(state);

        // Calculate control point for curve
        var delta_x = x2 - x1;
        var delta_y = y2 - y1;
        var control_x = (x1 + x2) / 2 - delta_y / 4;
        var control_y = (y1 + y2) / 2 + delta_x / 4;

        // Calculate the angle of the arrow for the directed graph
        var arrowAngle = Math.atan2(control_x - x2, control_y - y2) + Math.PI;
        this.ctx.moveTo(x1, y1);

        // Directed graph: we want some place for both edges
        this.ctx.quadraticCurveTo(control_x, control_y, x2, y2);

        // For the arrow at the end of line
        this.ctx.moveTo(
            x2 - (10 * Math.sin(arrowAngle - Math.PI / 6)),
            y2 - (10 * Math.cos(arrowAngle - Math.PI / 6))
        );

        // Draw the arrow
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(
            x2 - (10 * Math.sin(arrowAngle + Math.PI / 6)),
            y2 - (10 * Math.cos(arrowAngle + Math.PI / 6))
        );

        this.ctx.stroke();

        // If there is a weight
        if (this.renderLabels && length) {
            this.ctx.fillText(length.toString(),
                              control_x,
                              control_y);
        }
    }
}




function GNode(x, y, label="") {
    // Node for creating an adjacency matrix-like structure
    this.x = x;
    this.y = y;

    this.edges = new Array();

    this.label = label;

    this.state = 0;

    this.dist = Infinity;

    this.pushEdge = function(nodeIndex, edgeWeight) {
        this.edges.push({index: nodeIndex, weight: edgeWeight, state: 0});
    }

    this.reset = function() {
        this.state = 0;
        this.dist = Infinity;

        var length = this.edges.length;
        for (var i = 0; i < length; ++i) {
            this.edges[i].state = 0;
        }
    }
}


function Graph(createObj=0, freq_x=100, freq_y=100,
               resolution_x=4, resolution_y=4) {
    // Graph container object
    // Create mode magic values (these would be enums in C++ :/ )
    //  0 - Graph nodes on grid (undirected, weighted based on distances)
    //  1 - Graph nodes on grid with some alignment differences and missing
    //      nodes (directed, weighted based on distances)
    //  <array of edges> - Create graph from list of edges ()

    this.nodeNum = resolution_x * resolution_y;
    this.nodes = new Array(this.nodeNum);

    this.directed;
    this.weighted;

    if (createObj === 0) {
        // Create nodes on grid:
        var y = freq_y / 2;
        for (var i = 0; i < resolution_y; ++i) {
            var x = freq_x / 2;
            for (var j = 0; j < resolution_x; ++j) {
                var index = i * resolution_x + j;

                this.nodes[index] = new GNode(x, y, index.toString());

                // We calculate using this offset ->
                // minimising no. of multiplications
                var offset = (i-1)*resolution_x+j;

                // Upper neighbours
                if (i > 0) {
                    if (j > 0) {
                        this.nodes[index].pushEdge(offset - 1, 141);
                    }

                    this.nodes[index].pushEdge(offset, 100);

                    if (j < resolution_x - 1) {
                        this.nodes[index].pushEdge(offset + 1, 141);
                    }
                }

                // Left-right neighbours
                offset += resolution_x;
                if (j > 0) {
                    this.nodes[index].pushEdge(offset - 1, 100);
                }

                if (j < resolution_x - 1) {
                    this.nodes[index].pushEdge(offset + 1, 100);
                }

                // Bottom neighbours
                offset += resolution_x;
                if (i < resolution_y - 1) {
                    if (j > 0) {
                        this.nodes[index].pushEdge(offset - 1, 141);
                    }

                    this.nodes[index].pushEdge(offset, 100);

                    if (j < resolution_x - 1) {
                        this.nodes[index].pushEdge(offset + 1, 141);
                    }
                }

                // console.log("[G.CREATION]", "New node with label",
                //             this.nodes[index].label, "at (", x, ",", y,
                //             ") (index:", index, ")");
                // console.log("[G.CREATION]", "Inner coordinates:",
                //             this.nodes[index].x, this.nodes[index].y);
                x += freq_x;
            }

            y += freq_y;
        }

        this.directed = false;
        this.weighted = true;
    } else if (createObj === 1) {
        // Build up a big graph for beautiful spanning trees
        // ON TODO LIST
    }


    this.renderIt = function(renderer) {
        if (this.directed) {
            // on TODO list
        } else {
            // Render an undirected graph
            for (var i = 0; i < this.nodeNum; ++i) {
                xx = this.nodes[i].x;
                yy = this.nodes[i].y;
                renderer.renderNode(xx, yy,
                                    this.nodes[i].state,
                                    this.nodes[i].label,
                                    this.nodes[i].dist);

                // console.log("[G.DRAW]","Drawn node", this.nodes[i].label,
                //             "at (", xx, ",", yy, ")");

                var length = this.nodes[i].edges.length;
                for (var j = 0; j < length; ++j) {
                    var node2 = this.nodes[this.nodes[i].edges[j].index];
                    var xx2 = node2.x;
                    var yy2 = node2.y;
                    var state = this.nodes[i].edges[j].state;
                    var label = this.nodes[i].edges[j].weight.toString();
                    renderer.renderDirectedEdge(xx, yy, xx2, yy2, state, label);
                }
            }
        }
    }



    // Stepping in Dijkstra's algorithm
    this.stepState = 0;
    // 0 -> node selected
    // 1 -> edge iterating through edges
    //    > the next variables are node and edge indexers
    this.nodeIndex = 0;
    this.edgeIndex = 0;

    this.parents = new Array(this.nodeNum);

    this.getLenght = function() {
        return this.nodes.length;
    }

    this.validStart = function(index) {
        return (index >=0 && index < this.nodes.length);
    }

    this.startStepping = function(startPoint) {
        // Reset everything
        // Reset index
        this.nodeIndex = startPoint;
        this.stepState = 1; // Set stepping state to node only

        // Reset states
        var length = this.nodes.length;
        for (var i = 0; i < length; ++i) {
            this.nodes[i].state = 0;
            this.nodes[i].reset();
        }

        this.nodes[startPoint].state = 1;
        this.nodes[startPoint].dist = 0;
    }

    this.setEdgeD = function(nodeI, edgeI, state) {
        this.nodes[nodeI].edges[edgeI].state = state;
    }

    this.setEdgeU = function(nodeI, edgeI, state) {
        this.nodes[nodeI].edges[edgeI].state = state; // Here
        var index = this.nodes[nodeI].edges[edgeI].index;
        var length = this.nodes[index].edges.length;
        var i = 0;
        while (i < length) {
            if (this.nodes[index].edges[i] == nodeI) {
                this.nodes[index].edges[i].state = state; // Here
            }

            ++i;
        }
    }

    this.searchNextEdge = function() {
        // Search for the next edge
        // var edges = this.nodes[this.nodeIndex].edges;
        var nIndex = this.nodeIndex;
        var length = this.nodes[nIndex].edges.length;
        var i = this.edgeIndex;

        while (i < length && this.nodes[nIndex].edges[i].state != 0) {
            // console.log("nIndex, i", nIndex, i);
            // console.log("i, length,
            //             edges[i].state",
            //             i, length, this.nodes[nIndex].edges[i].state);
            ++i;
        }

        // console.log("Idaig jo!");

        if (i == length) {
            return false;
        }

        this.setEdge(this.nodeIndex, i, 1); // Set state to being checked
        var index = this.nodes[nIndex].edges[i].index;

        var pathWeight = this.nodes[nIndex].dist +
                         this.nodes[nIndex].edges[i].weight;
        if (this.nodes[index].dist > pathWeight) {
            this.nodes[index].dist = pathWeight;
            this.parents[index] = nIndex;
        }

        return true;
    }


    this.stepOne = function() {
        // Step one in a directed graph
        // Return value -> is the algorithm finished?
        if (this.stepState == 0) {
            // Node selected, but not an edge =>
            // => Set up an edge index and set up this node for drawing
            var index1 = this.nodeIndex;
            this.nodes[index1].state = 1;
            this.stepState = 1;

            // Check length.... TODO
            this.edgeIndex = 0;
            console.log("[G.STEP]", "stepState 0 finished");
        } else {
            if (this.searchNextEdge()) {
                // console.log("It works!");
            }

            console.log("[G.STEP]", "stepState 1 finished");
        }
    }

    if (this.directed) {
        this.setEdge = this.setEdgeD;
    } else {
        this.setEdge = this.setEdgeU;
    }
}



// Global objects
var renderer, graph;




// Start the stepping in the graph
function start() {
    var index = parseInt(document.getElementById("graph-index").value);
    if (graph.validStart(index)) {
        graph.startStepping(index);
        document.getElementById("graph-step").disabled = false;
        renderer.clear();
        graph.renderIt(renderer);
    } else {
        alert("Invalid start index!");
    }
}


function step() {
    graph.stepOne();

    renderer.clear();
    graph.renderIt(renderer);
}



// Create a new graph
function create() {
    var optAligned = document.getElementById("graph-opt-aligned");
    var optRandom = document.getElementById("graph-opt-random");
    var optEdgelist = document.getElementById("graph-opt-edgelist");

    var ready = true;

    if (optAligned.checked) {
        var freq_x = parseInt(document.getElementById("graph-freq-x").value);
        var freq_y = parseInt(document.getElementById("graph-freq-y").value);
        var res_x = parseInt(document.getElementById("graph-count-x").value);
        var res_y = parseInt(document.getElementById("graph-count-y").value);

        graph = new Graph(0, freq_x, freq_y, res_x, res_y);

        renderer.nodeSize = 12;
        renderer.renderLabels = true;
    } else if (optRandom.checked || optEdgelist.checked) {
        alert("Option currently not supported!");
        ready = false;
    } else {
        alert("[CREATE]", "You must select one option");
        ready = false;
    }

    if (ready) {
        renderer.clear();
        graph.renderIt(renderer);

        document.getElementById("graph-start").disabled = false;
        document.getElementById("graph-index").disabled = false;
    }
}


// For click on option 1
function setOpt1() {
}

function setOpt2() {
}

function setOpt3() {
}


// Create radio button      #let's-try-to-do-everything-in-DRY
function createPossibiltyDiv(str, id, action) {
    var radioDiv = document.createElement("div");
    radioDiv.className = "graph-smalldiv";
    var input = document.createElement("input");
    input.className = "graph-radio";
    input.type = "radio";
    input.name = "graph-type";
    input.id = id;
    input.onclick = function() { action(); };
    radioDiv.appendChild(input);
    radioDiv.innerHTML += str;

    return radioDiv;
}

// Create a new input div
function createNumericInputDiv(str, id, defaultValue, min=0, disabled=false) {
    var inputDiv = document.createElement("div");
    inputDiv.className = "graph-smalldiv";
    inputDiv.innerHTML = str;
    var input = document.createElement("input");
    input.className = "graph-numeric";
    input.type = "number";
    input.id = id;
    input.defaultValue = defaultValue;
    input.min = min;
    input.disabled = disabled;
    inputDiv.appendChild(input);
    return inputDiv;
}


// Create button
function createButton(str, id, action, disabled=false) {
    var button = document.createElement("button");
    button.className = "graph-button";
    button.id = id;
    button.innerHTML = str;
    button.disabled = disabled;
    button.onclick = function() { action(); return false; };
    return button;
}


// Set up everything for the visualization:
// - Create a canvas element
function setup(width=400, height=400) {
    renderer = new Renderer("graph", 12, true, width, height);

    var contentHolder = document.getElementById("graph");

    // Set up starting point
    var coordDiv = document.createElement("div");
    coordDiv.className = "graph-div";
    coordDiv.id = "graph-coorddiv";

    var form = document.createElement("form");
    form.className = "graph-form";
    form.id = "graph-startform";

    inputDiv = createNumericInputDiv("Starting index ",
                                     "graph-index", 0, 0, true);
    form.appendChild(inputDiv);

    // Start button
    var button = createButton("Start", "graph-start", start, true);
    form.appendChild(button);
    coordDiv.appendChild(form);
    contentHolder.appendChild(coordDiv);


    // Step button
    button = createButton("Step", "graph-step", step, true);
    contentHolder.appendChild(button);



    // Form for graph type
    var typeDiv = document.createElement("div");
    typeDiv.className = "graph-div";
    typeDiv.id = "graph-typediv";

    // Form for graph type selection:
    form = document.createElement("form");
    form.className = "graph-form";
    form.id = "graph-typeform";
    // Add possibilities:
    // Possibility #1
    var radioDiv = createPossibiltyDiv("Aligned, random graph layout",
                                       "graph-opt-aligned",
                                       setOpt1);
    form.appendChild(radioDiv);

    // Possibility #2
    radioDiv = createPossibiltyDiv("Dense, almost aligned, random graph layout",
                                   "graph-opt-random",
                                   setOpt2);
    form.appendChild(radioDiv);

    // Possibility #3
    radioDiv = createPossibiltyDiv("Graph built from edge list",
                                   "graph-opt-edgelist",
                                   setOpt3);
    form.appendChild(radioDiv);


    // Specializers:
    // Frequency on x
    var inputDiv = createNumericInputDiv("Horizontal intervals ",
                                         "graph-freq-x", 100, 5);
    form.appendChild(inputDiv);

    // Frequency on y
    inputDiv = createNumericInputDiv("Vertical intervals ",
                                     "graph-freq-y", 100, 5);
    form.appendChild(inputDiv);

    // Node count on x (resolution_x)
    inputDiv = createNumericInputDiv("Horizontal count ",
                                     "graph-count-x", 4, 1);
    form.appendChild(inputDiv);

    // Node count on y (resolution_y)
    inputDiv = createNumericInputDiv("Vertical count ", "graph-count-y", 4, 1);
    form.appendChild(inputDiv);

    // Append form
    typeDiv.appendChild(form);
    contentHolder.appendChild(typeDiv);


    // Create button
    button = createButton("Create graph", "graph-create", create);
    contentHolder.appendChild(button);


    // Set first possibility
    document.getElementById("graph-opt-aligned").checked = true;

    // renderer1 = new Renderer("graph");
    // renderer2 = new Renderer("graph");

    // renderer1.clear();
    // renderer2.clear();


    // renderer1.renderNode(100, 100, 0, "1");
    // renderer1.renderNode(100, 200, 0, "12");
    // renderer1.renderNormalEdge(100, 100, 100, 200, 1, 32);

    // renderer1.renderNode(200, 100, 0, "3");
    // renderer1.renderDirectedEdge(100, 100, 200, 100, 3, 32);

    // renderer1.renderNode(200, 200, 0, "4");
    // renderer1.renderDirectedEdge(100, 100, 200, 200, 0, 41);
    // renderer1.renderDirectedEdge(200, 200, 200, 100, 2, 32);
    // renderer1.renderDirectedEdge(200, 200, 100, 100, 1, 41);
    // renderer1.renderDirectedEdge(200, 100, 100, 200, 0, 41);


    // graph = new Graph;

    // graph.renderIt(renderer2);

    // graph.startStepping(0);
    // graph.stepOne();

    // renderer2.clear();
    // graph.renderIt(renderer2);

    // graph.stepOne();
    // renderer2.clear();
    // graph.renderIt(renderer2);

    // graph.stepOne();
    // renderer2.clear();
    // graph.renderIt(renderer2);


    // renderer2.renderNode(80, 100, 0, "1");
    // renderer2.renderNode(80, 150, 1, "2");
    // renderer2.renderNode(140, 100, 2);
    // renderer2.renderNode(140, 150, 3);
    // renderer2.renderNode(50, 100, 2);
    // renderer2.renderNode(80, 50, 2);
    // renderer2.renderNode(130, 50, 1);
    // renderer2.renderNode(300, 300);

    // renderer2.renderDirectedEdge(80, 100, 130, 50, 1, 31);
    // renderer2.renderDirectedEdge(80, 100, 80, 50, 0, 23);
    // renderer2.renderDirectedEdge(80, 100, 50, 100, 3, 43);
    // renderer2.renderNormalEdge(80, 100, 140, 150, 0, 12);
    // renderer2.renderDirectedEdge(80, 100, 80, 150, 1, 12);
    // renderer2.renderDirectedEdge(80, 100, 140, 100, 2, 12.3);
    // renderer2.renderDirectedEdge(80, 100, 300, 300, 0, 100);
    // renderer2.renderDirectedEdge(300, 300, 80, 100, 3, 100);


    // renderer1.renderNode(30, 30);
    // renderer1.renderNode(60, 60);
}
