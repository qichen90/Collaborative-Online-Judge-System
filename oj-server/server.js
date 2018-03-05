const express = require('express');
const app = express();
const restRouter = require('./routes/rest');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');

// remeber to add database user 
mongoose.connect('mongodb://qichen90:cs5036@ds125068.mlab.com:25068/problems-db')

app.use('/api/v1', restRouter);

app.use(express.static(path.join(__dirname,'../public')));
app.use((req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, '../public')});
});


var socketIO = require('socket.io');
var io = socketIO();
var editorSocketService = require('./services/editorSocketService')(io); // function call
//connect io with server
const server = http.createServer(app);
io.attach(server);
server.listen(3000);
server.on('listening', onListening);

// listening call back
function onListening(){
    console.log('App listening on port 3000...');
}

// app.listen(3000, () => console.log('Example app listening on port 3000!'));