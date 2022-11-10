const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const { Schema } = mongoose;
const Type = require("./UserType")

// https://mongoosejs.com/docs/geojson.html
// https://www.mongodb.com/docs/manual/reference/geojson/

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: Type,
        required: true
    }
})

//hash password before saving user
userSchema.pre("save", function (next) {
    const user = this;

    if (this.isModified("password") || this.isNew) {
        bcrypt.genSalt(10, function (saltError, salt) {
            if (saltError) return next(saltError);
            else {
                bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) return next(err);

                    user.password = hash;
                    next();
                })
            }
        })
    } else {
        return next();
    }
});

//check password
userSchema.methods.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (error, isMatch) {
        if (error) return callback(error);
        callback(null, isMatch);
    })
}

// create a model for user schema
// it will create a user collection in the mongo database
module.exports = mongoose.model("User", userSchema)