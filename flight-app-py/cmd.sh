 # Language guides: https://grafana.com/docs/grafana-cloud/monitor-applications/application-observability/setup/quickstart/
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp-gateway-prod-us-west-0.grafana.net/otlp"
# Python requires "Basic%20" instead of "Basic "
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic%20ODYwMjE1OmdsY19leUp2SWpvaU1UQTFOekF4TkNJc0ltNGlPaUp6ZEdGamF5MDROakF5TVRVdGIzUnNjQzEzY21sMFpTMXdiM1l0YzJsdExYQjVJaXdpYXlJNklrOVVTamcxT0VkdGFUZzFaRFIzTURsclQzYzBaM1p3TnlJc0ltMGlPbnNpY2lJNkluQnliMlF0ZFhNdGQyVnpkQzB3SW4xOQ=="
export OTEL_SERVICE_NAME="flight-app-py"
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
opentelemetry-instrument flask run --host=0.0.0.0
