require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Sentry = require('@sentry/node');

const packageJson = require('../package.json');
const metrics = require('./metrics');
const logger = require('./utils/logger');

const routeTimerMiddleware = require('./middleware/route-timer');
const performanceTimer = require('./middleware/start-performance-timer');

const indexRouter = require('./routes/index');
const metricsRouter = require('./routes/metrics');
// const addBook = require('./lib/handler/addBookHandler');
// const getBooks = require('./lib/handler/getBookHandler');
const bookRoutes = require('./routes/book');

const app = express();

Sentry.init({
    dsn: process.env.SENTRY_DSN_KEY,
    attachStacktrace: true,
    environment: process.env.APP_ENVIRONMENT,
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
    ],
    autoSessionTracking: false,
    tracesSampleRate: 0.1, // only sample 10% of all requests
    beforeSend: (event, hint) => {
        // If some events should be filtered out before sending to sentry, here is where you should edit it
        // return null, to filter the event out
        if (hint === 'dont_send') {
            return null;
        }
        metrics.sentryUsageHistogram.observe({ applicationName: packageJson.name }, 1);
        return event;
    },
});

app.use(Sentry.Handlers.requestHandler());

morgan.format('customFormat', (req, res) => {
    const requestBody = req.body;
    // Redact all sensitive information from logs. Authorization Tokens, etc
    if (requestBody['sensitive-information']) {
        requestBody['sensitive-information'] = 'REDACTED';
    }
    return JSON.stringify({
        method: req.method,
        body: requestBody,
        url: req.originalUrl || req.url,
        remoteAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        httpVersionMajor: req.httpVersionMajor,
        httpVersionMinor: req.httpVersionMinor,
        statusCode: res.statusCode,
        contentLength: res.getHeader('content-length'),
        referrer: req.headers.referer || req.headers.referrer,
        userAgent: req.headers['user-agent'],
    });
});

app.use(
    morgan(':customFormat', {
        stream: {
            write(log) {
                logger.debug(log);
            },
        },
        skip: (req, res) => {
            return res.statusCode < 400;
        },
    })
);

app.use(
    cors({
        origin: [
            'http://localhost:4200',
            '', // Frontend URL
        ],
    })
);

// Required for parsing json bodies.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Attach route timer to all requests
app.use('*', routeTimerMiddleware, performanceTimer);

// Default route
app.use('/', indexRouter);
app.use('/metrics', metricsRouter);
app.use('/test', bookRoutes);

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    logger.error({ message: 'Route failed', error: error.message });
    res.locals.message = error.message;
    res.locals.error = error;

    res.setHeader('X-Sentry-Id', res.sentry);
    res.status(error.status || 500).json({ error: error.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Routes not found');
});

module.exports = app;
