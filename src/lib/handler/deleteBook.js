// deleteBook.js
const logger = require('../../utils/logger');
const Book = require('../models/Book');

const deleteBook = async (bookId) => {
    try {
        await Book.findByIdAndDelete(bookId);
        logger.info('Book deleted successfully');
    } catch (error) {
        logger.error('Error deleting book:', error);
        throw error;
    }
};

module.exports = deleteBook;
