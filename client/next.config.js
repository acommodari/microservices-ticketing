module.exports = {
  webpackDevMiddleware: (config) => {
    // attempt to proactively fix next.js hot reloading while in docker
    config.watchOptions.poll = 300;
    return config;
  },
};
