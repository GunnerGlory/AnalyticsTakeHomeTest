/*
    Database service using sqllite3.
*/

const sqlite3 = require('sqlite3').verbose();
const selectOne = `select * from files where file_id=?`;
const insertStatement = `INSERT INTO FILES (file_name, file_size, 
                         number_of_trigrams,
                         trigrams,
                         file_content) VALUES (?, ?, ?, ?, ?);`

/*
    Create a database instance. Attempt to create the table if it does not exist.
*/
const db = new sqlite3.Database('./db/tgfiles.db', (err) => {
    if (err) {
        console.log(err.message);
    }
    // Uncomment out clear the table
    // let deleteScript = `DROP TABLE FILES; `
    // db.run(deleteScript);
    ``
    let createScript = `CREATE TABLE IF NOT EXISTS files (
                        file_id INTEGER PRIMARY KEY AUTOINCREMENT,
                        file_name TEXT NOT NULL,
                        file_size INTEGER NOT NULL,
                        number_of_trigrams INTEGER NOT NULL,
                        trigrams TEXT NOT NULL,
                        file_content TEXT DEFAULT ''
                    );`

    db.run(createScript);

    // db.close();
})

db.on('error', (err) => {
    console.log(err);
})

process.on('uncaughtException', (err) => {
    console.log(err);
});

// insert a file in the database
db.putFile = function(file_nm, file_content, number_of_trigrams, trigrams, cb) {
    db.serialize(() => {
        db.run(insertStatement, [file_nm, file_content.length, number_of_trigrams,
            trigrams, file_content.toString('utf8'),], (err) => {
            if(err) {
                console.log(err.message);
                return cb(err, false);
            }
            return cb(err, true);
        })
    });
}

// Get all files
db.getFiles = function(cb) {
    db.serialize(() => {
        db.all('select * from files;', [], (err, rows) => {
            return cb(err, rows);
        })
    });
}

// Get a file by id
db.getFile = function(file_id, cb) {
    db.serialize(() => {
        db.get(selectOne, [file_id], (err, row) => {
            return cb(err, row)
        })
    })
}

module.exports = db


