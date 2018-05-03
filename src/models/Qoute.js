import mongoose from 'mongoose';

const QouteSchema = mongoose.Schema({
  qoute: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  author: {
    type: String,
    minlength: 1,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  _creatorId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  public: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('Qoute', QouteSchema);