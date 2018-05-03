import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './../models/User';
import _ from 'lodash';
import { PasswordError, EmailError, DeleteUserError } from './../errors/errors';
import { requiresAuth } from './../permissions';

const formatErrors = (e) => {
  if (e.name === 'ValidationError') {
    const errorArray = [];
    for (let field in e.errors) {
      const error = _.pick(e.errors[field], ['path', 'message']);
      error.name = error.path;
      delete error.path;
      errorArray.push(error);
    }
    return errorArray;
  }
  return [{ name: 'name', message: 'something went wrong' }];
};


export default {
  Query: {
    me: requiresAuth.createResolver(async (parent, args, context) => {
      try {
        const { email, _id } = context.user;
        const user = await User.findOne({ email, _id });
        return user;
      } catch (e) {
        throw new Error(e);
      }
    })
  },
  Mutation: {
    register: async (parent, { email, password, username }, context) => {
      try {   
        const user = await new User({ email, password, username }).save();

        const token = jwt.sign({ email, _id: user._id }, process.env.JWT_KEY, { expiresIn: "7d" });

        return { user, token };
      } catch (e) {
        return { errors: formatErrors(e) }
      }
    },
    login: async (parent, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) throw 'invalid email';

        const isPasswordMatches = await bcrypt.compare(password, user.password);
        if (!isPasswordMatches) throw 'invalid password'; 

        const token = jwt.sign({ email, _id: user._id }, process.env.JWT_KEY, { expiresIn: "7d" });

        return { user, token };
      } catch (e) {
        if (e === 'invalid email') {
          throw new EmailError();
        }
        if (e === 'invalid password') {
          throw new PasswordError();
        }
        throw new Error(e);
      }
    },
    deleteUser: requiresAuth.createResolver(async (parent, args, context) => {
      try {
        const { email, _id } = context.user;

        const user = await User.findOneAndRemove({ email, _id });
        if (!user) throw 'user not found';

        return user;
      } catch (e) {
        if (e === 'user not found') {
          throw new DeleteUserError();
        } 
        throw new Error(e);
      }
    }),
    updateUser: requiresAuth.createResolver(async (parent, args, context) => {
      try {
        const { email, _id } = context.user;

        const update = _.pick(args, ['about', 'firstname', 'lastname', 'username']);

        const user = await User.findOneAndUpdate(
          { email, _id },
          { $set: update },
          { new: true, runValidators: true, }
        );
        if (!user) throw 'user not found';

        return user;
      } catch (e) {
        if (e === 'user not found') {
          throw new DeleteUserError();
        } 
        throw new Error(e);
      }
    }),
    changePassword: requiresAuth.createResolver(
      async (parent, { newPassword, oldPassword, repeatPassword}, context) => {
        try {
          if (newPassword !== repeatPassword) {
            throw new Error('new and repeated passwords dont match!');
          }

          if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(newPassword))) {
            throw new Error('password should have minimum six characters, at least one uppercase letter, one lowercase letter and one number');
          }

          const { email, _id } = context.user;
          const user = await User.findOne({ email, _id });

          const isPasswordMatches = await bcrypt.compare(oldPassword, user.password);

          if (isPasswordMatches) {
            await User.update({ email, _id }, { $set: { password: newPassword }});

            return { isSuccess: true };
          } else {
            throw new Error('old password is not correct!');
          }
        } catch (e) {
          throw new Error(e);
        }
      }
    )
  }
}