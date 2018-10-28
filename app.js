const dotenv = require('dotenv').config();

// Libs
const _ = require('lodash');
const easymidi = require('easymidi');

const MidiCore = require('./lib/services/midi-core');

/* ****************************** APP ***************************** */
const defaultDeviceName = MidiCore.getDefaultDeviceName();
console.info(`Creating Input for Default Device: ${defaultDeviceName}`);
const MidiIn = new easymidi.Input(defaultDeviceName);

MidiIn.on('message', (params) => {
  const messageType = _.get(params, '_type');
  if (messageType === 'sysex') return;
  console.log(params);
  if (messageType === 'program' && !process.env.LOG_ONLY) MidiCore.changeRandomPreset();
});
