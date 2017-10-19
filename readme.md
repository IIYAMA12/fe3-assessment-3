# Data file reader, cleaner and more or less my own system to view my data

Tableau Public, great tool, especially that you can script in it while visualizing your data. What it most importantly can't do is give me full control. So I decided to build something more than the assignment 3, something that would save me from my frustrations caused by tools that are stubborn.

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


### Files
* Geboorte__kerncijfer_171017230756.csv
* NFL_fandom_data-surveymonkey.csv

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

## Licence

### Data sources:
* **Geboorte__kerncijfer_171017230756.csv** By the CBS : http://statline.cbs.nl/Statweb/publication/?DM=SLNL&PA=37201&D1=0%2c2-3%2c6&D2=5-16&D3=22-26&HDR=T&STB=G1%2cG2&VW=D
* **NFL_fandom_data-surveymonkey.csv** By dmil : https://github.com/fivethirtyeight/data/blob/master/nfl-fandom/NFL_fandom_data-surveymonkey.csv




