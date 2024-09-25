# Use the official Python 3.8 image as the base image
FROM python:3.8-slim-buster

# Set the working directory inside the container
WORKDIR /python-docker

# Copy the requirements file into the container
COPY requirements.txt requirements.txt

# Install the required dependencies
RUN pip3 install -r requirements.txt

# Copy the rest of your application code into the container
COPY . .

ENV OTEL_SERVICE_NAME="flight-app-py"
ENV OTEL_TRACES_EXPORTER="console"
ENV OTEL_METRICS_EXPORTER="console"
#ENV OTEL_LOGS_EXPORTER="otlp,console"
#ENV NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
#ENV OTEL_RESOURCE_ATTRIBUTES="service.instance.id=my-service-instance-id"
#ENV OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
#ENV OTEL_EXPORTER_OTLP_ENDPOINT="0.0.0.0:4317"
#ENV OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic%20ODYwMjE1OmdsY19leUp2SWpvaU1UQTFOekF4TkNJc0ltNGlPaUp6ZEdGamF5MDROakF5TVRVdGIzUnNjQzEzY21sMFpTMW1iR2xuYUhRdFlYQndMV3B6SWl3aWF5STZJak51TTAxVVFqVkhNMUEwUldvME16WlZVRWcyZVhZMVp5SXNJbTBpT25zaWNpSTZJbkJ5YjJRdGRYTXRkMlZ6ZEMwd0luMTk="

#ENV OTEL_LOG_LEVEL=debug
ENV OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED="true"

# Specify the command to run your Flask app
CMD ["opentelemetry-instrument", "python3", "-m", "flask", "run", "--host=0.0.0.0"]
