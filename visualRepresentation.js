var graphManagement = {
    // which data has to be retreived?
    selectedDataIndex : {},

    // which data has already been retreived?
    // selectedData : {},

    lastUsedGraph : null,

    // setup graph
    mainGraphDefaultData : {
        boxHeight : 500,
        boxWidth : 1500,
        margin : {
            top: 80,
            right: 80,
            bottom: 60,
            left: 80
        },
    }
};

//
var firstSelect = true;
// please delete +++ (Jorik)

function prepareGraphManagementData () {
    var mainGraphDefaultData = graphManagement.mainGraphDefaultData;

    var margin = mainGraphDefaultData.margin;

    var mainGraph = d3.select("#main-graph").append("svg")
        .attr("width", mainGraphDefaultData.boxWidth)
        .attr("height", (mainGraphDefaultData.boxHeight))
        .attr("viewBox", "0,0," + mainGraphDefaultData.boxWidth + "," + mainGraphDefaultData.boxHeight);

    mainGraphDefaultData.height = mainGraphDefaultData.boxHeight - margin.top - margin.bottom;
    mainGraphDefaultData.width = mainGraphDefaultData.boxWidth - margin.left - margin.right;

    mainGraphDefaultData.mainGraph = mainGraph;
}





function getGraphManagement () {
    return graphManagement;
}

function createMainGraph () {
    var fileData = getDataOfFile(graphManagement.selectedDataIndex.left);
    var fileData2 = getDataOfFile(graphManagement.selectedDataIndex.right);

    // make a ref between the graph and
    // graphManagement.selectedData.left = fileData;
    // graphManagement.selectedData.right = fileData2;

    var mainGraphDefaultData = graphManagement.mainGraphDefaultData;

    var margin = mainGraphDefaultData.margin;

    var mainGraph = mainGraphDefaultData.mainGraph;


    // mainGraph.html(""); // clean for new stuff.


    var height = mainGraphDefaultData.height,
        width = mainGraphDefaultData.width;

    if (mainGraphDefaultData.lastUsedGraph != undefined) {
        if (fileData.graphType != mainGraphDefaultData.lastUsedGraph && !mainGraph.select("#main-graph-group").empty()) {
            console.log("grap has changed so recreate it");
            mainGraph.select("#main-graph-group").remove();
        }
    }

    if (mainGraph.select("#main-graph-group").empty()) {
        // if (fileData != undefined) {
        //     if (fileData2 != undefined) {
        //         makeGraph(fileData, true);
        //         createFilters ("left", fileData);
        //         makeGraph(fileData2, true, true);
        //         createFilters ("right", fileData2);
        //     } else {
        //         makeGraph(fileData, false);
        //         createFilters ("left", fileData);
        //     }
        // }
        if (fileData != undefined) {
            makeGraph(fileData, false);
            createFilters ("left", fileData);
        }
    } else {
        updateGraph(fileData, false);
        createFilters ("left", fileData);
    }
}


var barTransitions = {
    dataGrow : (d3.transition()
        .duration(400)
        .ease(d3.easeLinear)),
};



