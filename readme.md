# Data file reader, cleaner and more or less my own system to view my data

Tableau Public, great tool, especially that you can script in it while visualizing your data. What it most importantly can't do is give me full control. So I decided to build something more than the assignment 3, something that would save me from my frustrations caused by tools that are stubborn.

---
---
---

## File splitsing
I made the decision to split up my files because of two important reasons.
* **Too long**.
* You do not want to view a css reset file, honestly a waste of your time.

### Javascript files
There are 3 javascript files.
* index.js _Which will is where all the action begins and it contains information of how the files will be read_
* fileDataFunctions.js _Contains (medium/large)functions that are will do a lot of the processing + some experimental functions_
* utility.js _Contains some usefull functions, from me and external sources._

### Styling
* index.css // All the action
* reset.css // Boring

---
---
---

## Data

For cleaning the data I used most of the time the split function. Which is actualy one best methods in my opinion. 
1. Just count the page lines 
1. Split the whole document by page line  
1. Remove the not needed lines.
1. Merge the others with the join function and you are done.

``` javascript
var lines = data.split("\n");

lines.splice(0,3); // remove 3 lines

data = lines.join("\n"); // join and finished!
```

Ofcourse there is more to it. Take a look in the code for that.

---
---
---

### Files
* Geboorte__kerncijfer_171017230756.csv
* NFL_fandom_data-surveymonkey.csv

---
---
---

## Features
* **d3.csvParseRows** https://github.com/d3/d3-dsv#csvParseRows
* **replaceAll** https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
* **fileExists]** https://stackoverflow.com/questions/15054182/javascript-check-if-file-exists
* **d3.scaleLinear()** https://github.com/d3/d3-scale#continuous-scales
* **domain** https://www.dashingd3js.com/d3js-scales
* **d3.max** https://github.com/d3/d3-3.x-api-reference/blob/master/Arrays.md
* **d3.min** https://github.com/d3/d3-3.x-api-reference/blob/master/Arrays.md
* **.rangeRound** https://github.com/d3/d3-scale#continuous_rangeRound
* **.on("click",** https://stackoverflow.com/questions/27499864/addeventlistener-to-div-appended-in-d3
* **d3.data** https://github.com/d3/d3-selection/blob/master/README.md#selection_data
* **tickFormat** https://github.com/d3/d3-axis/blob/master/README.md#axis_tickFormat

And many more...

---
---
---

## How to load the files?

### Set-up

#### Step 1
Open index.js
---

---

#### Step 2
If you are custom a custom folder, please fill in the path. (~ line 80)

``` javaScript
var pathStart = ""; // example: ./dataFiles/
```
---

---

#### Step 3

For writing down the file information scroll down to the variable 'allFileData'. This variable contains which files have to be loaded and most in important how that are loaded. Each file has it's own object. **(required)**

``` javascript 
{
    // This is your new file
}
```
---

---

#### Step 4

Fill in your metadata. It is not yet used by the script, but it will help you keep track of your sources. Feel free to customize it.

``` javascript
metadata : {
    owner : //, creator/creators
    source : // link to the source
},
```
---

---

#### Step 5

Define how you want JavaScript to read your file. For dirty data it is recommended to use the text variant. **(required)**

Formats:(string)
* csv
* tsv
* text

And any other format that is supported by d3. (future proof)

``` javaScript
readAsType :  // "csv" / "tsv" / "text"  //
```
---

---

#### Step 6

Define the graph you are going to use. Only the bar chart is supported. This function might change later. It might change to an array, for supporting multiple graphs. For now fill in as a string _"bar"_. **(required)**
``` javascript 
graphType : "bar",
```
---

---

#### Step 7

Fill in the identifier. Keep it simple, camelCase recommended. **(required)**
``` javaScript
id : // "id"
```
---

---

#### Step 8
It is possible to validate columns if you fill in the mustBeFilledIn object.
If you want to use this feature you have to make use of the prepareData function. Which is already located below. 

``` javascript
mustBeFilledIn : [
    "column/object key" : true // true is validate. False or not fill in is not validate
]
```

The prepareData function will clean your columns and data. Validate data and also it will simplify your columns. So for example from(column): "#this is MY column " TO "this_is_my_column"

``` javascript
prepareData(container);
```
---

---

#### Step 9

Now add your own filters within a few lines!

See the property: filterData
``` javascript
filterData : [
    // {} filter
    // {} filter 2
]
```

Easy filters?
``` javascript
{
    filterOn : // column
    friendlyName :  // title name (used in html)
    filterFunction : function (d) { // how do you want to filter it?
        return d[this.filterOn] === this.defaultValue; // default value will be generated
    },
}
```

Advanced filters? 
Disable the prepareFilters function and will not look for variants to generate the filter. If you have done this, you can add your fully customized filters. (the prepareFilters can be found at the end of the whole object)

``` javascript
prepareFilters (allData, container.filterData);
```
---

---

#### Step 10
You are done with filling the settings. Now it is time to edit which processes you need to preform in order to prepare you data.

``` javascript
var processes = [
    // function
];
```

Within the startFunction(first function that gets executed) there are the order of the processes defined. If you scroll a little bit down you can see the array with all the processes. Every process is a function which the code will execute in order. It will return the data you have edited(under variable >allData<). So you can use mutators as well as non mutators on the data.

``` javascript
processes : {
    processName1 : function (container, allData) {
        return allData;
    },
    processName2 : function (container, allData) {
        return allData;
    }
}
```
---

---

#### Step 11
Set-up your graph data.
---
Insert within the variable container under the key >mainGraph< an object with all the data you need for you graph.

---
---
---

## Licence

### Data sources:
* **Geboorte__kerncijfer_171017230756.csv** By the CBS : http://statline.cbs.nl/Statweb/publication/?DM=SLNL&PA=37201&D1=0%2c2-3%2c6&D2=5-16&D3=22-26&HDR=T&STB=G1%2cG2&VW=D
* **NFL_fandom_data-surveymonkey.csv** By dmil : https://github.com/fivethirtyeight/data/blob/master/nfl-fandom/NFL_fandom_data-surveymonkey.csv




