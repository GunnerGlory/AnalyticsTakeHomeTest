/**
 * Express app with the following routes:
 * 
 *  POST /upload
    GET /texts -> returns list of texts that have been uploaded
    GET /texts/:id -> returns info about the text
    GET /texts/:id/generate?maxSize&seedWords -> returns generated text
 * 
 * 
 */

const express = require('express');
const chalk = require('chalk');
const trigramService = require('./trigram-service');
const fileUpload = require('express-fileupload')

var htmlTemplate = `<!doctype html>
<html>
    <head>
        <title>Our Funky HTML Page</title>
        <meta name="description" content="Our first page">
        <meta name="keywords" content="html tutorial template">
    </head>
    <body>
        <h1>Trigram Take Home</h1>
        <form ref='uploadForm' 
        id='uploadForm' 
        action='/upload' 
        method='post' 
        encType="multipart/form-data">
            <input type="file" name="trigramFile" />
            <input type='submit' value='Upload!' />
    </form>
        {content}
    </body>
</html>`


var tgApp = express();
tgApp.use(fileUpload());

tgApp.get('/', (req, res) => {
    res.send(htmlTemplate.replace('{content}', ''));
});

tgApp.get('/texts', (req, res) =>{
    let listTemplate = `<div id="file_list">
    <h3>List of Uploaded Files</h3>
    <ul>
        {list_content}
    </ul>
 </div>`;
   let rowhtml = '';
   trigramService.listFiles ((err, rows)=>{
        if(err){
            res.status = 400;
            res.send(htmlTemplate.replace('{content}', `<h4>No files found</h4>`));
        }
        rows.forEach((row) =>{
            rowhtml = rowhtml + `<li><span>${row.file_id}: </span><span>${row.file_name}</span></a></li>`
        })

        listTemplate = listTemplate.replace('{list_content}', rowhtml);

        res.send(htmlTemplate.replace('{content}', listTemplate)); 
    });
  
});


tgApp.get('/texts/:id', (req, res) =>{
    let listTemplate = `<div id="file_list">
    <h3>Info for file id ${req.params.id}</h3>
    <ul>
        {list_content}
    </ul>
 </div>`;
 
 trigramService.getFileInfo(req.params.id, (err, row)=>{
        if(err|| row === undefined){
            res.status = 400;
            res.send(htmlTemplate.replace('{content}', `<h4>id ${req.params.id} does not exist.<h4>`));
        }
        let rowhtml = `<li><span>file name: <strong>${row.file_name} </strong></span><span>file size: <strong>${row.file_size}</strong> </span> <span>No. Trigrams: <strong>${row.number_of_trigrams}</strong></span></li>`
        listTemplate = listTemplate.replace('{list_content}', rowhtml);
        res.send(htmlTemplate.replace('{content}', listTemplate));
    });
  
});

tgApp.get('/texts/:id/generate', (req, res) =>{
    let listTemplate = `<div id="file_list">
    <h3>Genegrated Text for file id ${req.params.id}</h3>
      <h4>{list_content}</h4>
 </div>`;
    trigramService.generateNewTextFromTrigram(req.params.id, req.query.maxSize, req.query.seedWords, (err, data)=>{
        if(err|| data === undefined){
            res.status = 400;
            res.send(htmlTemplate.replace('{content}', `<h4>id ${req.params.id} does not exist.<h4>`));
        }
        listTemplate = listTemplate.replace('{list_content}', data);
        res.send(htmlTemplate.replace('{content}', listTemplate));
    });
  
});

tgApp.post('/upload', function(req, res) {
    if(!req.files)
        return res.status(400).send('No files were uploaded.');
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }
 
    let trigramFile = req.files.trigramFile;
  
    trigramFile.mv(`./uploads/${trigramFile.name}`, function(err) {
      if (err)
        return res.status(500).send(err);
        
      trigramService.upload(`./uploads/${trigramFile.name}`, (err, success) =>{
           res.send('File '+trigramFile.name+' uploaded!');
      })
    });
  });


tgApp.listen(4200, ()=> {
    console.log(`listening on port ${chalk.green('4200')}`);
});