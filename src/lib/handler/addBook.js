const logger = require('../../utils/logger');
const Book = require('../models/Book');

const addBook = async (bookData) => {
    try {
        await Book.create({
            bookname: bookData.bookname,
            author: bookData.author,
            genre: bookData.genre,
            date: bookData.date,
            status: bookData.status,
        });
        logger.info('Book added successfully');
    } catch (error) {
        logger.error('Error adding book:', error);
        throw error;
    }
};

module.exports = addBook;