function makeGraph (fileData, dualGraph, secondGraph) {
    // ---
    var mainGraphDefaultData = graphManagement.mainGraphDefaultData;

    var margin = mainGraphDefaultData.margin,
        mainGraph = mainGraphDefaultData.mainGraph,
        height = mainGraphDefaultData.height,
        width = mainGraphDefaultData.width;

    var mainGraphData = fileData.mainGraph;

    var allData = fileData.allData;

    // Can contain a function which sets the format of the ticks and the labels.
    var tickFormatX = mainGraphData.tickFormatX != undefined ? mainGraphData.tickFormatX : function (d) {return d;};
    var tickFormatY = mainGraphData.tickFormatX != undefined ? mainGraphData.tickFormatY : function (d) {return d;};

    var labelFormat = mainGraphData.labelFormat != undefined ? mainGraphData.labelFormat : function (d) {return d;};

    var barWidth = mainGraphData.barWidth;

    var mainGraphGroup = mainGraph.append("g")
        .attr("id", "main-graph-group")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");







    var legend = mainGraph.append("g")
        .attr("class", "legend")
        .attr("transform","translate(" + (width / 2 - 20) + ",0)");






    if (!secondGraph) {
        // x axis
        mainGraphGroup.append("g")
            .attr("class", "axis axis-x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(mainGraphData.x)
            .tickFormat(tickFormatX))
                .append("text")
                .attr("y", 40)
                .attr("x", width / 2)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("class", "svg-axis-definition")
                    .text(mainGraphData.columnXFriendlyName);




        // y axis 1
        mainGraphGroup.append("g")
            .attr("class", "axis axis-y")
            .call(d3.axisLeft(mainGraphData.y)
                    .ticks(mainGraphData.ticks[0], mainGraphData.ticks[1], mainGraphData.ticks[2])
                    .tickFormat(tickFormatY)
                )
                .append("text")
                .attr("y", -20)
                .attr("x", 0)
                .attr("text-anchor", "middle")
                .attr("fill", "#2fb9de")
                .attr("class", "svg-axis-definition")
                    .text(mainGraphData.columnYFriendlyName);

        legend.append("rect")
            .attr("class", "legend-color")
            .attr("fill", "#2fb9de")
            .attr("x", 20)
            .attr("y", 20)
            .attr("width", 20)
            .attr("height", 20);

        legend.append("text")
            .attr("class", "legend-text")
            .attr("fill", "black")
            .attr("x", 50)
            .attr("y", 33.5)
            .text(fileData.friendlyName);

    // dualGraph is a feature which has been disabled due other features
    } else if (dualGraph) {

        var axisY2 = mainGraphGroup.append("g"); //mainGraphGroup.select("#axis-y2").empty() != undefined ? mainGraphGroup.select("#axis-y2") : mainGraphGroup.append("g");


        axisY2
            .attr("class", "axis axis-y2")
            .attr("transform", "translate(" + width + ",0)") // the axis to the right
                .call(d3.axisRight(mainGraphData.y)
                    .ticks(mainGraphData.ticks != undefined ? mainGraphData.ticks : 1, mainGraphData.ticksFormat)
                    .tickFormat(tickFormatY)
                )
                .append("text")
                .attr("y", -20)
                .attr("x", 0)
                .attr("text-anchor", "middle")
                .attr("fill", "#1672b9")
                .attr("class", "svg-axis-definition")
                    .text(mainGraphData.columnYFriendlyName);

        legend.append("rect")
            .attr("fill", "#1672b9")
            .attr("x", 100 + 60)
            .attr("y", 20)
            .attr("width", 20)
            .attr("height", 20);

        legend.append("text")
            .attr("fill", "black")
            .attr("x", 130 + 60)
            .attr("y", 33.5)
            .text(fileData.friendlyName);
    }

    if (fileData.graphType == "bar") {

        mainGraphDefaultData.lastUsedGraph = "bar";



        var filterData = fileData.filterData;
        if (filterData) {
            for (var i = 0; i < filterData.length; i++) {
                allData = allData.filter(filterData[i].filterFunction, filterData[i]);
            }
        }

        // content
        var contentGroup = mainGraphGroup.append("g")
            .attr("class", "content-group");

        var groups = contentGroup.selectAll("g")
            .data(allData)
                .enter()
                    .append("g");



        groups
            .append("rect")
                .attr("class", "bar")
                .attr("fill",  !secondGraph ? "#2fb9de" : "#1672b9")
                .attr("y", height)
                .attr("height", 0)
                .attr("x", function(d) {
                    var positionX = mainGraphData.x(d[mainGraphData.columnX]);
                    if (secondGraph) {
                        positionX += barWidth / 2;
                    }
                    return positionX;
                })
                .attr("width", !dualGraph ? barWidth : barWidth / 2)
                .transition(barTransitions.dataGrow)
                    .attr("y", function(d) {
                        return mainGraphData.y(d[mainGraphData.columnY]);
                    })
                    .attr("width", !dualGraph ? barWidth : barWidth / 2)
                    .attr("height", function(d) {
                        return height - mainGraphData.y(d[mainGraphData.columnY]);
                    });

        groups
            .append("text")
                .attr("class", "bar-text")
                .attr("fill", !secondGraph ? "#2fb9de" : "#1672b9")
                .attr("x", function(d) {
                    var positionX = mainGraphData.x(d[mainGraphData.columnX]) + (barWidth / 2);
                    if (secondGraph) {
                        positionX += barWidth / 4;
                    } else if (dualGraph){
                        positionX -= barWidth / 4;
                    }
                    return positionX;
                })
                .text(function(d) {
                    if (d[mainGraphData.columnY] > 0) {
                        return labelFormat(d[mainGraphData.columnY]);
                    }
                    return null;
                })
                .attr("y", height - 5)
                .attr("text-anchor", "middle")
                .transition(barTransitions.dataGrow)
                    .attr("y", function(d) {
                        return mainGraphData.y(d[mainGraphData.columnY]) - 5;
                    });





    // no development for a line chart yet: } else if (fileData.graphType == "line") {
    // inspiration line chart from: http://bl.ocks.org/d3noob/e34791a32a54e015f57d by d3noob’s

    }

    makeSecondaryChart(fileData, allData);
    // inspiration bar chart from: https://bl.ocks.org/mbostock/3885304 by Bostock’s, M.

}


