// Libs
const _ = require('lodash');
const easymidi = require('easymidi');
// const Request = require('request');

const MidiCore = require('./lib/services/midi-core');

/* ****************************** SETUP ***************************** */

// const MidiIn = new easymidi.Input();

MidiCore.getDefaultDeviceName().then((response) => console.log(response));

/*
MidiIn.on('message', (deltaTime, message) => {
  console.log('m:' + message + ' d:' + deltaTime);
});
*/

/*
MidiIn.on('message', (params) => {
  // params = {note: ..., velocity: ..., channel: ...}
  console.log(params);
});
*/
