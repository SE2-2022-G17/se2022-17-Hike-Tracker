const jwt = require('jsonwebtoken');

exports.token = jwt.sign({
    'id': "0000001194e4c1e796231f93",
    'fullName': "Kanye West",
    'email': "test@email.com",
    'role': "hiker",
    'active': true
}, 'my_secret_key');