function updateGraph(fileData) {

    var mainGraphDefaultData = graphManagement.mainGraphDefaultData;

    var margin = mainGraphDefaultData.margin,
        mainGraph = mainGraphDefaultData.mainGraph,
        height = mainGraphDefaultData.height,
        width = mainGraphDefaultData.width;

    var mainGraphData = fileData.mainGraph;

    var allData = fileData.allData;

    var barWidth = mainGraphData.barWidth;

    // Apply the filters
    var filterData = fileData.filterData;
    if (filterData) {
        for (var i = 0; i < filterData.length; i++) {
            allData = allData.filter(filterData[i].filterFunction, filterData[i]);
        }
    }

    // Can contain a function which sets the format of the ticks and the labels.
    var tickFormatX = mainGraphData.tickFormatX != undefined ? mainGraphData.tickFormatX : function (d) {return d;};
    var tickFormatY = mainGraphData.tickFormatX != undefined ? mainGraphData.tickFormatY : function (d) {return d;};

    var labelFormat = mainGraphData.labelFormat != undefined ? mainGraphData.labelFormat : function (d) {return d;};

    var mainGraphGroup = d3.select("#main-graph-group");

    mainGraphGroup.select("g.axis-x")
        .call(d3.axisBottom(mainGraphData.x)
        .tickFormat(tickFormatX))
            .select("text.svg-axis-definition")
            .text(mainGraphData.columnXFriendlyName);




    // y axis 1
    mainGraphGroup.select("g.axis-y")
        .call(d3.axisLeft(mainGraphData.y)
                .ticks(mainGraphData.ticks[0], mainGraphData.ticks[1], mainGraphData.ticks[2])
                .tickFormat(tickFormatY)
            )
            .select("text.svg-axis-definition")
                .text(mainGraphData.columnYFriendlyName);


    // legend update
    mainGraph.select(".legend text")
        .text(fileData.friendlyName);

    // content
    var contentGroup = mainGraphGroup.select("g.content-group");

    var groups = contentGroup.selectAll("g")
        .data(allData);


    var groupsWithEnter = groups.enter()
        .append("g");

    groupsWithEnter
        .append("rect")
            .attr("class", "bar")
            .attr("fill",  !secondGraph ? "#2fb9de" : "#1672b9")
            .attr("y", height)
            .attr("height", 0)
            .attr("x", function(d) {
                var positionX = mainGraphData.x(d[mainGraphData.columnX]);
                if (secondGraph) {
                    positionX += barWidth / 2;
                }
                return positionX;
            })
            .transition(barTransitions.dataGrow)
                .attr("y", function(d) {
                    return mainGraphData.y(d[mainGraphData.columnY]);
                })
                .attr("width", !dualGraph ? barWidth : barWidth / 2)
                .attr("height", function(d) {
                    return height - mainGraphData.y(d[mainGraphData.columnY]);
                });

    groupsWithEnter
        .append("text")
            .attr("class", "bar-text")
            .attr("fill", !secondGraph ? "#2fb9de" : "#1672b9")
            .attr("x", function(d) {
                var positionX = mainGraphData.x(d[mainGraphData.columnX]) + (barWidth / 2);
                if (secondGraph) {
                    positionX += barWidth / 4;
                } else if (dualGraph){
                    positionX -= barWidth / 4;
                }
                return positionX;
            })
            .text(function(d) {
                if (d[mainGraphData.columnY] > 0) {
                    return labelFormat(d[mainGraphData.columnY]);
                }
                return null;
            })
            .attr("y", height - 5)
            .attr("text-anchor", "middle")
            .transition(barTransitions.dataGrow)
                .attr("y", function(d) {
                    return mainGraphData.y(d[mainGraphData.columnY]) - 5;
                });

    groups.exit().remove();



    // A function to compare data in her-development
    var dualGraph = false;
    var secondGraph = false;
    //


    groups
        .select(".bar")
            .transition(barTransitions.dataGrow)
                .attr("x", function(d) {
                    var positionX = mainGraphData.x(d[mainGraphData.columnX]);
                    if (secondGraph) {
                        positionX += barWidth / 2;
                    }
                    return positionX;
                })
                .attr("y", function(d) {
                    return mainGraphData.y(d[mainGraphData.columnY]);
                })
                .attr("width", !dualGraph ? barWidth : barWidth / 2)
                .attr("height", function(d) {
                    return height - mainGraphData.y(d[mainGraphData.columnY]);
                });


    groups
        .select("text")
            .text(function(d) {
                if (d[mainGraphData.columnY] > 0) {
                    return labelFormat(d[mainGraphData.columnY]);
                }
                return null;
            })
            .transition(barTransitions.dataGrow)
                .attr("y", function(d) {
                    return mainGraphData.y(d[mainGraphData.columnY]) - 5;
                })
                .attr("x", function(d) {
                    var positionX = mainGraphData.x(d[mainGraphData.columnX]) + (barWidth / 2);
                    if (secondGraph) {
                        positionX += barWidth / 4;
                    } else if (dualGraph){
                        positionX -= barWidth / 4;
                    }
                    return positionX;
                });


    makeSecondaryChart(fileData, allData);
}

