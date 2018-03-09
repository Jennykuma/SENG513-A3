/**
 * Created by Jennykuma on 2018-02-20.
 */
let socket;
let username;
let chatLog = $('#chat-messages');

$(document).ready(onLoad());

function onLoad() {
    console.log("hello");
    socket = io();

    $('form').submit(function () {
        socket.emit('chat message', $('#user-msg').val());
        $('#user-msg').val('');
        return false;
    });
	
	socket.on('new user xD', function(username){
		if(document.cookie){
			socket.emit('new cookie', document.cookie);
			$('#user-name').text("* You are " + document.cookie);
			$('#user-list').append($('<li>').text(document.cookie));
		}else{
			socket.emit('new user');
		}
	})
	
	socket.on('new user cookie', function(username){
		document.cookie = username
		$('#user-name').text("* You are " + username);
		$('#user-list').append($('<li>').text(username));
    })
    
    socket.on('new name', function(username){
        $('#user-name').text("* You are " + username);
    })
	
	socket.on('new cookie name', function(newName, color){
		if(document.cookie){
			document.cookie = newName
		}
	})

    socket.on('new userlist', function (usersList) {
        $('#user-list').text("");
        for (let i = 0; i < usersList.length; i++) {
            $('#user-list').append($('<li>').html('<span style="color:#' + usersList[i].color + '">'
            + usersList[i].nickname + '</span>'));
        }
    });

    socket.on('chat history', function(chatLog) {
        for (let i = 0; i < chatLog.length; i++) {
            $('#chat-messages').append($('<li>').html('<span style="color:#' + chatLog[i].color + '">'
            + chatLog[i].user + ': </span>' + chatLog[i].msg));
        }

        $('.chat-container').animate({scrollTop: $('.chat-container').prop("scrollHeight")}, 500);
     });

    socket.on('announce', function (username) {
        $('#chat-messages').append($('<li>').text(username + " has connected"));
    });

    socket.on('delete user', function (oldUsername) {
        $('#chat-messages').append($('<li>').text(oldUsername + " has disconnected"));
    });

    socket.on('chat message', function (timing, color, username, msg, chatFull) {
        if(chatFull){
            //$('#chat-messages').first().remove();
            var elem = document.querySelectorAll('#chat-messages li')
            for(var i=0; li=elem[i]; i--) {
                li.parentNode.removeChild(li);
            }
        }

        $('#chat-messages').append($('<li>').html(timing + " - " + '<span style="color:' + color + '">'
            + username + ': </span>' + msg));

        $('.chat-container').animate({scrollTop: $('.chat-container').prop("scrollHeight")}, 500);

    });

    socket.on('bold chat message', function (timing, color, username, msg, chatFull) {
        if(chatFull){
            //$('#chat-messages').first().remove();
            var elem = document.querySelectorAll('#chat-messages li')
            for(var i=0; li=elem[i]; i--) {
                li.parentNode.removeChild(li);
            }
        }

        $('#chat-messages').append($('<li>').html(timing + " - " + '<b><span style="color:#' + color +
            '">' + username + ': </span>' + msg + '</b>'));

        $('.chat-container').animate({scrollTop: $('.chat-container').prop("scrollHeight")}, 500);

    });

    socket.on('color set', function (color) {
        $('#chat-messages').append($('<li>').html('<i>' + "Nickname color has been set to: " + color + '</i>'));
    });

    socket.on('nickname set', function (newNick) {
        $('#chat-messages').append($('<li>').html('<i>' + "Nickname has been set to: " + newNick + '</i>'));
    });

    socket.on('nickname set other', function (oldNick, newNick) {
        $('#chat-messages').append($('<li>').html('<i>' + oldNick + " has set their nickname to: " + newNick + '</i>'));
    });

    socket.on('nickname taken', function (wantedNick){
        $('#chat-messages').append($('<li>').html('<i>' + "** " + wantedNick + " is taken, please choose another nickname! **" + '</i>'));
    });

}