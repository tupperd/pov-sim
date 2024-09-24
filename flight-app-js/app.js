const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const utils = require('./utils.js');

// ADDING TRACING INSTRUMENTATION
const opentelemetry = require('@opentelemetry/api');
const tracer = opentelemetry.trace.getTracer(
  'instrumentation-scope-name',
  'instrumentation-scope-version',
);

// ADDING METRICS INSTRUMENTATION
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-otlp-http'); // Use the HTTP exporter
const { metrics } = require('@opentelemetry/api');
const meter = metrics.getMeter('flight-app-js', '1.0');
const requestCounter = meter.createCounter('flightappjscounter');

// Create an OTLP HTTP metric exporter
const metricExporter = new OTLPMetricExporter({
  url: 'https://otlp-gateway-prod-us-west-0.grafana.net/otlp',
  headers: {
    'Authorization': 'Bearer glc_eyJvIjoiMTA1NzAxNCIsIm4iOiJzdGFjay04NjAyMTUtb3RscC13cml0ZS1wb3Ytc2ltLW1ldHJpY3MxIiwiayI6Ilg5NXRhN2FGSEswMDdzVGwxdmc0amoxMSIsIm0iOnsiciI6InByb2QtdXMtd2VzdC0wIn19', // Replace with your Grafana Cloud API key
  },
});

// Create a MeterProvider and register the HTTP exporter

const meterProvider = new MeterProvider({
  exporter: metricExporter,
  interval: 60000, // Export metrics every second
});

// Register the global meter provider
metrics.setGlobalMeterProvider(meterProvider);


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
  res.send({ [req.params.airline]: [randomInt] });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
