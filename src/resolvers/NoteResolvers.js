import Note from './../models/Note';
import pick from 'lodash/pick';
import { requiresAuth } from './../permissions';

export default {
  Query: {
    allNotes: requiresAuth.createResolver(async (parent, args, context) => {
      try {
        const creatorId = context.user._id;
        const notes = await Note.find({ creatorId });

        return notes;
      } catch (e) {
        throw new Error(e);
      }
    })
  },
  Mutation: {
    createNote: requiresAuth.createResolver(async (parent, { title, body }, context) => {
      try {
        const creatorId = context.user._id;
        const note = await new Note({ title, body, creatorId }).save();

        return note;
      } catch (e) {
        throw new Error(e);
      }
    }),
    updateNote: requiresAuth.createResolver(async (parent, args, context) => {
      try {
        const creatorId = context.user._id;
        const _id = args._id;

        const update = pick(args, ['title', 'body']);

        const note = await Note.findOneAndUpdate(
          { creatorId, _id },
          { $set: update },
          { new: true, runValidators: true }
        );

        return updated;
      } catch (e) {
        throw new Error(e);
      }
    }),
    deleteNote: requiresAuth.createResolver(async (parent, { _id }, context) => {
      try {
        const creatorId = context.user._id;
        const deleted = await Note.findOneAndRemove({ _id, creatorId });

        return deleted;
      } catch (e) {
          throw new Error(e);
      }
    })
  }
}