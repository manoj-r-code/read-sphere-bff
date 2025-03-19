// editBook.js
const logger = require('../../utils/logger');
const Book = require('../models/Book');

const editBook = async (bookId, updatedData) => {
    try {
        await Book.findByIdAndUpdate(bookId, updatedData);
        logger.info('Book edited successfully');
    } catch (error) {
        logger.error('Error editing book:', error);
        throw error;
    }
};

module.exports = editBook;
