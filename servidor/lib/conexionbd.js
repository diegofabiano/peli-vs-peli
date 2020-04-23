var mysql= require('mysql');

var connection = mysql.createConnection({
  host: 'localhost', 
  port: '3306', 
  user: 'root', 
  password: 'Arsa*0031612', 
  database: 'competencias' 
});

module.exports = connection;

