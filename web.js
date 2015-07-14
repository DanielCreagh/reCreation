// var gzippo = require('gzippo');
var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/'))


var current_env = "";
if (process.argv.length > 2) {
    current_env = process.argv[2];

}

if (current_env.length > 0) {
    app.get('/apihost',
        function(req, res) {
            res.send(current_env);
        }
    );
}

// app.use(gzippo.staticGzip("" + __dirname + "/dist"));
var server = app.listen(process.env.PORT || 5001, function() {
    console.log("Listening on port %d", server.address().port);
});