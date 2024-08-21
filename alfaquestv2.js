var createError = require('http-errors');
// Requiring module
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.text({
    type: 'text/plain'
  }));
var path = require('path');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

const PORT = 3000;

app.use(express.static('public'));

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

let list = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
    "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas",
    "Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
    "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
    "Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad",
    "Chile","China","Colombia","Comoros","Republic of the Congo","Democratic Republic of the Congo",
    "Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic",
    "East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
    "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala",
    "Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran",
    "Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
    "Kiribati","North Korea","South Korea","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
    "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","North Macedonia","Madagascar",
    "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
    "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
    "Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
    "Norway","Oman","Pakistan","Palestine","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines",
    "Poland","Portugal","Qatar","Romania","Russia","Rwanda","St Kitts and Nevis","St Lucia","Saint Vincent and the Grenadines",
    "Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone",
    "Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Sudan","Spain",
    "Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
    "Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
    "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam",
    "Yemen","Zambia","Zimbabwe"];

let countryList = list.map(function(item) {
    return item.toLowerCase();
    });

console.log("ΑLΦΑQUΕΣΤOR - AN ALPHABET BASED WORD GAME." +
    "\n" +
    "\nGame category = Countries of the World." +
    "\n24 round game, 24 available unique starting letters." +
    "\nNo countries currently exist with starting letters 'W' & 'X'." +
    "\n'W' & 'X' and all punctuation marks are ignored in this game." +
    "\nΑlφαqυεsτor concept, devised and written by Jude Shiels." +
    "\nCopyright (C) 2018 - Drakopoulos Games - All Rights Reserved");

