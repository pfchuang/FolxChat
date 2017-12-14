const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const rsaWrapper = require('./components/rsa-wrapper');
const aesWrapper = require('./components/aes-wrapper');

rsaWrapper.initLoadServerKeys(__dirname);
//rsaWrapper.serverExampleEncrypt();

app.use(express.static(__dirname + '/static'));

io.on('connection', function(socket) {

	const aesKey = aesWrapper.generateKey();
	let encryptedAesKey = rsaWrapper.encrypt(rsaWrapper.clientPub, (aesKey.toString('base64')));
	socket.emit('send key from server to client', encryptedAesKey);
	

	socket.on('add user', function(name) {
		socket.username = name;
		console.log('new user:' + name + ' logged.');
		io.emit('add user', {
			username: socket.username
		});
	});

	socket.on('chat message', function(data) {
		let msg = aesWrapper.decrypt(aesKey, data);   
		// wait for 2 aes key to encrypt msg
		console.log(socket.username + ' : ' + data);
		io.emit('chat message', {
			username: socket.username,
			msg: data
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