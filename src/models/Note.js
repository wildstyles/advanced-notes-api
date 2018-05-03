import mongoose from 'mongoose';

const NoteSchema = mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    trim: true,
    required: true
  },
  body: {
    type: String,
    minlength: 1,
    trim: true,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

export default mongoose.model('Note', NoteSchema);