const alpha1 = "abcdefghijklmnopqrstuvyz".split('');

  // POST method route
  app.post('/api/word1',
    (req, res, next) => {
        const word1 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word1)


if (!word1.startsWith("a")) {
    res.status(404).send()
    console.error("Incorrect Answer or Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  } else if(countryList.indexOf(word1) === -1){
    res.status(404).send()
    console.error("Incorrect Answer or Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

  const alphaUsed1 = [word1.charAt(0), 'w', 'x'];
  //const alphaUsed1 = [word1.charAt(0), 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  console.log("letters used: "+alphaUsed1);

  if (alphaUsed1.length === 26) {
    res.status(201).send()
    res.send("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

  const remove1 = word1.charAt(0);
  let j1 = 0;
  let count1 = 1;
  const alpha2 = new Array(alpha1.length - count1);

  for (let i = 0; i < alpha1.length; i++) {
    if (alpha1[i] !== remove1) {
      alpha2[j1++] = alpha1[i];
    }
  }

  console.log("letters remaining: "+alpha2);

  let common1 = "";
  for (let jkl = 0; jkl < word1.length; jkl++) {
    for (let ijk = 0; ijk < alpha2.length; ijk++) {
      if (word1.charAt(jkl) === alpha2[ijk]) {
        common1 += word1.charAt(jkl) + "";
        break;
      }
    }
  }

  if(common1 === ""){
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
  } else {
    console.log("next letter1: " + common1[0].toUpperCase());
    const next1 = common1[0].toUpperCase()
    const used1 = alphaUsed1;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")

  }

// Second word setup
app.post('/api/word2',
    (req, res, next) => {
        const word2 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word2)
        

    // TODO handle with ARRAY

    if (word2.charAt(0) === common1.charAt(0) && countryList.indexOf(word2) === 1) {
        console.log("Second Word equals: " + word2)
    } else if(countryList.indexOf(word2) === -1){
        res.status(404).send()
        //console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
        process.exit(1));
    }

    // Add word1 first letter to alphaUsed ARRAY
    let alphaUsed2 = [word1.charAt(0), word2.charAt(0), 'w', 'x'];
    console.log("letters used: "+alphaUsed2);

    if (alphaUsed2.length === 26) {
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }

    // TODO remove startWith1 from array

    let j2 = 0;
    let count2 = 1;
    let alpha3 = new Array(alpha2.length - count2);
    let remove2 = word2.charAt(0);

    for (let i = 0; i < alpha2.length; i++) {
        if (alpha2[i] !== remove2) {
            alpha3[j2++] = alpha2[i];
        }
    }

    console.log("letters remaining: "+alpha3);

    let common2 = "";
    for (let jkl = 0; jkl < word2.length; jkl++) {
        for (let ijk = 0; ijk < alpha3.length; ijk++) {
            if (word2.charAt(jkl) === alpha3[ijk]) {
                common2 += word2.charAt(jkl) + "";
                break;
            }
        }
    }

    if(common2 === ""){
    res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
      } else {
      console.log("next letter2 :" + common2[0].toUpperCase())
      const next1 = common2[0].toUpperCase()
      const used1 = alphaUsed2;
      body1 = next1
      body2 = used1
      res.status(200).send(""+body1+" " +""+body2+"")
      }

    // third word setup
    app.post('/api/word3',
        (req, res, next) => {
            const word3 = req.body.toLowerCase();
            console.log('POST parameter received are: ', word3)

  if (word3.charAt(0) === common2.charAt(0) && countryList.indexOf(word3) === 1) {
    console.log("Third Word equals: " + word3);

} else if(countryList.indexOf(word3) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

  // Add word2 first letter to alphaUsed ARRAY
  const alphaUsed3 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), 'w', 'x'];
  console.log("letters used: "+alphaUsed3);

  if (alphaUsed3.length === 26) {
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

  // TODO remove startWith2 from array

  let j3 = 0;
  let count3 = 1;
  const alpha4 = new Array(alpha3.length - count3);
  const remove3 = word3.charAt(0);

  for (let i = 0; i < alpha3.length; i++) {
    if (alpha3[i] !== remove3) {
      alpha4[j3++] = alpha3[i];
    }
  }

  console.log("letters remaining: "+alpha4);

  let common3 = "";
  for (let jkl = 0; jkl < word3.length; jkl++) {
    for (let ijk = 0; ijk < alpha4.length; ijk++) {
      if (word3.charAt(jkl) === alpha4[ijk]) {
        common3 += word3.charAt(jkl) + "";
        break;
      }
    }
  }

if(common3 === ""){
res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
  } else {
  console.log("next letter3:" + common3[0].toUpperCase());
  const next1 = common3[0].toUpperCase()
  const used1 = alphaUsed3;
  body1 = next1
  body2 = used1
  res.status(200).send(""+body1+" " +""+body2+"")
  }

  // FOURTH WORD SETUP

  app.post('/api/word4',
    (req, res, next) => {
        const word4 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word4)
         
        

        if (word4.charAt(0) === common3.charAt(0) && countryList.indexOf(word4) === 1) {
        console.log("Fourth Word equals: " + word4);
    } else if(countryList.indexOf(word4) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
        process.exit(1));
      }

    let alphaUsed4 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), 'w', 'x'];
    console.log("letters used: "+alphaUsed4);

    if (alphaUsed4.length === 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }
    
    let j4 = 0;
    let count4 = 1;
    let alpha5 = new Array(alpha4.length - count4);
    let remove4 = word4.charAt(0);

    for (let ic = 0; ic < alpha4.length; ic++) {
        if (alpha4[ic] !== remove4)
            alpha5[j4++] = alpha4[ic];
    }

    console.log("letters remaining: "+alpha5);

    let common4 = "";
    for (let jkl = 0; jkl < word4.length; jkl++) {
        for (let ijk = 0; ijk < alpha5.length; ijk++) {
            if (word4.charAt(jkl) === alpha5[ijk]) {
                common4 += word4.charAt(jkl) + "";
                break;
            }
        }
    }

    if(common4 === ""){
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
    } else { 
    console.log("next letter4:" + common4[0].toUpperCase());
    const next1 = common4[0].toUpperCase()
    const used1 = alphaUsed4;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
    }

    // FIFTH WORD SETUP

    app.post('/api/word5',
        (req, res, next) => {
            const word5 = req.body.toLowerCase();
            console.log('POST parameter received are: ', word5)
             

    if (word5.charAt(0) === common4.charAt(0) && countryList.indexOf(word5) === 1) {
        console.log("Fifth Word equals: " + word5);
    } else if(countryList.indexOf(word5) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
        process.exit(1));
    }

    let alphaUsed5 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), 'w', 'x'];
    console.log("letters used: "+alphaUsed5);

    if (alphaUsed5.length == 26) {
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }

    let j5 = 0;
    let count5 = 1;
    let alpha6 = new Array(alpha5.length - count5);
    let remove5 = word5.charAt(0);

    for (let ic = 0; ic < alpha5.length; ic++) {
        if (alpha5[ic] != remove5) {
            alpha6[j5++] = alpha5[ic];
        }
    }

    console.log("letters remaining: "+alpha6);

    let common5 = "";
    for (let jkl = 0; jkl < word5.length; jkl++) {
        for (let ijk = 0; ijk < alpha6.length; ijk++) {
            if (word5.charAt(jkl) == alpha6[ijk]) {
                common5 += word5.charAt(jkl);
                break;
            }
        }
    }

    if(common5 === ""){
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
    } else {
     console.log("next letter5:" + common5[0].toUpperCase());  
     const next1 = common5[0].toUpperCase()
     const used1 = alphaUsed5;
     body1 = next1
     body2 = used1
     res.status(200).send(""+body1+" " +""+body2+"")
    }

    // SIXTH WORD SETUP
    app.post('/api/word6',
        (req, res, next) => {
            const word6 = req.body.toLowerCase();
            console.log('POST parameter received are: ', word6)
             

    if (word6.charAt(0) === common5.charAt(0) && countryList.indexOf(word6) === 1) {
        console.log("Sixth Word equals: " + word6);
    } else if(countryList.indexOf(word6) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }

    let alphaUsed6 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0),
        word5.charAt(0), word6.charAt(0), 'w', 'x'
    ];

    console.log("letters used: "+alphaUsed6);

    if (alphaUsed6.length == 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

    let j6 = 0;
    let count6 = 1;
    let alpha7 = new Array(alpha6.length - count6);
    let remove6 = word6.charAt(0);

    for (let ic = 0; ic < alpha6.length; ic++) {
        if (alpha6[ic] != remove6)
            alpha7[j6++] = alpha6[ic];
    }

    console.log("letters remaining: "+alpha7);

    let common6 = "";
    for (let jkl = 0; jkl < word6.length; jkl++) {
        for (let ijk = 0; ijk < alpha7.length; ijk++) {
            if (word6.charAt(jkl) == alpha7[ijk]) {
                common6 += word6.charAt(jkl) + "";
                break;
            }
        }
    }

    if(common6 === ""){
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
      } else {
      console.log("next letter6:" + common6[0].toUpperCase());
      const next1 = common6[0].toUpperCase()
      const used1 = alphaUsed6;
      body1 = next1
      body2 = used1
      res.status(200).send(""+body1+" " +""+body2+"")
      }

// SEVENTH WORD SETUP

app.post('/api/word7',
    (req, res, next) => {
        const word7 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word7)
         

    if (word7.charAt(0) === common6.charAt(0) && countryList.indexOf(word7) === 1) {
        console.log("Seventh Word equals: " + word7);
    } else if(countryList.indexOf(word7) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }

    // Add word3 first letter to alphaUsed ARRAY
    let alphaUsed7 = [word1.charAt(0), word2.charAt(0), word3.charAt(0),
        word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), 'w', 'x'
    ];

    console.log("letters used: "+alphaUsed7);

    if (alphaUsed7.length == 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");    
    process.exit(0);

}


    // TODO remove startWith2 from array

    let j7 = 0;
    let count7 = 1;
    let alpha8 = new Array(alpha7.length - count7);
    let remove7 = word7.charAt(0);

    for (let ic = 0; ic < alpha7.length; ic++) {
        if (alpha7[ic] != remove7)
            alpha8[j7++] = alpha7[ic];
    }

    console.log("letters remaining: "+alpha8);

    let common7 = "";
    for (let jkl = 0; jkl < word7.length; jkl++)
        for (let ijk = 0; ijk < alpha8.length; ijk++) {
            if (word7.charAt(jkl) == alpha8[ijk]) {
                common7 += word7.charAt(jkl) + "";
                break;
            }
        }

    if(common7 === ""){
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
      } else {
        console.log("next letter7:" + common7[0].toUpperCase());
        const next1 = common7[0].toUpperCase()
        const used1 = alphaUsed7;
        body1 = next1
        body2 = used1
        res.status(200).send(""+body1+" " +""+body2+"")
      }

    // EIGHT WORD SETUP
    app.post('/api/word8',
        (req, res, next) => {
            const word8 = req.body.toLowerCase();
            console.log('POST parameter received are: ', word8)
             

    if (word8.charAt(0) === common7.charAt(0) && countryList.indexOf(word8) === 1) {
        console.log("Eight Word equals: " + word8);
    } else if(countryList.indexOf(word8) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }

    let alphaUsed8 = [word1.charAt(0), word2.charAt(0), word3.charAt(0),
        word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0),
        word8.charAt(0), 'w', 'x'
    ];

    console.log("letters used: "+alphaUsed8);

    if (alphaUsed8.length == 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
}


    let j8 = 0;
    let count8 = 1;
    let alpha9 = new Array(alpha8.length - count8);
    let remove8 = word8.charAt(0);

    for (let ic = 0; ic < alpha8.length; ic++) {
        if (alpha8[ic] != remove8)
            alpha9[j8++] = alpha8[ic];
    }

    console.log("letters remaining: "+alpha9);

    let common8 = "";
    for (let jkl = 0; jkl < word8.length; jkl++)
        for (let ijk = 0; ijk < alpha9.length; ijk++) {
            if (word8.charAt(jkl) == alpha9[ijk]) {
                common8 += word8.charAt(jkl) + "";
                break;
            }
        }

    if(common8 === ""){
        res.status(400).send(),send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
      } else {
      console.log("next letter8:" + common8[0].toUpperCase());
      const next1 = common8[0].toUpperCase()
      const used1 = alphaUsed8;
      body1 = next1
      body2 = used1
      res.status(200).send(""+body1+" " +""+body2+"")
      }

    // NINTH WORD SETUP

    app.post('/api/word9',
        (req, res, next) => {
            const word9 = req.body.toLowerCase();
            console.log('POST parameter received are: ', word9)
             

  if (word9.charAt(0) == common8.charAt(0)) {
    console.log("Ninth Word equals: " + word9);
} else if(countryList.indexOf(word9) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

  let alphaUsed9 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), 'w', 'x'];

  console.log("letters used: "+alphaUsed9);

  if (alphaUsed9.length == 26) {
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

  let j9 = 0;
  let count9 = 1;
  let alpha10 = new Array(alpha9.length - count9);
  let remove9 = word9.charAt(0);

  for (let ic = 0; ic < alpha9.length; ic++) {
    if (alpha9[ic] != remove9) {
      alpha10[j9++] = alpha9[ic];
    }
  }

  console.log("letters remaining: "+alpha10);

  let common9 = "";
  for (let jkl = 0; jkl < word9.length; jkl++) {
    for (let ijk = 0; ijk < alpha10.length; ijk++) {
      if (word9.charAt(jkl) == alpha10[ijk]) {
        common9 += word9.charAt(jkl) + "";
        break;
      }
    }
  }

  if(common9 === ""){
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
    } else {
    console.log("next letter9:" + common9[0].toUpperCase());
    const next1 = common9[0].toUpperCase()
    const used1 = alphaUsed9;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
    }

  // TENTH WORD SETUP

  app.post('/api/word10',
    (req, res, next) => {
        const word10 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word10)
         

  if (word10.charAt(0) === common9.charAt(0) && countryList.indexOf(word10) === 1) {
    console.log("Tenth Word equals: " + word10);
} else if(countryList.indexOf(word10) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

  let alphaUsed10 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), 'w', 'x'];

  console.log("letters used: "+alphaUsed10);

  if (alphaUsed10.length == 26) {
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

  let j10 = 0;
  let count10 = 1;
  let alpha11 = new Array(alpha10.length - count10);
  let remove10 = word10.charAt(0);

  for (let ic = 0; ic < alpha10.length; ic++) {
    if (alpha10[ic] != remove10) {
      alpha11[j10++] = alpha10[ic];
    }
  }

  console.log("letters remaining: "+alpha11);

  let common10 = "";
  for (let jkl = 0; jkl < word10.length; jkl++) {
    for (let ijk = 0; ijk < alpha11.length; ijk++) {
      if (word10.charAt(jkl) == alpha11[ijk]) {
        common10 += word10.charAt(jkl) + "";
        break;
      }
    }
  }

  if(common10 === ""){
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
  } else {
    console.log("next letter10: " + common10[0].toUpperCase());
    const next1 = common10[0].toUpperCase()
    const used1 = alphaUsed10;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

  // ELEVENTH WORD SETUP

  app.post('/api/word11',
    (req, res, next) => {
        const word11 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word11)
         

  if (word11.charAt(0) === common10.charAt(0) && countryList.indexOf(word11) === 1) {
    console.log("Eleventh Word equals: " + word11);
} else if(countryList.indexOf(word11) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

  let alphaUsed11 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0),
    word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), 'w', 'x'
  ];

  console.log("letters used: "+alphaUsed11);

  if (alphaUsed11.length == 26){
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

  let j11 = 0;
  let count11 = 1;
  let alpha12 = new Array(alpha11.length - count11);
  let remove11 = word11.charAt(0);

  for (let ic = 0; ic < alpha11.length; ic++) {
    if (alpha11[ic] != remove11)
      alpha12[j11++] = alpha11[ic];
  }

  console.log("letters remaining: "+alpha12);

  let common11 = "";
  for (let jkl = 0; jkl < word11.length; jkl++) {
    for (let ijk = 0; ijk < alpha12.length; ijk++) {
      if (word11.charAt(jkl) == alpha12[ijk]) {
        common11 += word11.charAt(jkl) + "";
        break;
      }
    }
  }

  if(common11 === ""){
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
  } else {
    console.log("next letter11: " + common11[0].toUpperCase());
    const next1 = common11[0].toUpperCase()
    const used1 = alphaUsed11;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

  // TWELFTH WORD SETUP

  app.post('/api/word12',
    (req, res, next) => {
        const word12 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word12)
         

  if (word12.charAt(0) === common11.charAt(0) && countryList.indexOf(word12) === 1) {
    console.log("Twelfth Word equals: " + word12);
} else if(countryList.indexOf(word12) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

  let alphaUsed12 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), word12.charAt(0), 'w', 'x'];

  console.log("letters used: "+alphaUsed12);

  if (alphaUsed12.length == 26) {
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

  let j12 = 0;
  let count12 = 1;
  let alpha13 = new Array(alpha12.length - count12);
  let remove12 = word12.charAt(0);

  for (let ic = 0; ic < alpha12.length; ic++) {
    if (alpha12[ic] != remove12) {
      alpha13[j12++] = alpha12[ic];
    }
  }

  console.log("letters remaining: "+alpha13);

  let common12 = "";
  for (let jkl = 0; jkl < word12.length; jkl++) {
    for (let ijk = 0; ijk < alpha13.length; ijk++) {
      if (word12.charAt(jkl) == alpha13[ijk]) {
        common12 += word12.charAt(jkl) + "";
        break;
      }
    }
  }

  if(common12 === ""){
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
  } else {
    console.log("next letter12: " + common12[0].toUpperCase());
    const next1 = common12[0].toUpperCase()
    const used1 = alphaUsed12;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

  // THIRTEENTH WORD SETUP

  app.post('/api/word13',
    (req, res, next) => {
        const word13 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word13)
         

  if (word13.charAt(0) === common12.charAt(0) && countryList.indexOf(word13) === 1) {
    console.log("Thirteenth Word equals: " + word13);
} else if(countryList.indexOf(word13) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

  let alphaUsed13 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0),
    word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0),
    word12.charAt(0), word13.charAt(0), 'w', 'x'
  ];

  console.log("letters used: "+alphaUsed13);

  if (alphaUsed13.length == 26){
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

  let j13 = 0;
  let count13 = 1;
  let alpha14 = new Array(alpha13.length - count13);
  let remove13 = word13.charAt(0);

  for (let ic = 0; ic < alpha13.length; ic++) {
    if (alpha13[ic] != remove13)
      alpha14[j13++] = alpha13[ic];
  }

  console.log("letters remaining: "+alpha14);

  let common13 = "";
  for (let jkl = 0; jkl < word13.length; jkl++) {
    for (let ijk = 0; ijk < alpha14.length; ijk++) {
      if (word13.charAt(jkl) == alpha14[ijk]) {
        common13 += word13.charAt(jkl) + "";
        break;
      }
    }
  }

  if(common13 === ""){
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
  } else {
    console.log("next letter13: " + common13[0].toUpperCase());
    const next1 = common13[0].toUpperCase()
    const used1 = alphaUsed13;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

  // FOURTEENTH WORD SETUP
  app.post('/api/word14',
    (req, res, next) => {
        const word14 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word14)
         

if (word14.charAt(0) == common13.charAt(0)) {
    console.log("Fourteenth Word equals: " + word14);
} else if(countryList.indexOf(word14) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

const alphaUsed14 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), 'w', 'x'];

console.log("letters used: "+alphaUsed14);

if (alphaUsed14.length == 26){
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
  }

let j14 = 0;
let count14 = 1;
const alpha15 = new Array(alpha14.length - count14);
const remove14 = word14.charAt(0);

for (let ic = 0; ic < alpha14.length; ic++) {
    if (alpha14[ic] != remove14)
        alpha15[j14++] = alpha14[ic];
}

console.log("letters remaining: "+alpha15);

let common14 = "";
for (let jkl = 0; jkl < word14.length; jkl++) {
    for (let ijk = 0; ijk < alpha15.length; ijk++) {
        if (word14.charAt(jkl) == alpha15[ijk]) {
            common14 += word14.charAt(jkl) + "";
            break;
        }
    }
}

if(common14 === "") {
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
} else {
    console.log("next letter14: " + common14[0].toUpperCase());
    const next1 = common14[0].toUpperCase()
    const used1 = alphaUsed14;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

// FIFTEENTH
// WORD SETUP

app.post('/api/word15',
    (req, res, next) => {
        const word15 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word15)
         

    if (word15.charAt(0) === common14.charAt(0) && countryList.indexOf(word15) === 1) {
        console.log("Fifteenth Word equals: " + word15);
    } else if(countryList.indexOf(word15) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }

    // Add word3
    // first letter
    // to alphaUsed
    // ARRAY
    let alphaUsed15 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0), 'w', 'x'];

    console.log("letters used: "+alphaUsed15);

    if (alphaUsed15.length == 26) {
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }

    // TODO remove
    // startWith2
    // from array

    let j15 = 0;
    let count15 = 1;
    let alpha16 = new Array(alpha15.length - count15);
    let remove15 = word15.charAt(0);

    for (let ic = 0; ic < alpha15.length; ic++) {
        if (alpha15[ic] != remove15) {
            alpha16[j15++] = alpha15[ic];
        }
    }

    console.log("letters remaining: "+alpha16);

    let common15 = "";
    for (let jkl = 0; jkl < word15.length; jkl++) {
        for (let ijk = 0; ijk < alpha16.length; ijk++) {
            if (word15.charAt(jkl) == alpha16[ijk]) {
                common15 += word15.charAt(jkl) + "";
                break;
            }
        }
    }
    
    if(common15 === "") {
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
    } else {
        console.log("next letter15: " + common15[0].toUpperCase());
        const next1 = common15[0].toUpperCase()
        const used1 = alphaUsed15;
        body1 = next1
        body2 = used1
        res.status(200).send(""+body1+" " +""+body2+"")
      }

    // SIXTEENTH
// WORD
// SETUP
app.post('/api/word16',
    (req, res, next) => {
        const word16 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word16)
         

 if (word16.charAt(0) === common15.charAt(0) && countryList.indexOf(word16) === 1) {
    console.log("Sixteenth Word equals: " + word16);
} else if(countryList.indexOf(word16) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

// Add word3
// first
// letter to
// alphaUsed
// ARRAY
const alphaUsed16 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0), word16.charAt(0), 'w', 'x'];

console.log("letters used: "+alphaUsed16);

if (alphaUsed16.length == 26){
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
    }

// TODO
// remove
// startWith2
// from
// array

let j16 = 0;
let count16 = 1;
const alpha17 = new Array(alpha16.length - count16);
const remove16 = word16.charAt(0);

for (let ic = 0; ic < alpha16.length; ic++) {
    if (alpha16[ic] != remove16)
        alpha17[j16++] = alpha16[ic];
}

console.log("letters remaining: "+alpha17);

let common16 = "";
for (let jkl = 0; jkl < word16.length; jkl++) {
    for (let ijk = 0; ijk < alpha17.length; ijk++) {
        if (word16.charAt(jkl) == alpha17[ijk]) {
            common16 += word16.charAt(jkl) + "";
            break;
        }
    }
}

if(common16 === "") {
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
} else {
    console.log("next letter16: " + common16[0].toUpperCase());
    const next1 = common16[0].toUpperCase()
    const used1 = alphaUsed16;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

// SEVENTEENTH
// WORD
// SETUP

app.post('/api/word17',
    (req, res, next) => {
        const word17 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word17)
         

if (word17.charAt(0) === common16.charAt(0) && countryList.indexOf(word17) === 1) {
    console.log("Seventeenth Word equals: " + word17);
} else if(countryList.indexOf(word17) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

// Add
// word3
// first
// letter
// to
// alphaUsed
// ARRAY
const alphaUsed17 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0), word16.charAt(0), word17.charAt(0), 'w', 'x'];

console.log("letters used: "+alphaUsed17);

if (alphaUsed17.length === 26) {
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
}

// TODO
// remove
// startWith2
// from
// array

let j17 = 0;
let count17 = 1;
const alpha18 = new Array(alpha17.length - count17);
const remove17 = word17.charAt(0);

for (let ic = 0; ic < alpha17.length; ic++) {
    if (alpha17[ic] !== remove17) {
        alpha18[j17++] = alpha17[ic];
    }
}

console.log("letters remaining: "+alpha18);

let common17 = "";
for (let jkl = 0; jkl < word17.length; jkl++) {
    for (let ijk = 0; ijk < alpha18.length; ijk++) {
        if (word17.charAt(jkl) === alpha18[ijk]) {
            common17 += word17.charAt(jkl);
            break;
        }
    }
}

if(common17 === "") {
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
} else {
    console.log("next letter17: " + common17[0].toUpperCase());
    const next1 = common17[0].toUpperCase()
    const used1 = alphaUsed17;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

// EIGHTEENTH
// WORD
// SETUP

app.post('/api/word18',
    (req, res, next) => {
        const word18 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word18)
         

if (word18.charAt(0) === common17.charAt(0) && countryList.indexOf(word18) === 1) {
    console.log("Eighteenth Word equals: " + word18);
} else if(countryList.indexOf(word18) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

// Add
// word3
// first
// letter
// to
// alphaUsed
// ARRAY
const alphaUsed18 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0), word16.charAt(0), word17.charAt(0), word18.charAt(0), 'w', 'x'];

console.log("letters used: "+alphaUsed18);

if (alphaUsed18.length === 26) {
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
}

// TODO
// remove
// startWith2
// from
// array

let j18 = 0;
let count18 = 1;
const alpha19 = new Array(alpha18.length - count18);
const remove18 = word18.charAt(0);

for (let ic = 0; ic < alpha18.length; ic++) {
    if (alpha18[ic] !== remove18) {
        alpha19[j18++] = alpha18[ic];
    }
}

console.log("letters remaining: "+alpha19);

let common18 = "";
for (let jkl = 0; jkl < word18.length; jkl++) {
    for (let ijk = 0; ijk < alpha19.length; ijk++) {
        if (word18.charAt(jkl) === alpha19[ijk]) {
            common18 += word18.charAt(jkl) + "";
            break;
        }
    }
}

if(common18 === "") {
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
} else {
    console.log("next letter18: " + common18[0].toUpperCase());
    const next1 = common18[0].toUpperCase()
    const used1 = alphaUsed18;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

// NINETEENTH
// WORD
// SETUP

app.post('/api/word19',
    (req, res, next) => {
        const word19 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word19)
         

if (word19.charAt(0) === common18.charAt(0) && countryList.indexOf(word19) === 1) {
    console.log("Nineteenth Word equals: " + word19);
} else if(countryList.indexOf(word19) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

// Add
// word3
// first
// letter
// to
// alphaUsed
// ARRAY
const alphaUsed19 = [word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0), word16.charAt(0), word17.charAt(0), word18.charAt(0), word19.charAt(0), 'w', 'x'];

console.log("letters used: "+alphaUsed19);

if (alphaUsed19.length == 26){
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
    }

// TODO
// remove
// startWith2
// from
// array

let j19 = 0;
let count19 = 1;
const alpha20 = new Array(alpha19.length - count19);
const remove19 = word19.charAt(0);

for (let ic = 0; ic < alpha19.length; ic++) {
    if (alpha19[ic] != remove19)
        alpha20[j19++] = alpha19[ic];
}

console.log("letters remaining: "+alpha20);

let common19 = "";
for (let jkl = 0; jkl < word19.length; jkl++) {
    for (let ijk = 0; ijk < alpha20.length; ijk++) {
        if (word19.charAt(jkl) == alpha20[ijk]) {
            common19 += word19.charAt(jkl) + "";
            break;
        }
    }
}

if(common19 === "") {
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
} else {
    console.log("next letter19: " + common19[0].toUpperCase());
    const next1 = common19[0].toUpperCase()
    const used1 = alphaUsed19;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

// TWENTIETH
// WORD
// SETUP
app.post('/api/word20',
    (req, res, next) => {
        const word20 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word20)
         

if (word20.charAt(0) === common19.charAt(0) && countryList.indexOf(word20) === 1) {
    console.log("Twentieth Word equals: " + word20);
} else if(countryList.indexOf(word20) === -1){
    res.status(404).send()
    console.error("Invalid String or Incorrect Spelling, GAME OVER");
    return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
  }

// Add
// word3
// first
// letter
// to
// alphaUsed
// ARRAY
const alphaUsed20 = [
    word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0),
    word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0),
    word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0),
    word16.charAt(0), word17.charAt(0), word18.charAt(0), word19.charAt(0), word20.charAt(0),
    'w', 'x'
];

console.log("letters used: "+alphaUsed20);

if (alphaUsed20.length == 26){
    res.status(201).send()
    console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
    process.exit(0);
    }

// TODO
// remove
// startWith2
// from
// array

let j20 = 0;
let count20 = 1;
const alpha21 = new Array(alpha20.length - count20);
const remove20 = word20.charAt(0);

for (let ic = 0; ic < alpha20.length; ic++) {
    if (alpha20[ic] != remove20)
        alpha21[j20++] = alpha20[ic];
}

console.log("letters remaining: "+alpha21);

let common20 = "";
for (let jkl = 0; jkl < word20.length; jkl++) {
    for (let ijk = 0; ijk < alpha21.length; ijk++) {
        if (word20.charAt(jkl) == alpha21[ijk]) {
            common20 += word20.charAt(jkl) + "";
            break;
        }
    }
}

if(common20 === "") {
    res.status(400).send()
    console.error("You have ran out of letters, GAME OVER");
    return next(new Error('You have ran out of letters, GAME OVER'),
    process.exit(1));
} else {
    console.log("next letter20: " + common20[0].toUpperCase());
    const next1 = common20[0].toUpperCase()
    const used1 = alphaUsed20;
    body1 = next1
    body2 = used1
    res.status(200).send(""+body1+" " +""+body2+"")
  }

// TWENTY FIRST WORD SETUP

app.post('/api/word21',
    (req, res, next) => {
        const word21 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word21)
         

    if (word21.charAt(0) === common20.charAt(0) && countryList.indexOf(word21) === 1) {
        console.log("Twenty First Word equals: " + word21);
    } else if(countryList.indexOf(word21) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
        process.exit(1));
      }

    let alphaUsed21 = [
        word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0),
        word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0),
        word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0),
        word16.charAt(0), word17.charAt(0), word18.charAt(0), word19.charAt(0), word20.charAt(0),
        word21.charAt(0), 'w', 'x'
    ];

    console.log("letters used: "+alphaUsed21);

    if (alphaUsed21.length == 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }

    let j21 = 0;
    let count21 = 1;
    let alpha22 = new Array(alpha21.length - count21);
    let remove21 = word21.charAt(0);

    for (let ic = 0; ic < alpha21.length; ic++) {
        if (alpha21[ic] != remove21)
            alpha22[j21++] = alpha21[ic];
    }

    console.log("letters remaining: "+alpha22);

    let common21 = "";
    for (let jkl = 0; jkl < word21.length; jkl++) {
        for (let ijk = 0; ijk < alpha22.length; ijk++) {
            if (word21.charAt(jkl) == alpha22[ijk]) {
                common21 += word21.charAt(jkl) + "";
                break;
            }
        }
    }

    if(common21 === "") {
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
    } else {
        console.log("next letter21: " + common21[0].toUpperCase());
        const next1 = common21[0].toUpperCase()
        const used1 = alphaUsed21;
        body1 = next1
        body2 = used1
        res.status(200).send(""+body1+" " +""+body2+"")
      }

    // TWENTY
// SECOND
// WORD
// SETUP

app.post('/api/word22',
    (req, res, next) => {
        const word22 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word22)
         

    if (word22.charAt(0) === common21.charAt(0) && countryList.indexOf(word22) === 1) {
        console.log("Twenty Second Word equals: " + word22);
    } else if(countryList.indexOf(word22) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }

    // Add
    // word3
    // first
    // letter
    // to
    // alphaUsed
    // ARRAY
    const alphaUsed22 = [
        word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0),
        word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0),
        word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0),
        word16.charAt(0), word17.charAt(0), word18.charAt(0), word19.charAt(0), word20.charAt(0),
        word21.charAt(0), word22.charAt(0), 'w', 'x'
    ];

    console.log("letters used: "+alphaUsed22);

    if (alphaUsed22.length == 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
        }

    // TODO
    // remove
    // startWith2
    // from
    // array

    let j22 = 0;
    let count22 = 1;
    const alpha23 = new Array(alpha22.length - count22);
    const remove22 = word22.charAt(0);

    for (let ic = 0; ic < alpha22.length; ic++) {
        if (alpha22[ic] != remove22)
            alpha23[j22++] = alpha22[ic];
    }

    console.log("letters remaining: "+alpha23);

    let common22 = "";
    for (let jkl = 0; jkl < word22.length; jkl++) {
        for (let ijk = 0; ijk < alpha23.length; ijk++) {
            if (word22.charAt(jkl) == alpha23[ijk]) {
                common22 += word22.charAt(jkl) + "";
                break;
            }
        }
    }
    
    if(common22 === "") {
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
    } else {
        console.log("next letter22: " + common22[0].toUpperCase());
        const next1 = common22[0].toUpperCase()
        const used1 = alphaUsed22;
        body1 = next1
        body2 = used1
        res.status(200).send(""+body1+" " +""+body2+"")
      }

// TWENTY
// THIRD
// WORD
// SETUP

app.post('/api/word23',
    (req, res, next) => {
        const word23 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word23)
         

    if (word23.charAt(0) === common22.charAt(0) && countryList.indexOf(word23) === 1) {
        console.log("Twenty Third Word equals: " + word23);
    } else if(countryList.indexOf(word23) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }


    // Add
    // word3
    // first
    // letter
    // to
    // alphaUsed
    // ARRAY
    const alphaUsed23 = [
        word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0),
        word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0),
        word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0),
        word16.charAt(0), word17.charAt(0), word18.charAt(0), word19.charAt(0), word20.charAt(0),
        word21.charAt(0), word22.charAt(0), word23.charAt(0), 'w', 'x'
    ];

    if (alphaUsed23.length == 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }
    console.log("letters used: "+alphaUsed23);

    // TODO
    // remove
    // startWith2
    // from
    // array

    let j23 = 0;
    let count23 = 1;
    const alpha24 = new Array(alpha23.length - count23);
    const remove23 = word23.charAt(0);

    for (let ic = 0; ic < alpha23.length; ic++) {
        if (alpha23[ic] != remove23)
            alpha24[j23++] = alpha23[ic];
    }

    console.log("letters remaining: "+alpha24);

    let common23 = "";
    for (let jkl = 0; jkl < word23.length; jkl++) {
        for (let ijk = 0; ijk < alpha24.length; ijk++) {
            if (word23.charAt(jkl) == alpha24[ijk]) {
                common23 += word23.charAt(jkl) + "";
                break;
            }
        }
    }
    
    if(common23 === "") {
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
    } else {
        console.log("next letter24: " + common24[0].toUpperCase());
        const next1 = common24[0].toUpperCase()
        const used1 = alphaUsed24;
        body1 = next1
        body2 = used1
        res.status(200).send(""+body1+" " +""+body2+"")
      }

    // TWENTY
// FOURTH
// WORD
// SETUP

app.post('/api/word24',
    (req, res, next) => {
        const word24 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word24)
         

    if (word24.charAt(0) === common23.charAt(0) && countryList.indexOf(word24) === 1) {
        console.log("Twenty Fourth Word equals: " + word24);
    } else if(countryList.indexOf(word24) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }


    const alphaUsed24 = [
        word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0),
        word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0),
        word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0),
        word16.charAt(0), word17.charAt(0), word18.charAt(0), word19.charAt(0), word20.charAt(0),
        word21.charAt(0), word22.charAt(0), word23.charAt(0), word24.charAt(0), 'w', 'x'
    ];

    console.log("letters used: "+alphaUsed24);

    if (alphaUsed24.length == 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }
    let j24 = 0;
    let count24 = 1;
    const alpha25 = new Array(alpha24.length - count24);
    const remove24 = word24.charAt(0);

    for (let ic = 0; ic < alpha24.length; ic++) {
        if (alpha24[ic] != remove24)
            alpha25[j24++] = alpha24[ic];
    }

    console.log("letters remaining: "+alpha24);

    let common24 = "";
    for (let jkl = 0; jkl < word24.length; jkl++) {
        for (let ijk = 0; ijk < alpha25.length; ijk++) {
            if (word24.charAt(jkl) == alpha25[ijk]) {
                common24 += word24.charAt(jkl) + "";
                break;
            }
        }
    }
    
    if(common24 === "") {
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
    } else {
        console.log("next letter25: " + common25[0].toUpperCase());
        const next1 = common25[0].toUpperCase()
        const used1 = alphaUsed25;
        body1 = next1
        body2 = used1
        res.status(200).send(""+body1+" " +""+body2+"")
      }

    // TWENTY
// FIFTH
// WORD
// SETUP

app.post('/api/word25',
    (req, res, next) => {
        const word25 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word25)
         

    if (word25.charAt(0) === common24.charAt(0) && countryList.indexOf(word25) === 1) {
        console.log("Twenty Fifth Word equals: " + word25);
    } else if(countryList.indexOf(word25) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }

    const alphaUsed25 = [
        word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0),
        word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0),
        word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0),
        word16.charAt(0), word17.charAt(0), word18.charAt(0), word19.charAt(0), word20.charAt(0),
        word21.charAt(0), word22.charAt(0), word23.charAt(0), word24.charAt(0), word25.charAt(0),
        'w', 'x'
    ];

    console.log("letters used: "+alphaUsed25);

    if (alphaUsed25.length == 26) {
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }

    let j25 = 0;
    let count25 = 1;
    const alpha26 = new Array(alpha25.length - count25);
    const remove25 = word25.charAt(0);

    for (let ic = 0; ic < alpha25.length; ic++) {
        if (alpha25[ic] != remove25) {
            alpha26[j25++] = alpha25[ic];
        }
    }

    console.log("letters remaining: "+alpha25);

    let common25 = "";
    for (let jkl = 0; jkl < word25.length; jkl++) {
        for (let ijk = 0; ijk < alpha26.length; ijk++) {
            if (word25.charAt(jkl) == alpha26[ijk]) {
                common25 += word25.charAt(jkl) + "";
                break;
            }
        }
    }

    if(common25 === "") {
        res.status(400).send()
        console.error("You have ran out of letters, GAME OVER");
        return next(new Error('You have ran out of letters, GAME OVER'),
        process.exit(1));
    } else {
        console.log("next letter26: " + common26[0].toUpperCase());
        const next1 = common26[0].toUpperCase()
        const used1 = alphaUsed26;
        body1 = next1
        body2 = used1
        res.status(200).send(""+body1+" " +""+body2+"")
      }

// TWENTY
// SIXTH
// WORD
// SETUP

app.post('/api/word26',
    (req, res, next) => {
        const word26 = req.body.toLowerCase();
        console.log('POST parameter received are: ', word26)
         

    if (word26.charAt(0) === common25.charAt(0) && countryList.indexOf(word26) === 1) {
        console.log("Twenty Sixth Word equals: " + word26);
    } else if(countryList.indexOf(word26) === -1){
        res.status(404).send()
        console.error("Invalid String or Incorrect Spelling, GAME OVER");
        return next(new Error('Incorrect Answer or Spelling, GAME OVER'),
    process.exit(1));
      }

    const alphaUsed26 = [
        word1.charAt(0), word2.charAt(0), word3.charAt(0), word4.charAt(0), word5.charAt(0), word6.charAt(0), word7.charAt(0), word8.charAt(0), word9.charAt(0), word10.charAt(0), word11.charAt(0), word12.charAt(0), word13.charAt(0), word14.charAt(0), word15.charAt(0), word16.charAt(0), word17.charAt(0), word18.charAt(0), word19.charAt(0), word20.charAt(0), word21.charAt(0), word22.charAt(0), word23.charAt(0), word24.charAt(0), word25.charAt(0), word26.charAt(0), 'w', 'x'
    ];

    console.log("letters used: "+alphaUsed26);

    if (alphaUsed26.length == 26){
        res.status(201).send()
        console.log("Bravo! You have successfully completed this game of ΑLΦΑQUΕΣΤOR!");
        process.exit(0);
    }

    let j26 = 0;
    let count26 = 1;
    const alpha27 = new Array(alpha26.length - count26);
    const remove26 = word26.charAt(0);

    for (let ic = 0; ic < alpha26.length; ic++) {
        if (alpha26[ic] != remove26)
            alpha27[j26++] = alpha26[ic];
    }

    console.log("letters remaining: "+alpha26);

    let common26 = "";
    for (let jkl = 0; jkl < word26.length; jkl++) {
        for (let ijk = 0; ijk < alpha27.length; ijk++) {
            if (word26.charAt(jkl) == alpha27[ijk]) {
                common26 += word26.charAt(jkl) + "";
                break;
            }
        }
    }
    module.exports = app;
});
});

});
});

});
});
});

});
});
});
});
});


});
});

});

});

});
});

});

});    

});

});

});
});
});
}); 