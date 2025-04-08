# Build llama.cpp in a separate stage
FROM alpine:3.21 AS llama-builder

# Install build dependencies
RUN apk add --update \
  build-base \
  cmake \
  ccache \
  git \
  curl

# Build llama.cpp server and collect libraries
RUN cd /tmp && \
  git clone https://github.com/ggerganov/llama.cpp.git --depth=1 && \
  cd llama.cpp && \
  cmake -B build -DGGML_NATIVE=OFF -DLLAMA_CURL=OFF && \
  cmake --build build --config Release -j --target llama-server && \
  mkdir -p /usr/local/lib/llama && \
  find build -type f \( -name "libllama.so" -o -name "libggml.so" -o -name "libggml-base.so" -o -name "libggml-cpu.so" \) -exec cp {} /usr/local/lib/llama/ \;

# Use the SearXNG image as the base for final image
FROM searxng/searxng:2025.4.7-b146b745a

# Set the default port to 7860 if not provided
ENV PORT=7860

# Expose the port specified by the PORT environment variable
EXPOSE $PORT

# Install necessary packages using Alpine's package manager
RUN apk add --update \
  nodejs \
  npm \
  git \
  build-base

# Copy llama.cpp artifacts from builder
COPY --from=llama-builder /tmp/llama.cpp/build/bin/llama-server /usr/local/bin/
COPY --from=llama-builder /usr/local/lib/llama/* /usr/local/lib/
RUN ldconfig /usr/local/lib

# Set the SearXNG settings folder path
ARG SEARXNG_SETTINGS_FOLDER=/etc/searxng

# Modify SearXNG configuration:
# 1. Change output format from HTML to JSON
# 2. Remove user switching in the entrypoint script
# 3. Create and set permissions for the settings folder
RUN sed -i 's/- html/- json/' /usr/local/searxng/searx/settings.yml \
  && sed -i 's/su-exec searxng:searxng //' /usr/local/searxng/dockerfiles/docker-entrypoint.sh \
  && mkdir -p ${SEARXNG_SETTINGS_FOLDER}  \
  && chmod 777 ${SEARXNG_SETTINGS_FOLDER}



####
FROM node:20.18.0-slim AS builder

WORKDIR /home/perplexica

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY tsconfig.json next.config.mjs next-env.d.ts postcss.config.js drizzle.config.ts tailwind.config.ts ./
COPY src ./src
COPY public ./public

RUN mkdir -p /home/perplexica/data
RUN yarn build

FROM node:20.18.0-slim

WORKDIR /home/perplexica

COPY --from=builder /home/perplexica/public ./public
COPY --from=builder /home/perplexica/.next/static ./public/_next/static

COPY --from=builder /home/perplexica/.next/standalone ./
COPY --from=builder /home/perplexica/data ./data

RUN mkdir /home/perplexica/uploads

#CMD ["node", "server.js"]


# Set the entrypoint to use a shell
ENTRYPOINT [ "/bin/sh", "-c" ]

# Run SearXNG in the background and start the Node.js application using PM2
CMD [ "(/usr/local/searxng/dockerfiles/docker-entrypoint.sh -f > /dev/null 2>&1) & (node server.js)" ]
