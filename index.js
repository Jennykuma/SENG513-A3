// Express initializes app to be a function handler that you can supply to an HTTP server (as seen in line 3).
let express = require('express');
let app = express();
//var app = require('express')(); // express is a library
let http = require('http').Server(app); // http is a library
let io = require('socket.io')(http); // new instance of io by passing http (http server) obj
let path = require("path");

let timeStamp;
let usersOnline = 0;
let usersList = [];
let chatLog = [];
let chatFull = false;

app.use(express.static(path.join(__dirname, "public")));

// We define a route handler / that gets called when we hit our website home.
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public' + '/index.html');
});

// Listen for on the connection event for incoming sockets, log to console
io.on('connection', function(socket){
	let color = getRandomColor();
    console.log('a user connected');

	socket.emit('new user xD');
	
    socket.on('new user', function() {
        usersOnline++;
        //let color = getRandomColor();
        console.log("starting color is: " + color);
        let nickname = "User" + usersOnline;
        socket.color = color;
        socket.name = nickname;
        usersList.push({nickname: nickname, color: color});
        socket.emit('chat history', chatLog);
        socket.emit('announce', nickname);
        socket.broadcast.emit('announce', nickname);
        //socket.emit('new user', nickname);
		socket.emit('new user cookie', nickname, color)
        io.emit('new userlist', usersList);
    });
	
	socket.on('new cookie', function(nickname){
        userOnline = usersList.length
		//let color = getRandomColor()
		console.log('COOKIE :D')
		socket.name = nickname
		socket.color = color
        usersList.push({nickname: nickname, color: color})
        socket.emit('chat history', chatLog);
		socket.emit('announce', nickname);
        socket.broadcast.emit('announce', nickname);
		io.emit('new userlist', usersList)
	})

    // User disconnects
    socket.on('disconnect', function(){
        console.log('a user disconnected');
        let oldUsername = socket.name;
        socket.broadcast.emit('delete user', oldUsername);
        socket.emit('delete user', oldUsername);
        for(let i = 0; i < usersList.length; i++){
            if(usersList[i].nickname === socket.name){
                usersList.splice(i, 1);
            }
        }
        console.log('new usersList: ' + usersList);
        io.emit('new userlist', usersList);
    });

    // Chat message sent
    socket.on('chat message', function(msg){ // print chat msg received in console
        console.log('message: ' + msg);
    });

    socket.on('chat message', function(msg){

        timeStamp = new Date();
        let hour = timeStamp.getHours();
        let min = (timeStamp.getMinutes()<10 ? '0' : '') + timeStamp.getMinutes();
        timing = hour + " : " + min;

        if(msg.startsWith("/nick ")) {
            let oldUsername = socket.name;
            let taken = false;
            socket.name = msg.slice(6);
            for (let i = 0; i < usersList.length; i++) {
                if (usersList[i].nickname === socket.name) {
                    taken = true;
                }
            }

            if (taken) {
                socket.emit('nickname taken', socket.name);
                socket.name = oldUsername;
                console.log("Name taken sry");
            } else {
                console.log("Name set successful");
                for (let i = 0; i < usersList.length; i++) {
                    if (usersList[i].nickname === oldUsername) {
                        usersList[i].nickname = socket.name;
                    }
                }
                io.emit('new userlist', usersList);
                socket.broadcast.emit('nickname set other', oldUsername, socket.name);
                socket.emit('new cookie name', socket.name)
                socket.emit('new name', socket.name)
                socket.emit('nickname set', socket.name);
            }
        } else if (msg.startsWith("/nickcolor ")) {
            socket.color = msg.slice(11);
            for(let i = 0; i < usersList.length; i++) {
                if(usersList[i].nickname === socket.name) {
                    usersList[i].color = socket.color;
                }
            }
            console.log("color changed");
            io.emit('new userlist', usersList);
            socket.emit('color set', socket.color);
        } else {

            // Check for tags and then if found, remove and save msg without tags
            let regex = /<[^>]*>/g;
            if (regex.test(msg)) {
                console.log("THIS  IS AN HTML / JS INJECTION! FIXED!");
                msg = msg.replace(regex, "");
            }

            if(chatLog.length === 200){
                chatLog.shift();
                chatFull = true;
            }

            chatLog.push({user: socket.name, color: socket.color, msg: msg});
            console.log("MSG PUSHED!");
            console.log("ChatLog length: " + chatLog.length);

            socket.broadcast.emit('chat message', timing, socket.color, socket.name, msg, chatFull);
            socket.emit('bold chat message', timing, socket.color, socket.name, msg, chatFull);
        }

        //io.emit('chat message', msg); // send msg to everyone on the server
    });
});

// Random color generator from:
// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// We make the http server listen on port 3000.
http.listen(3000, function(){
    console.log('listening on *:3000');
});