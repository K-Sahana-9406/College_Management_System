const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sahana@7477407',
  database: 'college_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected!');
});

module.exports = db;
