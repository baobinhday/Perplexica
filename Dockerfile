# Use the SearXNG image as the base for final image
FROM searxng/searxng:2025.4.7-b146b745a

# Set the default port to 7860 if not provided
ENV PORT=3000

# Expose the port specified by the PORT environment variable
EXPOSE $PORT

# Install necessary packages using Alpine's package manager
RUN apk add --update \
  nodejs \
  npm \
  git \
  build-base

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
# Set up user and directory structure
ARG USERNAME=perplexica
ARG HOME_DIR=/home/${USERNAME}
ARG APP_DIR=${HOME_DIR}/app

# Create a non-root user and set up the application directory
RUN adduser -D -u 1000 ${USERNAME} \
  && mkdir -p ${APP_DIR} \
  && chown -R ${USERNAME}:${USERNAME} ${HOME_DIR}

# Switch to the non-root user
USER ${USERNAME}

# Set the working directory to the application directory
WORKDIR ${APP_DIR}

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY tsconfig.json next.config.mjs next-env.d.ts postcss.config.js drizzle.config.ts tailwind.config.ts ./
COPY sample.config.toml ./config.toml
COPY src ./src
COPY public ./public

RUN mkdir -p /home/perplexica/data
RUN yarn build


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
