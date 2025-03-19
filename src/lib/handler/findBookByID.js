const logger = require('../../utils/logger');
const Book = require('../models/Book');

const findBookById = async (bookId) => {
    try {
        const book = await Book.findById(bookId);
        return book;
    } catch (error) {
        logger.error('Error finding book by ID:', error);
        throw error;
    }
};

module.exports = findBookById;
