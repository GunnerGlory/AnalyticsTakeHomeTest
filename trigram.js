/* eslint-disable no-prototype-builtins */
/**
 * Command Line interface. Calls the trigram service.
 * Allowable commands are upload, files and file:
 * 
 *    node trigram upload <file_to_upload> -> uploads a new file
      node trigram files -> returns list of files that have been uploaded
      node trigram file id=1 -> returns info about a single file
        id : file id
      node trigram generate id= maxSize= seedWords=
        id = file id
        maxSize: Max number of words to generate
        seedWords: Starting two letter word that is the key to start generating new text
 */

'use strict';

const trigramService = require ('./trigram-service');
const command = process.argv[2];
const InvalidTrigramArgumentException = {};

switch (command) {
  case 'upload': {
    let file_name = process.argv[3];
    trigramService.upload (file_name, (err, success) => {
      if (success) {
        console.log("File Uploaded successfully");
      }
      else {
        console.log(err);
      }
    });
    break;
  }
  case 'files':
    trigramService.listFiles ((err, rows) => {
      if (err) {
        console.log (err.message);
        return;
      }
      rows.forEach (file => {
        console.log (`${file.file_id}: ${file.file_name}`);
      });
    });
    break;
  case 'file': {
    let arg = process.argv[3];
    let key, value, fileId;

    try {
      if (arg === undefined) {
        console.log ('Insufficent number of arguments');
        throw InvalidTrigramArgumentException;
      }

      if (!arg.includes ('=')) {
        console.log (`${arg} is the wrong format. Add '='.`);
        throw InvalidTrigramArgumentException;
      }

      [key, value] = arg.split ('=');

      if (key === 'id') {
        fileId = value;
      } else {
        console.log (`Unrecognized argument ${key}.`);
        throw InvalidTrigramArgumentException;
      }
    } catch (ex) {
      if (ex === InvalidTrigramArgumentException) {
        break;
      }
    }
    trigramService.getFileInfo (fileId, (err, row) => {
      if (err || row === undefined) {
        console.log ('Id %d does not exist', fileId);
        return;
      }
      console.log (
        `file name: ${row.file_name}, file size: ${row.file_size}, No. Trigrams: ${row.number_of_trigrams}`
      );
    });
    break;
  }
  case 'generate': {
    let tgArgs = process.argv.slice (3);
    let fileId = 0;
    let maxSize = 0;
    let seedWords = '';
    try {
      if (tgArgs.length == 0) {
        console.log ('Insufficent number of arguments');
        throw InvalidTrigramArgumentException;
      }
      tgArgs.some (arg => {
        let key, value;
        if (!arg.includes ('=')) {
          console.log (`${arg} is the wrong format. Add '='.`);
          throw InvalidTrigramArgumentException;
        }
        [key, value] = arg.split ('=');

        if (key === 'id') {
          fileId = value;
        } else if (key === 'maxSize') {
          maxSize = value;
        } else if (key === 'seedWords') {
          seedWords = value;
        } else {
          console.log (`Unrecognized argument ${key}.`);
          throw InvalidTrigramArgumentException;
        }
      });
    } catch (ex) {
      if (ex === InvalidTrigramArgumentException) {
        break;
      }
    }
    trigramService.generateNewTextFromTrigram (
      fileId,
      maxSize,
      seedWords,
      (err, newText) => {
        if(err) {
          console.log(err.message);
        }
        console.log (newText);
      }
    );
    break;
  }
  default:
    console.log (`${command} command is invalid.`);
}
