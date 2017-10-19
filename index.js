// wait for the website to load, then start loading the files.
window.onload = function () {

    // prepare the graph data, used by defining how the graph will look like. (executed in visualRepresentation.js)
    prepareGraphManagementData ();

    // use a timer to load to files (which helps older browsers to not process too much in one time)
    var index = 0;
    var loadingTimer;
    loadingTimer = setInterval(function () {

        // get the data from the table below, which contains all information how the file must be handled.
        var fileData = allFileData[index];
        index++;

        // A usefull function that I found to check if the file exist. In Firefox using it, will result in this warning:
        /*
            Synchronous XMLHttpRequest op de hoofdthread wordt niet meer ondersteund vanwege de nadelige effecten op de eindgebruikerservaring. Zie http://xhr.spec.whatwg.org/ voor meer informatie
        */
        // But it still works!

        if (fileExists(fileData.path)) {

            // now use the data fill in the d3 file read request.
            d3[fileData.readAsType](fileData.path, function (error, allData) {
                fileData.startFunction(error, allData);
            });

        } else {
            console.log("Can't find file:", fileData.path);
        }
        if (index >= allFileData.length) {
            clearInterval(loadingTimer);
        }
    }, 100);

    /*
        I found the function d3.queue(). Which would work even better than the code I wrote on top.
        The only problem wirth that is that I have to do the chaining differently because the data comes out of a table.

    */

    // Development below. Will be finished later.

    /*
        var allFileData = getAllFileData ();
        var queue = d3.queue();

        for (var i = 0; i < allFileData.length; ++i) {
            // var fileData = allFileData[i];
            // add a task
            queue.defer(function (callback) {
                d3[allFileData[i].readAsType](allFileData[i].path, function (error, allData) {
                    allFileData[i].startFunction(error, allData);
                    callback(null); // go on
                });
            });
        }

        // make the queue wait till the callback has been called. (per task)
        queue.awaitAll(function(error) {
            if (error) throw error;
        });
    */

    // loading multiple files or doing multiple tasks
    // https://github.com/d3/d3-queue
};



// ----------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------------------



var pathStart = ""; // ./dataFiles/

