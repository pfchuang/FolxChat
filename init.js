const rsaWrapper = require('./components/rsa-Wrapper');

rsaWrapper.generate('server');
rsaWrapper.generate('client');

console.log('Key generated ...');