var createError = require('http-errors');
// Requiring module
const express = require('express');
const app = express();
var path = require('path');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

//var indexRouter = require('./routes/index');
//app.use('/', indexRouter);

const PORT = 3000;
app.use(express.static('public'));
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

const readline = require('readline');

let list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua & Barbuda",
    "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas",
    "Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
    "Bolivia","Bosnia & Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
    "Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad",
    "Chile","China","Colombia","Comoros","Republic of the Congo","Democratic Republic of the Congo",
    "Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic",
    "East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
    "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala",
    "Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran",
    "Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
    "Kiribati","North Korea","South Korea","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
    "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macedonia","Madagascar",
    "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
    "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
    "Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
    "Norway","Oman","Pakistan","Palestine","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines",
    "Poland","Portugal","Qatar","Romania","Russia","Rwanda","St Kitts & Nevis","St Lucia","Saint Vincent & the Grenadines",
    "Samoa","San Marino","Sao Tome & Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone",
    "Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain",
    "Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
    "Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
    "United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam",
    "Yemen","Zambia","Zimbabwe"];

let countryList = list.map(function(item) {
    return item.toLowerCase();
    });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// GET method route

app.get('/api/word1g', (req, res) => {
    res.set('Content-Type', 'text/html');
    const word1g = JSON.stringify('Enter first word: ')

    res.json(word1g)
  });

app.get('/api/testor', (req, res) => {
    res.set('Content-Type', 'text/html');
    const testor = JSON.stringify('ΑLΦΑQUΕΣΤOR - AN ALPHABET BASED WORD GAME.')

    res.json(testor)
  });

  // POST method route
app.post('/api/word1p',
    (req, res) => {
        res.send("POST Request Called")
    });




console.log("ΑLΦΑQUΕΣΤOR - AN ALPHABET BASED WORD GAME." +
    "\n" +
    "\nGame category = Countries of the World." +
    "\n24 round game, 24 available unique starting letters." +
    "\nNo countries currently exist with starting letters 'W' & 'X'." +
    "\n'W' & 'X' and all punctuation marks are ignored in this game." +
    "\nΑlφαqυεsτ concept, devised and written by Jude Shiels." +
    "\nCopyright (C) 2018 - Drakopoulos Games - All Rights Reserved");

const alpha1 = "abcdefghijklmnopqrstuvyz".split('');

rl.question('Enter first word: ', (word1) => {  
   word1 = word1.toLowerCase();
... (file truncated for brevity) ...
});
