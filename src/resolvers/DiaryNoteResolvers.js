import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import DiaryNote from './../models/DiaryNote';
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
    getDiaryNotes: requiresAuth.createResolver(async (parent, args, context) => {
      try {
        const creatorId = context.user._id;

        const notes = await DiaryNote.find({ creatorId }).populate('creatorId');
        return notes;
      } catch (e) {
        throw new Error(e);
      }
    }),

    async getPublicDiary (parent, args, context) {
      try {
        const notes = await DiaryNote.find({ isPublic: true }).populate('creatorId');
        return notes;
      } catch (e) {
        throw new Error(e);
      }
    },

    async getUserDiary (parent, { creatorId }, context) {
      try {
        const notes = await DiaryNote.find({ creatorId, isPublic: true }).populate('creatorId');
        return notes;
      } catch (e) {
        throw new Error(e);
      }
    }
  },
  Mutation: {
    createDiaryNote: async (parent, { title, text, isPublic }, context) => {
      try {   
        const note = await new DiaryNote({ 
          title,
          text,
          creatorId: context.user._id,
          isPublic
        }).save();
        
        const newNote = await DiaryNote.findOne({ _id: note._id }).populate('creatorId').select('-__v');

        return newNote;
      } catch (e) {
        throw new Error(e);
      }
    },

    deleteDiaryNote: requiresAuth.createResolver(async (parent, { _id }, context) => {
      try {
        const creatorId = context.user._id;

        const note = await DiaryNote.findOneAndRemove({ creatorId, _id });
        if (!note) throw 'user not found';

        return note;
      } catch (e) {
        if (e === 'user not found') {
          throw new DeleteUserError();
        } 
        throw new Error(e);
      }
    }),
    updateDiaryNote: requiresAuth.createResolver(async (parent, args, context) => {
      try {
        const creatorId = context.user._id;
        const _id = args._id;

        const update = _.pick(args, ['title', 'text', 'isPublic']);

        const note = await DiaryNote.findOneAndUpdate(
          { creatorId, _id },
          { $set: update },
          { new: true, runValidators: true }
        );
        if (!note) throw 'user not found';

        return note;
      } catch (e) {
        if (e === 'user not found') {
          throw new DeleteUserError();
        } 
        throw new Error(e);
      }
    })
  }
}