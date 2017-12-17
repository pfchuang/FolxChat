const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const rsaWrapper = require('./components/rsa-wrapper');
const aesWrapper = require('./components/aes-wrapper');

rsaWrapper.initLoadServerKeys(__dirname);
//rsaWrapper.serverExampleEncrypt();

let client_aesKey;
const server_aesKey = aesWrapper.generateKey();
let encryptedAesKey = rsaWrapper.encrypt(rsaWrapper.clientPub, (server_aesKey.toString('base64')));

app.use(express.static(__dirname + '/static'));

io.on('connection', function(socket) {

	socket.emit('send aes key from server to client', encryptedAesKey);

	socket.on('send aes key from client to server', function(data) {
		client_aesKey = rsaWrapper.decrypt(rsaWrapper.serverPrivate, data);
	});

	socket.on('add user', function(name) {
		socket.username = name;
		console.log('new user:' + name + ' logged.');
		io.emit('add user', {
			username: socket.username
		});
	});

	socket.on('chat message', function(data) {
		//double encrypt  
		let msg = aesWrapper.createAesMessage(server_aesKey, data);
		console.log(socket.username + ' : ' + msg);
		io.emit('chat message', {
			username: socket.username,
			msg: msg
		});
	});

	socket.on('disconnect', function() {
		console.log(socket.username + ' left.');
		io.emit('user left', {
			username:socket.username
		});
	});
});

http.listen(process.env.PORT || 3000, function() {
	console.log('listening on *:3000');
});