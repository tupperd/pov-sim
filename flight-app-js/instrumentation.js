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

const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const metricReaderOtlp = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),

  // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
  exportIntervalMillis: 10000,
});

const metricReaderConsole = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),

  // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
  exportIntervalMillis: 10000,
});


const meterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReaderConsole,metricReaderOtlp],
});

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

// Export the meter and SDK so they can be used in your application
module.exports = { meterProvider, opentelemetry };