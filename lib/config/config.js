const path = require('path');

if (!process.env.ENV_LOADED) {
  console.log('\nLoading Environment...');
  require('dotenv').config({ // eslint-disable-line global-require
    path: path.resolve(__dirname, '../../.env'),
    debug: process.env.DEBUG,
  });
}

module.exports = {
  get(property) {
    if (process.env[property]) {
      return process.env[property];
    }

    return null;
  },

  getBool(property) {
    const envVar = this.get(property);
    if (typeof envVar === 'boolean') {
      return envVar;
    }

    if (typeof envVar === 'string') {
      return envVar.toLowerCase() === 'true';
    }

    return envVar;
  },

  getEnvironment() {
    return (this.get('NODE_ENV') || this.get('ENV') || 'LOCAL').toUpperCase();
  },

  isDebugMode() {
    return this.getBool('DEBUG') === true;
  },
};
