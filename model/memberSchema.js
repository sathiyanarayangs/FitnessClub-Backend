const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: true
    },
    role: {
        type: String
    },
    messages: [{
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        message: {
            type: String,
            required: true
        },
    }],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],

    courses: [
        {
            classID: {
                type: String
            }
        }
    ]
});

//Hashing the password

memberSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.confirmPassword = await bcrypt.hash(this.confirmPassword, 12);
    }
    next();
});

// generating token
memberSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    }
    catch (err) {
        console.log(err);
    }
};

// store the message

memberSchema.methods.addMessage = async function (name, email, phone, message) {
    try {
        this.messages = this.messages.concat({ name, email, phone, message });
        await this.save();
        return this.messages;
    }
    catch (err) {
        console.log(err);
    }
};

memberSchema.methods.addCourses = async function (classID) {
    try {
        this.courses = this.courses.concat({ classID });
        await this.save();
        return this.courses;
    }
    catch (err) {
        console.log(err);
    }
};

//collection creation
const Member = mongoose.model('MEMBER', memberSchema);

module.exports = Member;