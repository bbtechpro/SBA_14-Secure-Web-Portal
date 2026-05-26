const { Schema, model } = require('mongoose');

const bookmarkSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Bookmark = model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
