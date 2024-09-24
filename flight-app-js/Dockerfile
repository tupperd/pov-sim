# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Set environment variables
ENV OTEL_SERVICE_NAME="flight-app-js"
ENV OTEL_TRACES_EXPORTER="otlp"
ENV NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
ENV OTEL_RESOURCE_ATTRIBUTES="service.instance.id=my-service-instance-id"
# I think by only having a few enabled below, I'm preventing some of these from working see: 
# https://opentelemetry.io/docs/zero-code/js/
#ENV OTEL_NODE_RESOURCE_DETECTORS="env,host,os,serviceinstance"
ENV OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
ENV OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp-gateway-prod-us-west-0.grafana.net/otlp"
ENV OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ODYwMjE1OmdsY19leUp2SWpvaU1UQTFOekF4TkNJc0ltNGlPaUp6ZEdGamF5MDROakF5TVRVdGIzUnNjQzEzY21sMFpTMW1iR2xuYUhRdFlYQndMV3B6SWl3aWF5STZJak51TTAxVVFqVkhNMUEwUldvME16WlZVRWcyZVhZMVp5SXNJbTBpT25zaWNpSTZJbkJ5YjJRdGRYTXRkMlZ6ZEMwd0luMTk="

# Expose the port on which the app runs
EXPOSE 3000

# Command to run the app
#CMD ["node", "app.js"]
CMD ["node", "--require", "./instrumentation.js", "app.js"]
