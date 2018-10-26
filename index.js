const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const rsaWrapper = require('./components/rsa-wrapper');
const aesWrapper = require('./components/aes-wrapper');

rsaWrapper.initLoadServerKeys(__dirname);

let serverAesKey;

app.use(express.static(__dirname + '/static'));

io.on('connection', function(socket) {

	socket.on('add user', function(name) {
		socket.username = name;
		console.log('new user:' + name + ' logged.');
		io.emit('add user', {
			username: socket.username
		});
	});

	socket.on('chat message', function(data) {
		//double encrypt
		serverAesKey = aesWrapper.generateKey();
		let msg = aesWrapper.createAesMessage(serverAesKey, data.enc);
		console.log(socket.username + ' : ' + msg);
		io.emit('chat message', {
			username: socket.username,
			msg: msg,
			hash: data.hash,
			serverKey: rsaWrapper.encrypt(rsaWrapper.clientPublicKey, serverAesKey.toString('base64')),
			clientKey: rsaWrapper.encrypt(rsaWrapper.clientPublicKey, rsaWrapper.decrypt(rsaWrapper.serverPrivateKey, data.key))
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