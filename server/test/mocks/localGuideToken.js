const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.token = jwt.sign({
    _id: new mongoose.Types.ObjectId('6395425a66dff0ef2277239b'),
    firstName: "Pietro",
    lastName: "Bertorelle",
    email: "localguide@email.com",
    hash: "$2a$10$uKpxkByoCAWrnGpgnVJhhOtgOrQ6spPVTp88qyZbLEa2EVw0/XoQS", //password
    activationCode: "123456",
    role: "localGuide",
    active: true
}, 'my_secret_key');
