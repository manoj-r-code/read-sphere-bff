
const express = require('express');

const performanceTimer = require('../middleware/end-performance-timer');
const addBook = require('../lib/handler/addBook');
const getBooks = require('../lib/handler/getBooks');
const editBook = require('../lib/handler/editBook');
const deleteBook = require('../lib/handler/deleteBook');
const findBookById = require('../lib/handler/findBookByID');

const asyncHandler = require('../utils/async-handler');
const httpOperations = require('../lib/http-operations');

const logger = require('../utils/logger');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ ok: true });
});
router.get('/hello', (req, res) => {
    res.send('hello world');
    res.status(200).json({ ok: true });
});

// Route to fetch all books
router.get('/fetchBooks', async (req, res) => {
    try {
        const data = await getBooks();
        res.send(data);
    } catch (error) {
        res.status(500).send(`Error fetching books: ${error.message}`);
    }
});

// eslint-disable-next-line consistent-return
router.get('/:id', async (req, res) => {
    try {
        const bookID = req.params.id;
        const book = await findBookById(bookID); // Corrected function name

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to add a book
router.post('/addBook', async (req, res) => {
    try {
        await addBook(req.body);
        res.json({ message: 'Book added successfully' });
    } catch (error) {
        res.status(500).send(`Error adding book: ${error.message}`);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        await deleteBook(bookId);
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).send(`Error deleting book: ${error.message}`);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const updatedData = req.body; // Assuming updated data is sent in the request body
        await editBook(bookId, updatedData);
        res.json({ message: 'Book edited successfully' });
    } catch (error) {
        res.status(500).send(`Error editing book: ${error.message}`);
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
