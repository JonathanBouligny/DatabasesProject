var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : process.env.DatabaseAwsSqlAddress,
    port     : process.env.DatabaseAwsSqlPort,
    user     : process.env.DatabaseAwsSqlUser,
    password : process.env.DatabaseAwsSqlPassword,
    database : "StockData"
})

connection.connect(function(err) {
    if (err) throw err;
    else
        console.log('Connected');
});

module.exports = connection;
