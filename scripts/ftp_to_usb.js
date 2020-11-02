const dotenv = require('dotenv').config();

// Libs
const _ = require('lodash');
const easymidi = require('easymidi');

const MidiCore = require('../lib/services/midi-core');

/* ****************************** APP ***************************** */
const defaultDeviceName = MidiCore.getDefaultDeviceName();
console.info(`Creating Input for Default Device: ${defaultDeviceName}`);
const midiIn = new easymidi.Input('Fishman TriplePlay TP Guitar');
const midiOut = new easymidi.Output('USB MIDI Interface');
const midiOutChannel = _.toInteger(process.env.MIDI_OUT_CHANNEL || 0);
console.log('Midi Out Channel:', midiOutChannel);
let previousProgramNumber = 0;

resetBanks();

midiIn.on('message', (params) => {
  const messageType = _.get(params, '_type');
  if (messageType === 'sysex') return;
  if (messageType !== 'program') return;
  console.log(params);

  const currentProgramNumber = _.get(params, 'number', previousProgramNumber);
  if (isBankUp(currentProgramNumber)) {
    pcUp();
    // strymonBankUp();
  }

  if (isBankDown(currentProgramNumber)) {
    pcDown();
    // strymonBankDown();
  }

  previousProgramNumber = currentProgramNumber;
});

function isBankUp(currentProgramNumber) {
  return currentProgramNumber > previousProgramNumber;
}

function isBankDown(currentProgramNumber) {
  return (currentProgramNumber < previousProgramNumber) || currentProgramNumber === 0;
}

/* ****************************** STRYMON FUNCTIONS ***************************** */
function resetBanks() {
  midiOut.send('program', {
    channel: midiOutChannel,
    number: 0,
  });
  console.log('Program Reset to 0');
}

function pcUp() {
  const newProgramNumber = previousProgramNumber === 127 ? 0 : previousProgramNumber + 1;
  midiOut.send('program', {
    channel: midiOutChannel,
    number: newProgramNumber,
  });
  console.log('PC Up Sent');
}

function pcDown() {
  const newProgramNumber = previousProgramNumber === 0 ? 127 : previousProgramNumber - 1;
  midiOut.send('program', {
    channel: midiOutChannel,
    number: newProgramNumber,
  });
  console.log('PC Down Sent');
}

function strymonBankUp() {
  // Press Down
  midiOut.send('cc', {
    channel: midiOutChannel,
    controller: 81,
    value: 0,
  });
  midiOut.send('cc', {
    channel: midiOutChannel,
    controller: 82,
    value: 0,
  });

  // Release
  midiOut.send('cc', {
    channel: midiOutChannel,
    controller: 81,
    value: 127,
  });
  midiOut.send('cc', {
    channel: midiOutChannel,
    controller: 82,
    value: 127,
  });
  console.log('Strymon Bank Up Sent');
}

function strymonBankDown() {
  // Press Down
  midiOut.send('cc', {
    channel: midiOutChannel,
    controller: 80,
    value: 0,
  });
  midiOut.send('cc', {
    channel: midiOutChannel,
    controller: 82,
    value: 0,
  });

  // Release
  midiOut.send('cc', {
    channel: midiOutChannel,
    controller: 80,
    value: 127,
  });
  midiOut.send('cc', {
    channel: midiOutChannel,
    controller: 82,
    value: 127,
  });
  console.log('Strymon Bank Down Sent');
}


/*
// Toggle Switch
SYNTH
{ channel: 7, controller: 63, value: 2, _type: 'cc' }
{ channel: 0, controller: 7, value: 127, _type: 'cc' }
{ channel: 1, controller: 7, value: 127, _type: 'cc' }

MIX
{ channel: 7, controller: 63, value: 3, _type: 'cc' }
{ channel: 0, controller: 7, value: 127, _type: 'cc' }
{ channel: 1, controller: 7, value: 127, _type: 'cc' }

GUITAR
{ channel: 7, controller: 63, value: 1, _type: 'cc' }
{ channel: 0, controller: 7, value: 0, _type: 'cc' }
{ channel: 1, controller: 7, value: 0, _type: 'cc' }

// Volume Knob
{ channel: 0, controller: 7, value: 0-127, _type: 'cc' }
*/

/*
Send MIDI CC# 102 with a value of 127 to engage the current preset
Send MIDI CC# 102 with a value of  0 to bypass the current preset
 */
