import mongoose from 'mongoose';
import mongooseValidate from 'mongoose-validator';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcrypt';
import { AuthorizationError } from './../errors/errors';

const emailValidator = [
  mongooseValidate({
    validator: 'isEmail',
    message: '{PATH} is not valid!'
  }),
];

const usernameValidator = [
  mongooseValidate({
    validator: 'isLength',
    arguments: [3, 20],
    message: '{PATH} should be between {ARGS[0]} and {ARGS[1]} characters!'
  })
];

const firstnameValidator = [
  mongooseValidate({
    validator: 'isLength',
    arguments: [3, 20],
    message: '{PATH} should be between {ARGS[0]} and {ARGS[1]} characters!'
  })
];

const passwordValidator = [
  mongooseValidate({
    validator: 'matches',
    arguments: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
    message: '{PATH} should have minimum six characters, at least one uppercase letter, one lowercase letter and one number'
  })
];

const UserSchema = mongoose.Schema({
	email: {
		type: String,
    unique: true,
    trim: true,
    uniqueCaseInsensitive: true,
    required: new AuthorizationError(),
    validate: emailValidator
	},
	password: {
    type: String,
    trim: true,
    required: [true, '{PATH} is required!'],
    validate: passwordValidator
  },
  username: {
    type: String,
    uniqueCaseInsensitive: true,
    required: [true, '{PATH} is required!'],
    unique: true,
    trim: true,
    validate: usernameValidator
  },
  about: {
    type: String,
    trim: true,
    validate: firstnameValidator
  },
  firstname: {
    type: String,
    trim: true,
    validate: firstnameValidator
  },
  lastname: {
    type: String,
    trim: true
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now
  }
});

UserSchema.pre('save', async function(next) {                                                                                                                                                                                                                                                                                                                                                                                                                               
  this.password = await bcrypt.hash(this.password, 10);                                                                                                                                                                                                                                                                                       
  next();                                                                                                                                                                   
});

UserSchema.pre('update', async function(next) {
  this.update({}, { password: await bcrypt.hash(this.getUpdate().$set.password, 10) } );
  next();
});

UserSchema.plugin(uniqueValidator, { message: '{PATH} has to be unique!' });

export default mongoose.model('User', UserSchema);