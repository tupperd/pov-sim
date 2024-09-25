const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const utils = require('./utils.js');

const { meterProvider,loggerProvider,opentelemetry } = require('./instrumentation.js');

// ADDING LOGGING INSTRUMENTATION
//  To create a log record, you first need to get a Logger instance
//const logger = loggerProvider.getLogger('flight-app-js');
const logger = loggerProvider.getLogger('default');

// ADDING TRACING INSTRUMENTATION
const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// ADDING METRICS INSTRUMENTATION
// Custom counter metric
const counterMeter = meterProvider.getMeter('flight-app-js', '1.0');
const requestCounter = counterMeter.createCounter('flightappjshomepage');
// Custom histogram metric
const histogramMeter = meterProvider.getMeter('flight-app-js', '1.0');
const histogram = histogramMeter.createHistogram('flightappjshistogram');

const AIRLINES = ['AA', 'UA', 'DL'];

const app = express();

const swaggerDocs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flight App',
      version: '1.0.0',
      description: 'A simple Express Flight App',
    },
  },
  apis: ['app.js'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: No-op home endpoint
 *     responses:
 *       200:
 *         description: Returns ok
 */

let currentCount = 0;
app.get('/', (req, res) => {
  // Adding custom span
  const span = tracer.startSpan('customSpan', {
    attributes: { route: req.url, method: req.method } // Fixed typo
  });
  span.addEvent('This custom span generates when homepage is visited successfully.'); // Fixed typo
  span.end();

  // Add a custom counter metric that increments upon each call to the root endpoint
  requestCounter.add(1, { route: req.url });
  currentCount += 1;
  console.log(`Metric emitted: requestCounter incremented ${currentCount}`);

  // Send at least one custom log per endpoint
  logger.emit({
    severityText: 'INFO',
    body: 'Reached this page: /',
    attributes: { 'log.type': 'LogRecord' },
  });

  res.send({ message: 'ok' });
});

/**
 * @swagger
 * /airlines/{err}:
 *   get:
 *     summary: Get airlines endpoint. Set err to "raise" to trigger an exception.
 *     parameters:
 *       - in: path
 *         name: err
 *         type: string
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - raise
 *     responses:
 *       200:
 *         description: Returns a list of airlines
 */
app.get('/airlines/:err?', (req, res) => {
  if (req.params.err === 'raise') {
    getTracer();
    throw new Error('Raise test exception');
  }
  // Send at least one custom log per endpoint
  logger.emit({
    severityText: 'INFO',
    body: 'Reached /airlines',
    attributes: { 'log.type': 'LogRecord' },
  });
  res.send({ airlines: AIRLINES });
});

/**
 * @swagger
 * /flights/{airline}/{err}:
 *   get:
 *     summary: Get flights endpoint. Set err to "raise" to trigger an exception.
 *     parameters:
 *       - in: path
 *         name: airline
 *         type: string
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - AA
 *             - UA
 *             - DL
 *       - in: path
 *         name: err
 *         type: string
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - raise
 *     responses:
 *       200:
 *         description: Returns a list of airlines
 */
app.get('/flights/:airline/:err?', (req, res) => {
  if (req.params.err === 'raise') {
    throw new Error('Raise test exception');
  }
  const randomInt = utils.getRandomInt(100, 999);
  // Add a custom histogram metric that records the random int generated in the /flights endpoint
  histogram.record(randomInt);
  
  // Send at least one custom log per endpoint
  logger.emit({
    severityText: 'INFO',
    body: 'Reached /flights/airline',
    attributes: { 'log.type': 'LogRecord' },
  });
  res.send({ [req.params.airline]: [randomInt] });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
