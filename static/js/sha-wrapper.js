(function () {

	'use strict';

	var crypto = window.crypto.subtle;

	function sha256(text) {
		return new Promise(function(resolve, reject) {
			crypto.digest({name: "SHA-256"},
			new Uint8Array(converterWrapper.base64StringToArrayBuffer(btoa(text)))).then(function(hash) {
				resolve(converterWrapper.arrayBufferToBase64String(new Uint8Array(hash)));
			});
		});
	}

	window.shaWrapper = {
		sha256: sha256
	}
}());