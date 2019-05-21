/* eslint no-console:0 */
const config = require('config');

const Log = {};
const LOG_FNS = ['debug', 'log', 'info', 'warning', 'error'];

Log.verbosity = LOG_FNS.indexOf(config.log);

LOG_FNS
  .forEach((level, index) => Object.assign(Log, {
    [level]: (message) => {
      if (Log.verbosity <= index) {
        console.log(`${level.toUpperCase()} :: ${message}`);
      }
    },
  }));

Log.time = id => console.time(id);
Log.timeEnd = id => console.timeEnd(id);

module.exports = Log;
