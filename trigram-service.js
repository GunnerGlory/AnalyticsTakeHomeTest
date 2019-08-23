/* eslint-disable no-prototype-builtins */
/**
 * 
 * trigram Service 
 * 
 */

'use strict';

const fs = require ('fs');
const path = require ('path');
const db = require ('./trigram-db');

const trigramService = new Object ();

trigramService.createTrigramAnalysis = function (data, cb) {
  let text = data.toString ('utf8');
  text = text.replace (/(\r\n|\n|\r)/gm, ' ');
  let textArray = text.split (' ');

  let trigramAnalysisObject = {};
  let firstWord = '';
  let secondWord = '';
  let thirdWord = '';
  for (let i = 0; i < textArray.length; i++) {
    firstWord = textArray[i];
    if (i + 1 < textArray.length && i + 2 < textArray.length) {
      thirdWord = textArray[i + 2];
      secondWord = textArray[i + 1];
    } else {
      continue;
    }

    let key = `${firstWord} ${secondWord}`;

    if (key in trigramAnalysisObject) {
      let el = trigramAnalysisObject[`${firstWord} ${secondWord}`];
      el.push (thirdWord);
      trigramAnalysisObject[`${firstWord} ${secondWord}`] = el;
    } else {
      let newEl = new Array ();
      newEl.push (thirdWord);
      trigramAnalysisObject[`${firstWord} ${secondWord}`] = newEl;
    }
  }
  cb (trigramAnalysisObject);
};

trigramService.generateNewText = function (inputObj, cb) {
  let firstWord, secondWord, thirdWord = '';
  let newText = 'No text generated.';
  let trigram = JSON.parse (inputObj.trigrams);
  let trigramKey = inputObj.seedWord;
  let count = 0;

  while (trigram.hasOwnProperty (trigramKey)) {
    if (count == 0) {
      newText = trigramKey;
    }
    if (count == inputObj.maxSize) {
      break;
    }
    thirdWord = trigram[trigramKey];
    thirdWord = thirdWord[Math.floor (Math.random () * thirdWord.length)];
    [firstWord, secondWord] = trigramKey.split (' ');
    newText = newText + ' ' + thirdWord;
    trigramKey = secondWord + ' ' + thirdWord;
    count++;
  }
  cb (newText);
};

trigramService.upload = function (file_name, cb) {
  fs.readFile (file_name, (err, data) => {
    if (err) throw err;
    let file_nm = path.basename (file_name);
    trigramService.createTrigramAnalysis (data, kvTrigram => {
      db.putFile (
        file_nm,
        data,
        Object.keys (kvTrigram).length,
        JSON.stringify (kvTrigram),
        (err, success) => {
            cb(err, success);
        }
      );
    });
  });
};


trigramService.listFiles = function (cb) {
  db.getFiles ((err, rows) => {
    if(err) {
        cb(err, []);
        return;
    }  
    cb(err, rows)
  });
};

trigramService.generateNewTextFromTrigram = function (fileId, maxSize, seedWord, cb) {
  db.getFile (fileId, (err, row) => {
    if(err || row === undefined){
        var error = new Error(`No record for ${fileId} id found.`);
        return cb(error, row);
    }
    let inputObj = {
      fileName: row.file_name,
      trigrams: row.trigrams,
      maxSize: maxSize,
      seedWord: seedWord,
    };
    trigramService.generateNewText (inputObj, newText => {
      cb (err, newText);
    });
  });
};

trigramService.getFileInfo = function (file_id, cb) {
  db.getFile (file_id, (err, row) => {
    cb(err, row);
  });
};

module.exports = trigramService;
