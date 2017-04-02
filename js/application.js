// Global objects
var renderer, graph;


// Start the stepping in the graph
function start() {
    var index = parseInt(document.getElementById("graph-index").value);
    if (graph.validStart(index)) {
        graph.startStepping(index);
        document.getElementById("graph-step").disabled = false;
        document.getElementById("graph-run").disabled = false;
        renderer.clear();
        graph.renderIt(renderer);
    } else {
        alert("Invalid start index!");
    }
}


// Step one
function step() {
    graph.stepOne();

    renderer.clear();
    graph.renderIt(renderer);
}


var running = false;


// Animate the pathfinding
function run() {
    running = true;

    document.getElementById("graph-stop").disabled = false;
    document.getElementById("graph-run").disabled = true;
    document.getElementById("graph-start").disabled = true;
    document.getElementById("graph-create").disabled = true;
    document.getElementById("graph-step").disabled = true;

    runCallback();
}

function runCallback() {
    var stepValue = graph.stepOne() && running;

    renderer.clear();
    graph.renderIt(renderer);

    if (stepValue) {
        requestAnimationFrame(runCallback);
    } else {
        document.getElementById("graph-stop").disabled = true;
        document.getElementById("graph-run").disabled = false;
        document.getElementById("graph-start").disabled = false;
        document.getElementById("graph-create").disabled = false;
        document.getElementById("graph-step").disabled = false;
    }
}

// Stop animated pathfinding
function stop() {
    running = false;
}



// Create a new graph
function create() {
    var optAligned = document.getElementById("graph-opt-aligned");
    var optRandom = document.getElementById("graph-opt-random");
    var optEdgelist = document.getElementById("graph-opt-edgelist");

    var ready = true;

    var freq_x = parseInt(document.getElementById("graph-freq-x").value);
    var freq_y = parseInt(document.getElementById("graph-freq-y").value);
    var res_x = parseInt(document.getElementById("graph-count-x").value);
    var res_y = parseInt(document.getElementById("graph-count-y").value);

    if (optAligned.checked) {

        graph = new Graph(0, freq_x, freq_y, res_x, res_y);

        renderer.nodeSize = 12;
        renderer.renderLabels = true;
    } else if (optRandom.checked) {
        graph = new Graph(1, freq_x, freq_y, res_x, res_y);

        renderer.nodeSize = 4;
        renderer.renderLabels = false;

        // graph.renderJustTree = true;
    } else if (optEdgelist.checked) {
        alert("Option currently not supported!");
        ready = false;
    } else {
        alert("[CREATE]", "You must select one option");
        ready = false;
    }

    if (ready) {
        // graph.setRenderType(true);
        renderer.clear();
        graph.renderIt(renderer);

        document.getElementById("graph-index").disabled = false;
        document.getElementById("graph-step").disabled = true;
    }


    // Set callback for click on canvas
    document.getElementById("graph-obj-canvas").onclick = function() { step(); };
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
    renderer = new GRenderer("graph", width, height);

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
    var button = createButton("Start", "graph-start", start);
    form.appendChild(button);
    coordDiv.appendChild(form);
    contentHolder.appendChild(coordDiv);


    // Step button
    button = createButton("Step", "graph-step", step, true);
    contentHolder.appendChild(button);


    // Animate the pathfinding
    button = createButton("Run", "graph-run", run, true);
    contentHolder.appendChild(button);


    // Stop animated pathfinding
    button = createButton("Stop", "graph-stop", stop, true);
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
    var radioDiv = createPossibiltyDiv("Aligned graph layout",
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


    // Create a graph by default
    create();
}
