const express = require('express');

const performanceTimer = require('../middleware/end-performance-timer');
// const addBookFunction = require('../lib/handler/addBook'); // Import the function for adding a book
// const getBookFunction = require('../lib/handler/getBook'); // Import the function for getting books
// const editBook = require('../lib/handler/editBook');
// const deleteBook = require('../lib/handler/deleteBook');
// const getBookByID = require('../lib/handler/getBookByID');

const asyncHandler = require('../utils/async-handler');
const httpOperations = require('../lib/http-operations');
const Book = require('../lib/model-new/book.model');

const logger = require('../utils/logger');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ ok: true });
});

router.get('/hello', (req, res) => {
    res.send('hello world');
    res.status(200).json({ ok: true });
});


router.post('/api/add-book', async (req, res) => {
    try {
        const { name, genre, status, notes, rating, startDate, endDate } = req.body;
        const book = new Book({ name, genre, status, notes, rating, startDate, endDate });
        await book.save();
        res.status(201).json(book);
    } catch (err) {
        logger.error('Error adding book:', err);
        res.status(500).json({ error: 'Error adding book' });
    }
});

router.get('/api/view-books', async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (err) {
        logger.error('Error fetching books:', err);
        res.status(500).json({ error: 'Error fetching books' });
    }
});
// eslint-disable-next-line consistent-return
router.get('/api/view-book/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (err) {
        logger.error('Error fetching book by ID:', err);
        res.status(500).json({ error: 'Error fetching book by ID' });
    }
});

router.put('/api/edit-book/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, genre, status, notes, rating, startDate, endDate } = req.body;
        const updatedBook = await Book.findByIdAndUpdate(id, { name, genre, status, notes, rating, startDate, endDate }, { new: true });
        res.status(200).json(updatedBook);
    } catch (err) {
        logger.error('Error updating book:', err);
        res.status(500).json({ error: 'Error updating book' });
    }
});

router.delete('/delete-book/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Book.findByIdAndDelete(id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
        logger.error('Error deleting book:', err);
        res.status(500).json({ error: 'Error deleting book' });
    }
});

router.get('/openapi/books', async (req, res) => {
    try {
        const fetch = await import('node-fetch').then((module) => module.default);
        const query = req.query.q;
        const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        logger.error('Error:', error);
        res.status(500).json({ error: 'Internal server error nice' });
    }
});
router.post(
    '/',
    asyncHandler(async (req, res, next) => {
        try {
            const data = await httpOperations.makeHttpCall(req.body);
            logger.info({ message: 'Created post', data });
            res.status(200).send(data);
            req.routeTimer({ statusCode: 200 });
            return next();
        } catch (error) {
            logger.error({
                message: 'Error occurred.',
                companyId: 'CompanyID',
                error: error.message,
            });
            req.routeTimer({ statusCode: 500 });
            return next(error);
        }
    }),
    performanceTimer
);

module.exports = router;
