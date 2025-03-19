const logger = require('../../utils/logger');
const Book = require('../models/Book');

const getBooks = async () => {
    try {
        const bookData = await Book.find();
        return bookData;
    } catch (error) {
        logger.error('Error getting books:', error);
        throw error;
    }
};

module.exports = getBooks;
