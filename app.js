// Libs
const _ = require('lodash');
const easymidi = require('easymidi');

const MidiCore = require('./lib/services/midi-core');

/* ****************************** SETUP ***************************** */

const defaultDeviceName = MidiCore.getDefaultDeviceName();
console.info(`Creating Input for Default Device: ${defaultDeviceName}`);
const MidiIn = new easymidi.Input(defaultDeviceName);

MidiIn.on('message', (params) => {
  if (_.get(params, '_type') === 'sysex') return;
  console.log(params);
});
