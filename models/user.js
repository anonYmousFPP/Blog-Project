const {createHmac, randomBytes} = require('crypto');
const mongoose = require('mongoose');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new mongoose.Schema({
    fullName:{
        type: String, 
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL:{
        type: String,
        default: '/images/default.png'
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER',
    }
}, {timestamps: true})

userSchema.pre('save', function(next){
    const user = this;
    
    if(!user.isModified('password'))    return ;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest('hex');

    this.salt = salt;
    this.password = hashedPassword;

    next();
})

userSchema.static('matchPasswordAndGenerateToken', async function(email, password){// its called viratual function we are taking password form user and then hashed and then compare with the db stored hashed password
    const user = await this.findOne({email});
    // console.log('My USer is: ', user);
    if(!user)  throw new Error('User not found');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedPasswordHashing = createHmac('sha256', salt)
        .update(password)
        .digest('hex');
    
    if(userProvidedPasswordHashing !== hashedPassword)  throw new Error('Incorrect Password')

    const token = createTokenForUser(user);// agr match ho gya to hmm user return krdenge and password and salt ko undefined rakh denge
    return token;
    
})

const User = mongoose.model('User', userSchema);
module.exports = User;