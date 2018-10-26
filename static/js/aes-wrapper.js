(function () {

	'use strict';

	var crypto = window.crypto.subtle;

	function generateKey() {
		let key = window.crypto.getRandomValues(new Uint8Array(32));
		return converterWrapper.arrayBufferToBase64String(key);
	}

	function importPublicKey(key) {
		return new Promise(function(resolve, reject) {
			crypto.importKey("raw", converterWrapper.base64StringToArrayBuffer(key),
				{name: "AES-CBC"}, false, ["encrypt", "decrypt"])
			.then(function(cryptKey) {
				resolve(cryptKey);
			});
		});
	}

	function separateVectorFromData(data) {
		var iv = data.slice(-24);
		var message = data.substring(0, data.length - 24);

		return{
			iv: iv,
			message: message
		};
	}

	function getMessageWithIv(message, iv) {
		return converterWrapper.arrayBufferToBase64String(message) + converterWrapper.arrayBufferToBase64String(iv);
	}

	function encryptMessage(key, message) {
		var iv = window.crypto.getRandomValues(new Uint8Array(16));
		return new Promise(function(resolve, reject) {
			importPublicKey(key).then(function(key) {
				crypto.encrypt({name: "AES-CBC", iv: iv}, key,
					converterWrapper.str2abUtf8(message))
				.then(function(encrypted) {
					encrypted = getMessageWithIv(encrypted, iv);
					resolve(encrypted);
				});
			});
		});
	}

	function decryptMessage(key, message) {
		var data = aesWrapper.separateVectorFromData(message);
		return new Promise(function(resolve, reject) {
			importPublicKey(key).then(function(key) {
				crypto.decrypt({name: "AES-CBC",
					            iv: converterWrapper.base64StringToArrayBuffer(data['iv'])},
					            key,
					            converterWrapper.base64StringToArrayBuffer(data['message']))
				.then(function(decrypted) {
					resolve(converterWrapper.arrayBufferToUtf8(decrypted));
				});
			});
		});
	}

	window.aesWrapper = {
		generateKey: generateKey,
		encryptMessage: encryptMessage,
		decryptMessage: decryptMessage,
		importPublicKey: importPublicKey,
		separateVectorFromData: separateVectorFromData
	}
}());