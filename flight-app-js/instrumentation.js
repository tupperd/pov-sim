const opentelemetry = require('@opentelemetry/api');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} = require('@opentelemetry/semantic-conventions');

const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: 'flight-app-js',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
);

// METRICS
//
//
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const metricReaderOtlp = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),

  // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
  exportIntervalMillis: 10000,
});

const meterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReaderOtlp],
});

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

// LOGGING 
//
//
const { LoggerProvider, BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');

// Create log exporters (OTLP for Grafana Cloud)
const logExporter = new OTLPLogExporter();

// Initialize a LoggerProvider and attach the exporters with BatchLogRecordProcessor
const loggerProvider = new LoggerProvider({
  resource,
});
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));

// Export the meter and SDK so they can be used in your application
module.exports = { meterProvider, loggerProvider, opentelemetry };