/* eslint-disable new-cap, no-console */
const _ = require('lodash');
const Midi = require('midi');

function getPortNames() {
  const MidiIn = new Midi.input();
  const portCount = MidiIn.getPortCount();
  const portNames = _.times(portCount, (port) => MidiIn.getPortName(port));

  if (!portNames || !portNames.length) {
    console.log('No midiports detected');
  }

  _.forEach(portNames, (portName, portNumber) => console.log(`Port ${portNumber}: ${portName}`));
  return portNames;
}

getPortNames();
