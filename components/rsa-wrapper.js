const path = require('path');
const rsaWrapper = {};
const fs = require('fs');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');

rsaWrapper.initLoadServerKeys = (basePath) => {
	rsaWrapper.serverPub = fs.readFileSync(path.resolve(basePath, 'keys', 'server.public.pem'));
	rsaWrapper.serverPrivate = fs.readFileSync(path.resolve(basePath, 'keys', 'server.private.pem'));
	rsaWrapper.clientPub = fs.readFileSync(path.resolve(basePath, 'keys', 'client.public.pem'));
};

rsaWrapper.generate = (direction) => {
	let key = new NodeRSA();
	key.generateKeyPair(2048, 65537);
	fs.writeFileSync(path.resolve(__dirname, '../keys', direction + '.private.pem'), key.exportKey('pkcs8-private-pem'));
	fs.writeFileSync(path.resolve(__dirname, '../keys', direction + '.public.pem'), key.exportKey('pkcs8-public-pem'));

	return true;
};

rsaWrapper.encrypt = (publicKey, message) => {
	let enc = crypto.publicEncrypt({
		key: publicKey,
		padding: crypto.RSA_PKCS1_OAEP_PADDING
	}, Buffer.from(message));

	return enc.toString('base64');
};

rsaWrapper.decrypt = (privateKey, message) => {
	let dec = crypto.privateDecrypt({
		key: privateKey,
		padding: crypto.RSA_PKCS1_OAEP_PADDING
	}, Buffer.from(message, 'base64'));

	return dec.toString();
};

rsaWrapper.serverExampleEncrypt = () => {
	console.log('Server public encrypting');
	
	let enc = rsaWrapper.encrypt(rsaWrapper.serverPub, 'Server init hello');
	console.log('Encrypted RSA string ', '\n', enc);
	let dec = rsaWrapper.decrypt(rsaWrapper.serverPrivate, enc);
	console.log('Decrypted RSA string ...');
	console.log(dec);
}

module.exports = rsaWrapper;