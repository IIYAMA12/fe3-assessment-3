// utility functions //

////////////////////////////////////
// Created by: Imortenson
// link https://stackoverflow.com/questions/15054182/javascript-check-if-file-exists
function fileExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
}
////////////////////////////////////

// Created by: Cory Gross.
// Edited by: Peter Mortensen
// link https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
function replaceAll(theString, search, replacement) {
    // console.log("theString", theString);
    return theString.replace(new RegExp(search, 'g'), replacement);
}
////////////////////////////////////

function removeAllSpecialCharacters (theString) {
    // Created by: Petar Ivanov
    // link: https://stackoverflow.com/questions/6555182/remove-all-special-characters-except-space-from-a-string-using-javascript
    return theString.replace(/[^a-zA-Z ]/g, "");
}


function getObjectItemCount (theObject) {
    var count = 0;
    for (var prop in theObject) {
        count++;
    }
    return count;
}


// Created by: Oleg
// Link: https://stackoverflow.com/questions/26067081/date-sorting-with-d3-js
function sortByDateAscending(a, b) {
    // Dates will be cast to numbers automagically:
    return a.datum - b.datum;
}
////////////////////////////////////


// deepClose
// by trincot
// Titel:  Here is an ES6 function that will also work for objects with cyclic references:
// Link: https://stackoverflow.com/questions/4459928/how-to-deep-clone-in-javascript

function deepClone(obj, hash = new WeakMap()) {
    if (Object(obj) !== obj) return obj; // primitives
    if (hash.has(obj)) return hash.get(obj); // cyclic reference
    var result = Array.isArray(obj) ? []
               : obj.constructor ? new obj.constructor() : Object.create(null);
    hash.set(obj, result);
    if (obj instanceof Map)
        Array.from(obj, ([key, val]) => result.set(key, deepClone(val, hash)) );
    return Object.assign(result, ...Object.keys(obj).map (
        key => ({ [key]: deepClone(obj[key], hash) }) ));
}
