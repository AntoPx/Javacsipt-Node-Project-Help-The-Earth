'use strict';

const sqlite = require('sqlite3').verbose();
const DBSOURCE = './crowdfunding.db';

const db = new sqlite.Database(DBSOURCE, (err) => {
    if (err) {
        console.err(err.message);
        throw err;
    }
});

module.exports = db;