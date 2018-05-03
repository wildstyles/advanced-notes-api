import mongoose from 'mongoose';

const WordSchema = mongoose.Schema({
  word: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  translatedWord: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  examples: {
    type: [String],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  _creatorId: {
    type: mongoose.Schema.Types.ObjectId
  }
});

export default mongoose.model('Word', WordSchema);