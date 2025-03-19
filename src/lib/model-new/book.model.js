// models/book.model.js

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    rating: {
        type: String,
    },
    startDate: {
        type: String,
    },
    endDate: {
        type: String,
    },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
