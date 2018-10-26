const crypto = require('crypto');
const aesWrapper = {};

aesWrapper.getAlgorithmList = () => {
	console.log(crypto.getCiphers());
};

aesWrapper.generateKey = () => {
	return crypto.randomBytes(32);
};

aesWrapper.generateIv = () => {
	return crypto.randomBytes(16);
};

aesWrapper.separateVectorFromData = (data) => {
	var iv = data.slice(-24);
	var message = data.substring(0, data.length - 24);

	return {
		iv: iv,
		message: message
	};
};

aesWrapper.encrypt = (key, iv, text) => {
	let enc = '';
	let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
	enc += cipher.update(Buffer.from(text), 'utf8', 'base64');
	enc += cipher.final('base64');

	return enc;
};

aesWrapper.decrypt = (key, text) => {
	let dec = '';
	let data = aesWrapper.separateVectorFromData(text);
	let cipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(data.iv, 'base64'));
	dec += cipher.update(Buffer.from(data.message, 'base64'), 'base64', 'utf8');
	dec += cipher.final('utf8');

	return dec;
};

aesWrapper.addIvToBody = (iv, encryptedBase64) => {
	encryptedBase64 += iv.toString('base64');
	//console.log(iv.toString('base64'));

	return encryptedBase64;
};

aesWrapper.createAesMessage = (aesKey, message) => {
	let aesIv = aesWrapper.generateIv();
	let encryptedMessage = aesWrapper.encrypt(aesKey, aesIv, message);
	encryptedMessage = aesWrapper.addIvToBody(aesIv, encryptedMessage);

	return encryptedMessage;
};

module.exports = aesWrapper;