function changeDataset () {

    var datasetId = this.value;
    if (datasetId != undefined) {


        var datasetIndex;
        for (var i = 0; i < allFileData.length; i++) {
            if (allFileData[i].id == datasetId) {
                datasetIndex = i;
                break;
            }
        }

        if (datasetIndex != undefined) {

            // which data set are we going to set? (in the previous version 2 sets were able to be loaded at the same time)
            var parent = this.parentElement.parentElement;
            if (parent.id == "dataset-left") {
                graphManagement.selectedDataIndex.left = datasetIndex;
            } else {
                graphManagement.selectedDataIndex.right = datasetIndex;
            }

            // reload/update the graph
            createMainGraph();
        }
    }

    if (firstSelect) {
        // show the second set. (for future purposes)
        document.getElementById('dataset-right-section').classList.remove("hidden");
        firstSelect = false;
    }
}

var pieSize = 1500;

var secondaryGraph = d3.select("#secondary-graph").append("svg")
    .attr("width", pieSize)
    .attr("height", pieSize)
    .attr("viewBox", "0,0," + pieSize * 2 + "," + pieSize * 2);

var secondaryGraphGroup = secondaryGraph.append("g")
    // move it to the middle
    .attr("transform", "translate(" + pieSize + "," + pieSize + ")");


function makeSecondaryChart (fileData, allData) {

    var secondaryGraphData = fileData.secondaryGraph;
    if (secondaryGraphData != undefined) {


        var pieRadius = pieSize / 2;

        var allData = allData.sort(function (a, b) { // sort from large to small (as it should be done)
            return  b[secondaryGraphData.column] - a[secondaryGraphData.column];})

        // create an d3 object/function that will process our data and use it to create the piechart.
        var deliciousPie = d3.pie() // https://github.com/d3/d3-shape/blob/master/README.md#pie
            .value(function(d) {
                return d[secondaryGraphData.column];
            });

        var calculatedPath = d3.arc() // lets create our calculated paths. (this is not an html element!)
            .outerRadius(pieRadius - 10)
            .innerRadius(0);

        // https://github.com/d3/d3-shape/blob/master/README.md#arc
        // https://en.wikipedia.org/wiki/Arc_(geometry)



        // There code from Jérome Freyre’s will create a color range. (from one color to another color)
        // http://bl.ocks.org/jfreyre/b1882159636cc9e1283a
        // but I wanted to create my own version!

        var firstColor = d3.color("#2fb9de");

        var secondColor = d3.color('#d3d3d3');

        // get the color properties.
        // https://github.com/d3/d3-color/blob/master/README.md#color


        colorRangeR = d3.scaleLinear().domain([i, allData.length]).range([firstColor.r, secondColor.r]);
        colorRangeG = d3.scaleLinear().domain([i, allData.length]).range([firstColor.g, secondColor.g]);
        colorRangeB = d3.scaleLinear().domain([i, allData.length]).range([firstColor.b, secondColor.b]);

        var colorRange = function (index) {
            return d3.rgb(colorRangeR(index), colorRangeG(index), colorRangeB(index));
        };

        var labelPosition = d3.arc()
            .outerRadius(pieRadius + 100)
            .innerRadius(pieRadius + 100);


        // add content and update graph.

        var arc = secondaryGraphGroup.selectAll(".arc")
            .data(deliciousPie(allData));

        arcWithEnter = arc
            .enter().append("g")
                .attr("class", "arc");

        arc.exit().remove();

        arcWithEnter
            .append("path")
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("d", 0)
                .transition(barTransitions.dataGrow)
                    .attr("d", calculatedPath)
                    .attr("fill", function(d, i) { return colorRange(i);});


        arc.select("path")
            .attr("d", 0)
            .transition(barTransitions.dataGrow)
                .attr("d", calculatedPath)
                .attr("fill", function(d, i) { return colorRange(i);});



        arcWithEnter
            .append("text")
                .attr("transform", function(d) { return "translate(" + labelPosition.centroid(d) + ")"; })
                .attr("dy", "1em")
                .attr("font-size", "2em")
                    .text(function(d) {
                        return d.data[secondaryGraphData.columnLabel];
                    });

        arc.select("text")
            .attr("transform", function(d) { return "translate(" + labelPosition.centroid(d) + ")"; })
            .text(function(d) {
                return d.data[secondaryGraphData.columnLabel];
            });

    } else {
        secondaryGraphGroup.html("");
    }
    // inspiration (and some lined used) from https://bl.ocks.org/mbostock/3887235
}



