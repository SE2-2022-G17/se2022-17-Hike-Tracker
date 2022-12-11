const jwt = require('jsonwebtoken');

exports.token = jwt.sign({
    firstName: "Pietro",
        lastName: "Bertorelle",
        email: "localguide@email.com",
        hash: "$2a$10$uKpxkByoCAWrnGpgnVJhhOtgOrQ6spPVTp88qyZbLEa2EVw0/XoQS", //password
        activationCode: "123456",
        role: "localGuide",
        active: true
}, 'my_secret_key');
