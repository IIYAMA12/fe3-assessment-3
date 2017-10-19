
var parseTimeHourMinute = d3.timeParse("%H:%M");
// https://github.com/d3/d3-time-format


// a global data cleaner
function prepareData (fileData) {
    var allData = fileData.allData;

    // these columns must contain values
    var mustBeFilledIn = fileData.mustBeFilledIn != undefined ? fileData.mustBeFilledIn : [];

    var timeParseFormats = fileData.timeParseFormats; // syntax: {column:format, column:format}
    if (timeParseFormats == undefined) {
        timeParseFormats = {};
    }

    var columnCount = getObjectItemCount(allData[0]); // get the column count based on the first item.
    // todo I have to check this later: allData.columns.length

    for (var i = allData.length - 1; i > -1 ;i--) { // invert loop for slice (else it will skip items, because the array becomes shorter)

        var data = allData[i];

        if (data != undefined) {

            // define how many checks the item has to pass in order to be OK.
            var checks = columnCount;

            // check all properties
            for (var prop in data) {
                var value = data[prop];

                // please be lowercase, no need to think about it later.
                var newProp = prop.toLowerCase();

                // not sure if it is possible, but I do not want undefined or nulls converted to strings. Will result in "undefined"/"null" with the >String< function.
                if (value == undefined) {
                    value = "";
                }

                // convert numbers to strings, for the string functions below. (afaik I once has numbers in stead of strings, probably because it were actualy numbers or booleans >0,1<
                value = String(value);

                // remove special characters
                newProp = removeAllSpecialCharacters(newProp);

                // trim arround
                newProp = newProp.trim();
                value = value.trim();

                // replace spaces
                newProp = replaceAll(newProp, " ", "_");


                // remove new lines
                value = replaceAll(value, "\n", "");


                // make it a number to check if it is a number
                var convertedToNumber = Number(value);

                if (newProp === "datum" || newProp === "date") { // maybe a date?

                    // parse the date
                    var timeParseFormat = timeParseFormats[prop] != undefined ? timeParseFormats[prop] : "%d-%m-%Y";
                    var convertedToDate = d3.timeParse(timeParseFormat)(value);


                    // no date found? Make a backup (for debug + fixing later purposes)
                    if (value == undefined) {
                        data[prop + "_backup"] = value;
                    }

                    value = convertedToDate;


                } else if (value.search(":") > 0  && value.search("-") <= 0  && (newProp.search("tijd") > 0 || newProp.search("time") > 0 )) { // is it ONLY time?

                    value = parseTimeHourMinute(value);
                    if (value != undefined) {
                        var hours = value.getHours();
                        value = Math.round((value.getMinutes() / 60) + hours);
                    }
                } else if (convertedToNumber && !isNaN(convertedToNumber)) { // Is it a number?
                    value = convertedToNumber;
                }

                // remove old data, with old index.
                delete data[prop];

                if ((!mustBeFilledIn[prop]) || (value != "undefined" && value != null && value !== "" && !isNaN(value))) { // OK property is correct.

                    // lets assign it to the new index.
                    data[newProp] = value;

                    // drop the check count till it is zero. Zero = OK
                    checks--;

                } else { // Property NOT OK, break the property check loop
                    break;
                }
            }

            // this will allow me to debug the item and see where it came from.
            data.debugIndex = i;

            // give it an id. Which is actually the same value as the debugIndex. But can be used for NON debug purposes, this is done for definition purposes.
            data.id = i;

            // item is invalid remove it.
            if (checks !== 0) {
                allData.splice(i, 1);
            }

        } else { // no item found? Shouldn't be happening, but just incase remove it.
            allData.splice(i, 1);
        }
    }

    // sort the date.
    allData = allData.sort(sortByDateAscending);

    return allData;

}


// ----------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------------------


// option for filtering data in the graph. (might not be used)
function prepareFilters (allData, filterData) {
    // loop though all filters
    for (var i = 0; i < filterData.length; i++) {
        var filterOn = filterData[i].filterOn; // for example filter on 'device'

        // find all data variants (for example device: smartphone, tablet, laptop)
        var variantsFound = {}; // register here

        // collect here. Looping through an array LATER is much faster than looping though an object.
        // It also keeps the data in order.
        var variantsFoundCollector = [];

        // set a defaultValue.
        var defaultValue;

        // loop though all items and collect variants.
        for (var j = 0; j < allData.length; j++) {
            var data = allData[j];
            var value = data[filterOn];

            if (undefined != value && !variantsFound[value]) {

                if (defaultValue == undefined) {
                    defaultValue = value;
                }

                variantsFound[value] = true; // found it! so do not add again.
                variantsFoundCollector[variantsFoundCollector.length] = value;
            }
        }

        filterData[i].defaultValue = defaultValue;

        // return all prepared filters.
        filterData[i].variantsFound = variantsFoundCollector;
    }
}


// ----------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------------------


