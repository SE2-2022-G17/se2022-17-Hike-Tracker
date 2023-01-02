const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.token = jwt.sign({
    _id: new mongoose.Types.ObjectId('63b04d9c3d2cae219362fe1f'),
    firstName: "Sofia",
    lastName: "Belloni",
    email: "sofiabelloni99@gmail.com",
    hash: "$2b$10$UH/f3rhR2kCkz5DKlOd7uu5PtdBT.N/eFL9uaJfAbG4VDBpmw29ly", //password
    activationCode: "123456",
    role: "hutWorker",
    active: true
}, 'my_secret_key');
