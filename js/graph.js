// GNode is for creating an adjacency matrix-like structure
function GNode(x, y, label="") {
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


    this.directed;
    this.weighted;

    this.nodes = new Array();

    this.renderJustTree;

    if (createObj === 0) {
        var nodeNum = resolution_x * resolution_y;
        this.nodes = new Array(nodeNum);
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

        this.directed = true;
        this.weighted = true;
    } else if (createObj === 1) {
        // Build up a big graph for beautiful spanning trees
        var orig_y = freq_y / 2;

        var index = 0;

        for (i = 0; i < resolution_y; ++i) {
            var orig_x = freq_x / 2;
            for (j = 0; j < resolution_x; ++j) {
                var pointExists = (Math.random() < 0.8) ? (true) : (false);

                if (pointExists) {
                    var m = (Math.random() < 0.5) ? (1) : (-1);
                    var new_x =
                        orig_x + m * Math.sqrt(Math.random() * (freq_x / 2));
                    m = (Math.random() < 0.5) ? (1) : (-1);
                    var new_y =
                        orig_y + m * Math.sqrt(Math.random() * (freq_y / 2));

                    this.nodes.push(new GNode(new_x, new_y, index.toString()));
                    ++index;
                }

                orig_x += freq_x;
            }

            orig_y += freq_y;
        }

        var optimal_dist = (freq_x + freq_y) / 2;

        // console.log("Length of graph array: ", this.nodes.length);

        for (i = 0; i < this.nodes.length - 1; ++i) {
            for (j = i + 1; j < this.nodes.length; ++j) {
                var dist = distance(this.nodes[i].x,
                                    this.nodes[i].y,
                                    this.nodes[j].x,
                                    this.nodes[j].y);

                // var randNum = Math.random() / 2.0 + 1.0;

                if (dist < optimal_dist * 1.5) {
                    this.nodes[i].pushEdge(j, dist);
                    this.nodes[j].pushEdge(i, dist);
                }
            }
        }

        this.directed = false;
        this.weighted = true;
    }


    this.renderIt = function(renderer) {
        if (this.directed) {
            // Render a directed graph
            for (var i = 0; i < this.nodes.length; ++i) {
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
                    var state = this.nodes[i].edges[j].state;

                    if (!this.renderJustTree ||
                        (this.renderJustTree && state == 3 || state == 1)) {
                        // We can render it, 'cause it's part of the spanning
                        // tree
                        var xx2 = node2.x;
                        var yy2 = node2.y;
                        var label = this.nodes[i].edges[j].weight.toString();

                        renderer.renderDirectedEdge(xx, yy, xx2, yy2,
                                                    state, label);
                    }
                }
            }
        } else {
            // Render an undirected graph
            for (var i = 0; i < this.nodes.length; ++i) {
                xx = this.nodes[i].x;
                yy = this.nodes[i].y;
                renderer.renderNode(xx, yy,
                                    this.nodes[i].state,
                                    this.nodes[i].label,
                                    this.nodes[i].dist);
                
                var length = this.nodes[i].edges.length;

                for (var j = 0; j < length; ++j) {
                    var index = this.nodes[i].edges[j].index;

                    if (index < i) {
                        // We can render it!
                        var state = this.nodes[i].edges[j].state;

                        if (!this.renderJustTree ||
                            this.renderJustTree && state == 3 || state == 1) {
                            // We can render it, because it's part of the
                            // spannign tree, or we don't render just spanning
                            // tree
                            var xx2 = this.nodes[index].x;
                            var yy2 = this.nodes[index].y;
                            var label =
                                this.nodes[i].edges[j].weight.toString();
                            renderer.renderUndirectedEdge(xx, yy, xx2, yy2,
                                                          state, label);
                        }
                    }
                }
            }
        }
    }

    this.setRenderType = function(renderJustTree = false) {
        this.renderJustTree = renderJustTree;
    }



    // Stepping in Dijkstra's algorithm
    this.stepState = 0;
    // 0 -> node selected
    // 1 -> edge iterating through edges
    //    > the next variables are node and edge indexers
    this.nodeIndex = 0;
    this.edgeIndex = 0;

    // The state which will be applied for the last node or edge index
    this.lastStepState = false;
    this.lastEdgeState = 0;

    // Parents array
    this.parents = new Array(this.nodes.length);

    // Get length of the nodes array
    this.getLenght = function() {
        return this.nodes.length;
    }

    // Check, if index is a valid starting point for the algorithm
    this.validStart = function(index) {
        return (index >=0 && index < this.nodes.length);
    }

    // Start stepping from a valid(!) startPoint
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

        this.lastStepState = false;



        // this.stepOne();
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
            if (this.nodes[index].edges[i].index == nodeI) {
                this.nodes[index].edges[i].state = state; // Here
            }

            ++i;
        }

        // console.log("Here!!!");
    }

    this.searchNextNode = function() {
        var bestIndex = -1;
        var bestDist = Infinity;

        var length = this.nodes.length;
        var i = 0;
        while (i < length) {
            if (this.nodes[i].state == 2 && this.nodes[i].dist < bestDist) {
                bestIndex = i;
                bestDist = this.nodes[i].dist;
            }
            ++i;
        }

        if (bestIndex == -1) {
            return false;
        }

        this.nodes[this.nodeIndex].state = 3;

        this.nodeIndex = bestIndex;
        this.nodes[bestIndex].state = 1;

        console.log("G.SEARCHNNODE", "bestIndex:", bestIndex);
        var parent = this.parents[bestIndex];
        this.setEdge(parent.nodeIndex, parent.edgeIndex, 3);

        return true;
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

        this.edgeIndex = i;
        this.setEdge(this.nodeIndex, i, 1); // Set state to being checked
        var index = this.nodes[nIndex].edges[i].index;

        var pathWeight = this.nodes[nIndex].dist +
                         this.nodes[nIndex].edges[i].weight;
        if (this.nodes[index].dist > pathWeight) {
            this.nodes[index].dist = pathWeight;
            this.nodes[index].state = 2;
            this.parents[index] = {nodeIndex: nIndex, edgeIndex: i};

        }

        this.lastStepState = true;
        this.lastEdgeState = 2;

        return true;
    }


    this.stepOne = function() {
        // Step one in a directed graph
        // Return value -> is the algorithm finished?
        var index1 = this.nodeIndex;

        console.log("[G.STEPONE]", "this.lastStepState=", this.lastStepState);

        var retValue = true;

        if (this.lastStepState) {
            this.setEdge(index1, this.edgeIndex, this.lastEdgeState);
        }


        if (this.stepState) {
            if (!this.searchNextEdge()) {
                this.stepState = 0;
            }

            console.log("[G.STEP]", "stepState 1 finished");
        }

        if (!this.stepState) {
            // Node selected, but not an edge =>
            // => Set up an edge index and set up this node for drawing

            if (!this.searchNextNode()) {
                document.getElementById("graph-step").disabled = true;
                document.getElementById("graph-obj-canvas").onclick = null;
                document.getElementById("graph-run").disabled = true;

                retValue = false;
            }

            this.edgeIndex = 0;
            this.stepState = 1;
            this.lastStepState = false;
            // this.nodes[index1].state = 1;
            console.log("[G.STEP]", "stepState 0 finished");
        }

        return retValue;
    }

    if (this.directed) {
        this.setEdge = this.setEdgeD;
    } else {
        this.setEdge = this.setEdgeU;
    }
}
