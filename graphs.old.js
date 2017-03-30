// Renderer object with special functions for graph rendering
// id => parent div id; width => canvas width; height => canvas height;
// borderStyleStr => style of canvas border
function Renderer(id, width = 400, height = 400,
                  borderStyleStr = "1px solid black") {
    // Create a canvas with the specified settings
    this.canvas = document.createElement("canvas");
    this.canvas.style.border = borderStyleStr;
    this.canvas.width = width;
    this.canvas.height = height;

    // Create a context for drawing
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = "12px Arial";

    // Append context to parent div
    var parent = document.getElementById(id);
    parent.appendChild(this.canvas);

    // Clear content of context (when we have to update something in the graph)
    this.clear = function(styleStr = "#FFFFFF") {
        this.ctx.fillStyle = styleStr;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.ctx.fillStyle = "#000000";
    }


    this.renderNode = function(x, y, state=0, label="") {
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
            this.ctx.strokeStyle = "#555f70";
            break;
        case 2:
            // Inactive node: it's distance from the centre is already
            // calculated
            this.ctx.strokeStyle = "#44614f";
            break;
        default:
            this.ctx.strokeStyle = "#000000";
        }
        if (label=="") {
            this.ctx.arc(x, y, 6, 0, 2*Math.PI);
        } else {
            this.ctx.arc(x, y, 10, 0, 2*Math.PI);
            this.ctx.fillStyle = "#000000";
            this.ctx.fillText(label, x, y);
        }
        this.ctx.stroke();
    }

    this.edgeStateSetup = function(state) {
        // Set up everything for edge rendering
        switch (state) {
        case 0:
            // Set style for unused
            this.ctx.strokeStyle = "#606060";
            this.ctx.lineWidth = 1;
            // console.log("Here state 0!", x1, y1, x2, y2);
            break;
        case 1:
            // Set style for used
            this.ctx.strokeStyle = "#448262";
            this.ctx.lineWidth = 2;
            // console.log("Here state 1!", x1, y1, x2, y2);
            break;
        case 2:
            // Set style for edge being checked
            this.ctx.strokeStyle = "#559070";
            this.ctx.lineWidth = 4;
            break;
        case 3:
            // Set style finalized state
            this.ctx.strokeStyle = "#121212";
            this.ctx.lineWidth = 2;
            // console.log("Here state 2!", x1, y1, x2, y2);
            break;
        default:
            this.ctx.strokeStyle = "#000000";
            this.ctx.lineWidth = 1;
            // console.log("Here state default!", x1, y1, x2, y2);
        }
        this.ctx.fillStyle = this.ctx.strokeStyle;
    }

    this.renderNormalEdge = function(x1, y1, x2, y2, state=0, length=0) {
        this.ctx.beginPath();
        this.edgeStateSetup(state);
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        if (length) {
            this.ctx.fillText(length.toString(), (x1 + x2) / 2, (y1 + y2) / 2);
        }
    }

    this.renderDirectedEdge = function(x1, y1, x2, y2,
                                       state=0, length=0,
                                       startNodeSize=8, endNodeSize=8) {
        // Render an edge
        // Magic values of state:
        //  0 -> valid edge, but never used;
        //  1 -> valid edge, used but not finalized;
        //  2 -> edge being checked
        //  3 -> valid edge, finalized;
        //
        // variable length: if zero, do not draw text else draw the length of 
        // the edge

        this.ctx.beginPath();
        var startAngle = Math.atan2(x1 - x2, y1 - y2);

        this.edgeStateSetup(state);

        var delta_x = x2 - x1;
        var delta_y = y2 - y1;
        var control_x = (x1 + x2) / 2 - delta_y / 4;
        var control_y = (y1 + y2) / 2 + delta_x / 4;
        var arrowAngle = Math.atan2(control_x - x2, control_y - y2) + Math.PI;
        this.ctx.moveTo(x1 - 10*Math.sin(startAngle), y1 - 10*Math.cos(startAngle));

        // this.ctx.lineTo(x2 ,y2);
        this.ctx.quadraticCurveTo(control_x, control_y, x2+10*Math.sin(startAngle), y2+10*Math.cos(startAngle));

        this.ctx.moveTo(
            x2 - (10 * Math.sin(arrowAngle - Math.PI / 6)),
            y2 - (10 * Math.cos(arrowAngle - Math.PI / 6))
        );

        this.ctx.lineTo(x2, y2);

        this.ctx.lineTo(
            x2 - (10 * Math.sin(arrowAngle + Math.PI / 6)),
            y2 - (10 * Math.cos(arrowAngle + Math.PI / 6))
        );

        this.ctx.stroke();

        if (length) {
            this.ctx.fillText(length.toString(),
                              control_x,
                              control_y);
        }
    }
}


// Global renderer objects
var renderer1, renderer2;


// Update the canvas using the adjacency matrix
function renderGraph(renderer, graph) {
    // for (var i = 0; i < graph.length(); ++i) {
    //     for (var j = 0; j < graph[i].length(); ++j) {
    //         // 
    //     }
    // }
}


// Set up everything for the visualization:
// - Create a canvas element
function setup() {
    renderer1 = new Renderer("graph");
    renderer2 = new Renderer("graph");

    renderer1.clear();
    renderer2.clear();
    

    renderer2.renderNode(80, 100, 0, "1");
    renderer2.renderNode(80, 150, 1, "2");
    renderer2.renderNode(140, 100, 2);
    renderer2.renderNode(140, 150, 3);
    renderer2.renderNode(50, 100, 2);
    renderer2.renderNode(80, 50, 2);
    renderer2.renderNode(130, 50, 1);
    renderer2.renderNode(300, 300);

    renderer2.renderDirectedEdge(80, 100, 130, 50, 1, 31);
    renderer2.renderDirectedEdge(80, 100, 80, 50, 0, 23);
    renderer2.renderDirectedEdge(80, 100, 50, 100, 3, 43);
    renderer2.renderNormalEdge(80, 100, 140, 150, 0, 12);
    renderer2.renderDirectedEdge(80, 100, 80, 150, 1, 12);
    renderer2.renderDirectedEdge(80, 100, 140, 100, 2, 12.3);
    renderer2.renderDirectedEdge(80, 100, 300, 300, 0, 100);
    renderer2.renderDirectedEdge(300, 300, 80, 100, 3, 100);


    // renderer1.renderNode(30, 30);
    // renderer1.renderNode(60, 60);
}
