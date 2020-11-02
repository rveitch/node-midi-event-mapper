const easymidi = require('easymidi');
const Config = require('../lib/config');
const MidiCore = require('../lib/services/midi-core');
const Modep = require('../lib/components/modep');

/* ****************************** CONFIG ***************************** */

const ignoredMessageTypes = ['sysex'];
const deviceOrderPreferences = ['Fishman TriplePlay', 'USB MIDI Interface', 'pisound', 'Midi Through']; // TODO: Move to a config file, JSON or yaml

/* ****************************** APP ***************************** */

const defaultInputDeviceName = MidiCore.getDefaultInputDeviceName(deviceOrderPreferences);

if (!defaultInputDeviceName) {
  console.log('No default device found, exiting program.');
  process.exit();
}

console.info(`\nCreating Input for Default Device: ${defaultInputDeviceName}`);

const MidiIn = new easymidi.Input(defaultInputDeviceName);

MidiIn.on('message', (params) => {
  const { _type: messageType } = params || {};
  if (ignoredMessageTypes.includes(messageType)) return;

  console.log('message params:', params);

  if (messageType === 'program' && !Config.getBool('LOG_ONLY')) {
    Modep.changeRandomPreset();
  }
});