// Remove data from an object under multiple conditions. I prefer mutators, because I wany my data to stay linked.
function removeDataWithCondition (allData, conditions) {
    for (var i = allData.length - 1; i > -1; i--) { // invert the loop, because we are using splice. Else it will skip items.
        var data = allData[i];
        if (data) {
            for (var j = 0; j < conditions.length; j++) {
                if (conditions[j](data)) {
                    allData.splice(i, 1);
                }
            }
        }
    }
    return allData;
}

// Usage
/*
    removeDataWithCondition (allData,
        [
            // condition 1
            function (d) {
                return false; // do NOT remove
            },
            // condition 2
            function (d) {
                return true; // do remove
            }
        ]
    );
*/


// ----------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------------------


// remove double dates from data
// [and adds more within a range]. This is usefull if you want to show data from A to B, but not skipping dates
// fileData = container
// dateIndex = Defines at which index is the date.
// groupAtColumn = where is it grouped? (for example there is a column devices, which you do not want to share the same dates)
// dateRange = An array which contains a number of dates. Every date that is missing will be filled in.
// This is how you make a dateRange: var dateRange = d3.timeDay.range(new Date(2017, 8, 19), new Date(2017, 9, 18), 1); // 2017-09-19T22:00:00.000Z > 2017-10-17T22:00:00.000Z https://github.com/d3/d3-time#interval_range
// syntax fixDates (object fileData, date dateIndex, [string groupAtColumn, array array dateRange])
function fixDates (fileData, dateIndex, groupAtColumn, dateRange) {
    console.log("fixDates");
    var allData = fileData.allData;
    var fillUpDates = fileData.fillUpDates;

    // dates that are used
    var usedDates = {};

    // groups that are used. (only filled in if you defined >groupAtColumn<)
    var usedGroups = [];

    // remove data which uses the same date.
    removeDataWithCondition (allData, [
        function (d) {


            // check for groups
            if (groupAtColumn != undefined) {
                var group = d[groupAtColumn];
                if (group) {
                    if (!usedDates[group]) {
                        usedDates[group] = {};
                        usedGroups[usedGroups.length] = group;
                    }

                    if (usedDates[group][d[dateIndex]]) {
                        return true; // remove item
                    } else {
                        usedDates[group][d[dateIndex]] = true;
                    }
                }
            } else {

                if (usedDates[d[dateIndex]]) {
                    return true; // remove item
                } else {
                    usedDates[d[dateIndex]] = true;
                }
            }
            return false; // do not remove item
        }
    ]);

    

    // fill up required?
    if (fillUpDates != undefined && fillUpDates.length > 0 && dateRange != undefined) {
        console.log("yes");
        // Adds missing dates: fill > up > date > hole. NOT >UPDATE< :( !!!!
        var fillUpDateHole = function  (allData, group, date) {

            var newData = {}; // prepare a new object

            // loop through the fill up data
            for (var j = 0; j < fillUpDates.length; j++) {
                var fillUp = fillUpDates[j];

                var key = fillUp[0];
                var data = fillUp[1];

                // set the group or date of the new data.
                if (data == "group") {
                    data = group; // if data is group then fill in the group.
                } else if (data == "date") {
                    data = date; // if data is date then fill in the date.
                }
                newData[key] = data;
            }

            allData[allData.length] = newData;
        };

        for (var i = 0; i < dateRange.length; i++) {
            var date = dateRange[i];

            // with group
            if (groupAtColumn != undefined) {

                // loop the found groups
                for (var g = 0; g < usedGroups.length; g++) {
                    var group = usedGroups[g];
                    var notFound = true;

                    // loop the data
                    for (var j = allData.length - 1; j > -1 ; j--) {
                        var data = allData[j];
                        if (data[dateIndex] != undefined) {
                            if (data[dateIndex].getDate() === date.getDate() && data[dateIndex].getMonth() === date.getMonth() && data[groupAtColumn] == group) { // It seems like this date exist in a group.
                                notFound = false; // yes found, stop looping the data.
                                break;
                            }
                        } else { // It seems the data doesn't have a date, lets remove it.
                            allData.splice(j, 1);
                        }
                    }
                    // no date found? Fill it up!
                    if (notFound) {
                        fillUpDateHole(allData, group, date);
                    }
                }
            } else { // without group
                var notFound = true;

                // loop the data
                for (var j = allData.length - 1; j > -1 ; j--) {
                    var data = allData[j];
                    if (data[dateIndex] != undefined) {
                        if (data[dateIndex].getDate() === date.getDate() && data[dateIndex].getMonth() === date.getMonth()) { // It seems like this date exist.
                            notFound = false; // yes found, stop looping the data.
                            break;
                        }
                    } else { // It seems the data doesn't have a date, lets remove it.
                        allData.splice(j, 1);
                    }
                }
                // no date found? Fill it up!
                if (notFound) {
                    fillUpDateHole(allData, group, date);
                }
            }
        }
    }
    return allData;
}
