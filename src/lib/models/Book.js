const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookname: {
        type: String,
        //  required: true,
    },
    author: {
        type: String,
        // required: true,
    },
    genre: {
        type: String,
        // required: true,
    },
    date: {
        type: String,
        // required: true,
    },
    status: {
        type: String,
        // enum: ['available', 'borrowed', 'reserved'],
        // required: true,
    },
});

const Book = mongoose.model('Bookcollection', bookSchema);

module.exports = Book;