var allFileData = [

    {
        // write the rest of the path. pathStart will be added in front of the path below.
        path : "Geboorte__kerncijfer_171017230756.csv",  // *

        metaData : {
            owner : "CBS",
            source : "http://statline.cbs.nl/Statweb/publication/?DM=SLNL&PA=37201&D1=0%2c2-3%2c6&D2=5-16&D3=22-26&HDR=T&STB=G1%2cG2&VW=D"
        },

        readAsType : "text", // csv / tsv / text  // *

        // set up how the data should be created
        graphType : "bar", // bar / line  // *

        // give the data an id. (don't add spaces and special characters are not recommended)
        id : "geboorteCijfers", // *

        // give it a friendlyName / title
        friendlyName : "Geboorte cijfers", // *

        // fill in columns that must be filled in. If not filled in, they will be deleted.
        mustBeFilledIn : {
            // format: column : true OR column : false OR do not fill in.
        },

        // fill UP dates (not updates) Which is data used for empty dates within a range.
        fillUpDates : [
            // format: [key, value]
            ["regios", ""],
            ["gemiddeld_kindertal_per_vrouw", 0],
            ["levend_geboren_jongens", 0],
            ["levend_geboren_meisjes", 0],
            ["totaal_levend_geboren_kinderen", 0],
            ["date", "date"]
        ],
        // this indicates if the file has been ready. (pls leave it default >false<)
        ready : false,
        filterData : [
        // filter format
        /*
            {
                filterOn : "", // column
                friendlyName : "", // title name
                defaultValue : "", // the default selected value (optional)
                filterFunction : function (d) { // how do you want to filter it?
                    return d[this.filterOn] === this.defaultValue; // default
                },
            }
        */
            {
                filterOn : "regios", // column
                friendlyName : "Regio's", // title name
                filterFunction : function (d) { // how do you want to filter it?
                    return d[this.filterOn] === this.defaultValue; // default
                },
            }
        ],

        timeParseFormats : {date : "%Y"},

        //

        startFunction : function (error, allData) {
            if (error) throw error;



            // all processes. Please feel to add and remove processes below.
            var processes = [
                this.processes.preProcessFunction,
                this.processes.processFunction,
                this.processes.afterProcessFunction,
                this.processes.prepareGraphFunction,
                this.processes.prepareSecondaryGraphFunction
            ];
            // status if a process fails.
            var oneProcessFailed = false;

            // run all processes
            var i;

            for (i = 0; i < processes.length; i++) {
                allData = processes[i](this, allData);
                if (allData == undefined || !allData || typeof(allData) == "string" || typeof(allData) == "number") {
                    oneProcessFailed = true;
                    break;
                }
            }

            // all processes successfully executed?
            if (!oneProcessFailed) {
                this.endFunction(this, allData);
            } else {
                console.log("From file >", this.id, "< A process at index:", i, "has failed.");
            }
        },

        //

        processes : {
            preProcessFunction : function (container, allData) { // run all processes) { // before reading
                // Hard clean your data.


                var allDataInLines = allData.split("\n");

                // remove the first three lines
                allDataInLines.splice(0,3);

                // remove the last line.
                allDataInLines.splice(allDataInLines.length - 2, 1);

                allData = allDataInLines.join("\n");



                /* My own documentation. please ignore */
                // With the split function you can split up a string based one a character. (in this case a new line)
                // It returns an array.
                // I found an example here: https://stackoverflow.com/questions/2528076/delete-a-line-of-text-in-javascript
                // https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Global_Objects/String/split
                // with the join function you can merg array string(/numbers) items to one string. It also allows you to put a character between the items. In LUA I would use table.concat for that.
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join


                // replace different csv format, to the d3 support one.
                allData = replaceAll(allData, ";", ",");


                // new columns, put them dirty in, but will be cleaned later.
                var newColumns = ["Regio's", "date", "Totaal levend geboren kinderen", "Levend geboren jongens", "Levend geboren meisjes", "Gemiddeld kindertal per vrouw"];


                // ready to parse:
                allData = d3.csvParseRows(allData, function (allData) {
                    var item = {};
                    for (var i = 0; i < allData.length; i++) {
                        item[newColumns[i]] = allData[i];
                    }
                    return item;
                });


                container.allData = allData;

                return allData;
            },
            processFunction : function (container, allData) { // after reading

                // The data is ready to be read, add here your pre-edit functions

                // you can find the prepareData function in the file: fileDataFunctions.js
                // It is used to clean and remove broken data. Feel free to edit and customize it.
                // Also fill in the mustBeFilledIn array(see top), if you want to filter on missing data.

                prepareData(container);

                // add here your edit functions


                //
                return allData;
            },
            afterProcessFunction : function (container, allData) {
                // Still need to change data? Please do it here.

                //
                return allData;
            },
            prepareGraphFunction : function (container, allData) {

                // get the default main graph data
                var mainGraphDefaultData = getGraphManagement().mainGraphDefaultData;

                var height = mainGraphDefaultData.height,
                    width = mainGraphDefaultData.width;

                // set up the scale
                var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
                    y = d3.scaleLinear().rangeRound([height, 0]);

                // set up the domain
                var allDates = allData.map(function(d) {
                    return d.date;
                });


                var yearMin = d3.min(allDates),
                    yearMax = d3.max(allDates);



                // https://github.com/d3/d3-time#interval_range
                var maxYearForRange = new Date(yearMax.getTime());
                // make a copy of a date: https://stackoverflow.com/questions/28332484/is-there-a-way-to-copy-date-object-into-another-date-object-without-using-a-refe
                var dateRange = d3.timeYear.range(yearMin, maxYearForRange.setFullYear(maxYearForRange.getFullYear() + 1));

                // How to change years for a date.
                // https://stackoverflow.com/questions/37002681/subtract-days-months-years-from-a-date-in-javascript

                x.domain(dateRange);

                y.domain([0, d3.max(allData, function(d) {
                    return d.gemiddeld_kindertal_per_vrouw;
                })]);


                // prepare the setup for defining the graph
                container.mainGraph = {
                    x : x,
                    columnX : "date", // which column do we use for the x as? (can also be a custom index)
                    columnXFriendlyName : "Perioden", // title for data of column x
                    y : y,
                    columnY : "gemiddeld_kindertal_per_vrouw", // which column do we use for the y as? (can also be a custom index)
                    columnYFriendlyName : "Gemiddeld kindertal per vrouw", // title for data of column y
                    ticks : [10], // [1,2,3] // add ticks

                    barWidth : x.bandwidth(), //x.bandwidth(), // Can use the bandwidth: mainGraphData.x.bandwidth();
                    tickFormatX : d3.timeFormat("%Y"),
                    tickFormatY : function(d) { return d + "x"; },
                    labelFormat : function(d) { return d + " x"; }

                    // need tickFormat or labelFormat. Please uncomment below the things you need.
                    /*
                        tickFormatX : function(d) { return d; },
                        tickFormatY : function(d) { return d; },

                        labelFormat : function(d) { return d; }
                    */
                };

                return allData;
            },
            prepareSecondaryGraphFunction : function (container, allData) {
                container.secondaryGraph = {
                    column : "date",
                    columnLabel : "regios"
                };
                return allData;
            }
        },

        //

        endFunction : function (container, allData) {

            // data is ready to use.
            container.ready = true;

            // add filters for the graph >>> UNDER CONSTRUCTION <<<
            if (container.filterData != undefined && container.filterData.length > 0) {
                prepareFilters (allData, container.filterData);
            }

            // Add the ref to the html, to load this data.
            addDataset(container);


        }
    },



    // ----------------------------------------------------------------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------------------------------------------------------------

    // NEXT FILE

    // ----------------------------------------------------------------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------------------------------------------------------------

    // ----------------------------------------------------------------------------------------------------------------------------------------------------



    {
        // write the rest of the path. pathStart will be added in front of the path below.
        path : "NFL_fandom_data-surveymonkey.csv",  // *

        metaData : {
            owner : "dmil",
            source : "https://github.com/fivethirtyeight/data/blob/master/nfl-fandom/NFL_fandom_data-surveymonkey.csv"
        },

        readAsType : "text", // csv / tsv / text  // *

        // set up how the data should be created
        graphType : "bar", // bar / line  // *

        // give the data an id. (don't add spaces and special characters are not recommended)
        id : "NFL", // *

        // give it a friendlyName / title
        friendlyName : "Reactions given to NFL teams by fans.", // *

        // fill in columns that must be filled in. If not filled in, they will be deleted.
        mustBeFilledIn : {
            // format: column : true OR column : false OR do not fill in.
        },

        // fill UP dates (not updates) Which is data used for empty dates within a range.
        fillUpDates : [
            // format: [key, value]
        ],
        // this indicates if the file has been ready. (pls leave it default >false<)
        ready : false,
        filterData : [
        // filter format
        /*
            {
                filterOn : "", // column
                friendlyName : "", // title name
                defaultValue : "", // the default selected value (optional)
                filterFunction : function (d) { // how do you want to filter it?
                    return d[this.filterOn] === this.defaultValue; // default
                },
            }
        */
            {
                defaultValue : "Show all", // the default selected value (optional)
                variantsFound : ["Show only responses higher than 100", "Show only responses higher than 200", "Show only responses higher than 300", "Show all"],
                convertVariantsToNumber : {"Show all" : 0, "Show only responses higher than 100" : 100, "Show only responses higher than 200" : 200, "Show only responses higher than 300" : 300},
                filterFunction : function (d) { // how do you want to filter it?
                    return Number(d.tot_respondents) > Number(this.convertVariantsToNumber[this.defaultValue]); // default
                },
            }
        ],

        timeParseFormats : null,

        //

        startFunction : function (error, allData) {
            if (error) throw error;



            // all processes. Please feel to add and remove processes below.
            var processes = [
                this.processes.preProcessFunction,
                this.processes.processFunction,
                this.processes.afterProcessFunction,
                this.processes.prepareGraphFunction,
                this.processes.prepareSecondaryGraphFunction
            ];
            // status if a process fails.
            var oneProcessFailed = false;

            // run all processes
            var i;

            for (i = 0; i < processes.length; i++) {
                allData = processes[i](this, allData);
                if (allData == undefined || !allData || typeof(allData) == "string" || typeof(allData) == "number") {
                    oneProcessFailed = true;
                    break;
                }
            }

            // all processes successfully executed?
            if (!oneProcessFailed) {
                this.endFunction(this, allData);
            } else {
                console.log("From file >", this.id, "< A process at index:", i, "has failed.");
            }
        },

        //

        processes : {
            preProcessFunction : function (container, allData) { // run all processes) { // before reading
                // Hard clean your data.


                var allDataInLines = allData.split("\n");

                var firstLine = allDataInLines[0];

                // interesting to clean a row and get all values of places where there is data. (not used)
                var groups = firstLine.split(",").filter(function (d) {
                    d = replaceAll(d, " ", "");
                    if (d.length > 0) {
                        return d.trim();
                    }
                    return null;
                });

                // check for double columns
                var alreadyUsedColumns = {};
                var newColumns = [];
                var columns = allDataInLines[1].split(",");
                for (var i = 0; i < columns.length; i++) {
                    var column = columns[i];

                    if (alreadyUsedColumns[column]) {

                        // make unique columns
                        do {
                            column += "double";
                        } while (alreadyUsedColumns[column]);
                    }

                    column = replaceAll(column, "%", "Precent");

                    alreadyUsedColumns[column] = true;
                    newColumns[newColumns.length] = column;
                }


                // remove the first and second line
                allDataInLines.splice(0,2);


                // remove the last line.
                allDataInLines.splice(allDataInLines.length - 2, 1);

                // join everything back again.
                allData = allDataInLines.join("\n");







                // ready to parse:
                allData = d3.csvParseRows(allData, function (allData) {
                    var item = {};
                    for (var i = 0; i < allData.length; i++) {
                        item[newColumns[i]] = allData[i];
                    }
                    return item;
                });


                container.allData = allData;

                return allData;
            },
            processFunction : function (container, allData) { // after reading

                // The data is ready to be read, add here your pre-edit functions

                // you can find the prepareData function in the file: fileDataFunctions.js
                // It is used to clean and remove broken data. Feel free to edit and customize it.
                // Also fill in the mustBeFilledIn array(see top), if you want to filter on missing data.

                prepareData(container);

                // add here your edit functions


                //
                return allData;
            },
            afterProcessFunction : function (container, allData) {
                // Still need to change data? Please do it here.

                // to many results to show, so make it 20.
                for (var i = allData.length - 1; i > 19; i--) {
                    allData.splice(i, 1)
                }
                //
                return allData;
            },
            prepareGraphFunction : function (container, allData) {

                // get the default main graph data
                var mainGraphDefaultData = getGraphManagement().mainGraphDefaultData;

                var height = mainGraphDefaultData.height,
                    width = mainGraphDefaultData.width;

                // set up the scale
                var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
                    y = d3.scaleLinear().rangeRound([height, 0]);

                // set up the domain


                x.domain(allData.map(function (d) {
                    return d.team;
                }));

                y.domain([0, d3.max(allData, function(d) {
                    return d.tot_respondents;
                })]);


                // prepare the setup for defining the graph
                container.mainGraph = {
                    x : x,
                    columnX : "team", // which column do we use for the x as? (can also be a custom index)
                    columnXFriendlyName : "Teams", // title for data of column x
                    y : y,
                    columnY : "tot_respondents", // which column do we use for the y as? (can also be a custom index)
                    columnYFriendlyName : "Totale fan reacties", // title for data of column y
                    ticks : [10], // [1,2,3] // add ticks

                    barWidth : x.bandwidth(), //x.bandwidth(), // Can use the bandwidth: mainGraphData.x.bandwidth();


                    // need tickFormat or labelFormat. Please uncomment below the things you need.
                    /*
                        tickFormatX : function(d) { return d; },
                        tickFormatY : function(d) { return d; },

                        labelFormat : function(d) { return d; }
                    */
                };

                return allData;
            },
            prepareSecondaryGraphFunction : function (container, allData) {
                container.secondaryGraph = {
                    column : "tot_respondents",
                    columnLabel : "team"
                };
                return allData;
            }
        },

        //

        endFunction : function (container, allData) {

            // data is ready to use.
            container.ready = true;

            // add filters for the graph
            if (container.filterData != undefined && container.filterData.length > 0) {
                // prepareFilters (allData, container.filterData); // disabled the auto filter, because I set this manualy.
            }

            // Add the ref to the html, to load this data.
            addDataset(container);


        }
    }



];



// quick path edit.
for (var i = 0; i < allFileData.length; i++) {
    allFileData[i].path = pathStart + allFileData[i].path;
}

function getAllFileData () {
    return allFileData;
}

function getDataOfFile (index) {
    return allFileData[index];
}