// create filter elements
function createFilters (side, fileData) {
    var footer = d3.select("body > footer");
    if (footer != undefined) {
        var section = footer.select("section:nth-child(" + (side === "left" ? 1 : 2) + ")");
        if (section != undefined) {

            section.html(""); // Remove the filters. No need to animate the recreation

            var filterData = fileData.filterData;
            if (filterData != undefined) {
                section.append("h3")
                    .text("Filter");
                for (var i = 0; i < filterData.length; i++) {
                    var formElement = section.append("form");

                    var filter = filterData[i];
                    var variants = filter.variantsFound;
                    if (variants != undefined) {

                        // make groups
                        var groups = formElement
                            .selectAll("span")
                                .data(variants)
                                    .enter()
                                        .append("span");

                        // put the filter inputs and labels in it.
                        var inputs = groups
                            .append("input")
                                .attr("id", function(d) {
                                    return fileData.id + "-|-" + i + "-|-" + d;
                                })
                                .attr("type", "radio")
                                .attr("name", "filter")
                                .attr("value", function(d) {
                                    return side + "-|-" + i + "-|-" + d; // side-filterId-filterData
                                })
                                // this should set only one radio button selected, but it isn't working.
                                .property('checked', function (d) {
                                    return d === filter.defaultValue ? true : false;
                                })
                                // I love filtering...
                                .on("change", applyFilter);


                        var labels = groups
                                .append("label")
                                    .attr("for", function(d) {
                                        return fileData.id + "-|-" + i + "-|-" + d;
                                    })
                                    .attr("type", "radio")
                                    .attr("value", function(d) {
                                        return d;
                                    })
                                    .text(function(d) {
                                        return d;
                                    });

                        // check the right selected filter after refreshing the filters.
                        inputs
                            .property('checked', function (d) {
                                return d === filter.defaultValue ? true : false;
                            });

                    }
                }
                return true;
            }
        }
    }
    return false;
}

// to check if a variable contains left / right.
var isLeftOrRight = {
    left : true,
    right : true
};

function applyFilter () {

    // get the data from the input element
    var filterDataString = this.value;
    if (filterDataString != undefined) {

        // make the data readable
        var filterDataArray = filterDataString.split("-|-");
        if (filterDataArray != undefined && filterDataArray.length === 3) {
            var leftRight = filterDataArray[0];
            var filterId = Number(filterDataArray[1]);
            var data = filterDataArray[2];

            // validate
            if (filterId != undefined && data != undefined && data != "" && isLeftOrRight[leftRight]) {

                // try to access the data with the given information.
                var fileData = getDataOfFile(graphManagement.selectedDataIndex[leftRight]);
                if (fileData) {

                    // now get the filter
                    var filterData = fileData.filterData;
                    if (filterData != undefined) {
                        var filter = filterData[filterId];
                        if (filter != undefined) {

                            // update the filter
                            filter.defaultValue = data;

                            // reload/update the graph
                            createMainGraph ();
                        }
                    }
                }
            }
        }
    }
}


// make it possible to access the dataset, by adding a button.
function addDataset (fileData) {

    var id = fileData.id;
    var friendlyName = fileData.friendlyName;
    if (id != undefined && friendlyName != undefined) {

        var footer = d3.select("body > footer");
        if (footer != undefined) {
            var sections = footer.selectAll("div:nth-child(2) section:nth-child(1), div:nth-child(2) section:nth-child(2)");
            var spanElement = sections.select("form")
                .append("span");

            // left set
            var index = 0;
            var input = spanElement
                .append("input")
                    .attr("id", function () {
                        index++;
                        return id + "-" + index;
                    })
                    .attr("value", id)
                    .attr("type", "radio")
                    .attr("name", "dataset")
                    .on("change", changeDataset);

            // right set
            index = 0;
            var label = spanElement
                .append("label")
                    .attr("for", function () {
                        index++;
                        return id + "-" + index;
                    })
                    .text(friendlyName);
        }
    }
}
