// Get the default node style
function getDefNodeStyle() {
    return [
    {color: "#232323", lineWidth: 2},
    {color: "#55b255", lineWidth: 3},
    {color: "#d05343", lineWidth: 2},
    {color: "#2b7844", lineWidth: 2}
    ];
}

// Get the default edge style
function getDefEdgeStyle() {
    return [
        {color: "#909090", lineWidth: 1},
        {color: "#55b255", lineWidth: 3},
        {color: "#d05343", lineWidth: 1},
        {color: "#2b7844", lineWidth: 2}
    ];
}


// GRenderer - Graph renderer object. It acquires a canvas and a context through
// a predefined id
// id => parent div id
// width => canvas width
// height => canvas height
// nodeStyle => style of the nodes
// edgeStyle => style of the edges
// bigLabelFont => font for big labels (e.g. node label)
// smallLabelFont => font for small labels (e.g. distance to node)
// borderStyleStr => style of the canvas border
function GRenderer(id, width = 400, height = 400,
                   nodeStyle = getDefNodeStyle(), edgeStyle = getDefEdgeStyle(),
                   bigLabelFont = "12px Arial", smallLabelFont = "9px Arial",
                   borderStyleStr = "1px solid black") {

    // Construction and member data

    // Create a canvas with the specified settings
    this.canvas = document.createElement("canvas");
    this.canvas.style.border = borderStyleStr;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.id = id + "-obj-canvas";

    // Set node and edge styles
    this.nodeStyle = nodeStyle;
    this.edgeStyle = edgeStyle;

    // Set node size
    this.nodeSize = 12; // Default node size

    // Create a context for drawing
    this.ctx = this.canvas.getContext("2d");

    // Font settings
    this.ctx.font = bigLabelFont;
    this.bigLabelFont = bigLabelFont;
    this.smallLabelFont = smallLabelFont;

    // Do we need to render labels?
    this.renderLabels = true; // Default value

    // Append context to parent div
    var parent = document.getElementById(id);
    parent.appendChild(this.canvas);



    // Methods and functions
    
    // Get the global id prefix
    this.getIdPrefix = function() {
        return this.id;
    }

    // Set text styles
    this.setNormalTextStyle = function(color="black") {
        this.ctx.font = this.bigLabelFont;
        this.ctx.fillStyle = color;
    }
    this.setDistTextStyle = function(color="red") {
        this.ctx.font = this.smallLabelFont;
        this.ctx.fillStyle = color;
    }

    // Clear content of context (when we have to update something in the graph)
    this.clear = function(styleStr = "#FFFFFF") {
        this.ctx.fillStyle = styleStr;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


    // Render a node
    this.renderNode = function(x, y, state=0, label="", dist=Infinity) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.nodeStyle[state].color;
        this.ctx.lineWidth = this.nodeStyle[state].lineWidth;

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

    // Set up everything for edge rendering
    // Magic values of state:
    //  0 -> valid edge, but never used;
    //  1 -> edge being checked
    //  2 -> unusued edge
    //  3 -> used edge
    this.edgeStateSetup = function(state) {
        this.ctx.strokeStyle = this.edgeStyle[state].color;
        this.ctx.lineWidth = this.edgeStyle[state].lineWidth;
        this.setDistTextStyle(this.ctx.strokeStyle);
    }

    // Render an undirected edge
    this.renderUndirectedEdge = function(x1, y1, x2, y2, state=0, length=0) {
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
            this.ctx.fillText(length.toString(),
                              (x1 + x2) / 2,
                              (y1 + y2) / 2);
        }
    }

    // Render a directed edge
    this.renderDirectedEdge = function(x1, y1, x2, y2, state=0, length=0) {
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
