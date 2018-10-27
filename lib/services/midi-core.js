/* eslint-disable new-cap, no-console */
const dotenv = require('dotenv').config();
const _ = require('lodash');
const Midi = require('midi');
const RequestPromise = require('request-promise-native').defaults({ json: true });

const MidiCore = {};
module.exports = MidiCore;

/* ****************************** EXPORTS ***************************** */

const MODEPHOST = process.env.MODEP_HOST_ADDRESS || 'http://localhost:80/'; // REMOTE: http://172.24.1.1

/* OSX:
Port 0: USB MIDI Interface
Port 1: Fishman TriplePlay TP Guitar
Port 2: Fishman TriplePlay TP Control
*/

/* PiSound:
Port 0: Midi Through 14:0
Port 1: pisound 20:0
Port 2: Fishman TriplePlay 24:0
Port 3: Fishman TriplePlay 24:1
Port 4: touchosc 128:0
Port 5: RtMidiOut Client 131:0
*/

MidiCore.getDevicePortNames = () => {
  const MidiIn = new Midi.input();
  const portCount = MidiIn.getPortCount();
  const portNames = _.times(portCount, (port) => MidiIn.getPortName(port));
  _.forEach(portNames, (portName, portNumber) => console.log(`Port ${portNumber}: ${portName}`));
  const mappedPorts = _.map(portNames, (value, key) => ({ portNumber: key, portName: value }));
  return mappedPorts;
};

MidiCore.getJackMidiDevices = async () => {
  const response = await RequestPromise.get(`${MODEPHOST}/jack/get_midi_devices`);
  return response;
};

MidiCore.mapDevices = (devicePorts, jackDevices) => {
  const { devList, devsInUse, names: deviceNames } = jackDevices;
  return deviceNames;
};

MidiCore.getDefaultDeviceName = async () => {
  const devicePorts = MidiCore.getDevicePortNames();
  /* const { devList, devsInUse, names: jackDeviceNames } = await MidiCore.getJackMidiDevices(); */
  const jackDevices = await MidiCore.getJackMidiDevices();
  const mappedDevices = MidiCore.mapDevices(devicePorts, jackDevices);
  return mappedDevices;
  /* return {
    devicePorts,
    jackDeviceNames,
    devList,
    devsInUse,
  }; */
};
