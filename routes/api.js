'use strict';

const mongoose = require('mongoose');
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const Book = mongoose.model('Book', new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String],
  commentcount: { type: Number, default: 0 }
}));

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({}, '_id title commentcount');
        res.json(books);
      } catch (err) {
        res.status(500).send('Error fetching books');
      }
    })

    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) return res.send('missing required field title');

      try {
        const book = new Book({ title, comments: [], commentcount: 0 });
        const savedBook = await book.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (err) {
        res.status(500).send('Error saving book');
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('Error deleting books');
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;

      try {
        const book = await Book.findById(bookid);
        if (!book) return res.send('no book exists');

        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.send('no book exists');
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) return res.send('missing required field comment');

      try {
        const book = await Book.findById(bookid);
        if (!book) return res.send('no book exists');

        book.comments.push(comment);
        book.commentcount = book.comments.length;
        await book.save();
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        res.send('no book exists');
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;

      try {
        const result = await Book.findByIdAndDelete(bookid);
        if (!result) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        res.send('no book exists');
      }
    });

};
