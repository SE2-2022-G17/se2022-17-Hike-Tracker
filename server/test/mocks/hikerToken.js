const jwt = require('jsonwebtoken');

exports.token = jwt.sign({
    'fullName': "Kanye West",
    'email': "test@email.com",
    'role': "hiker",
    'active': true
}, 'my_secret_key');
