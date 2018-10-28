/* eslint-disable new-cap, no-console, object-curly-newline, no-unused-vars */
const dotenv = require('dotenv').config();
const _ = require('lodash');
const Midi = require('midi');
const RequestPromise = require('request-promise-native').defaults({ json: true });

const MidiCore = {};
module.exports = MidiCore;

/* ****************************** EXPORTS ***************************** */

const MODEPHOST = process.env.MODEP_HOST_ADDRESS || 'http://172.24.1.1/'; // http://localhost:80/

/* OSX:
Port 0: USB MIDI Interface
Port 1: Fishman TriplePlay TP Guitar
Port 2: Fishman TriplePlay TP Control
*/

/* PiSound:
Port 0: Midi Through:Midi Through Port-0 14:0
Port 1: pisound:pisound MIDI PS-305G0BA 20:0
Port 2: Fishman TriplePlay:Fishman TriplePlay MIDI 1 24:0
Port 3: Fishman TriplePlay:Fishman TriplePlay MIDI 2 24:1
Port 4: USB MIDI Interface:USB MIDI Interface MIDI 1 28:0
Port 5: touchosc:touchosc 128:0
Port 6: RtMidiOut Client:RtMidi output 131:0
Port 7: pisound-ctl:pisound-ctl 132:0
*/

const deviceOrderPreferences = ['Fishman TriplePlay', 'USB MIDI Interface', 'pisound', 'Midi Through'];

MidiCore.getDevicePortNames = () => {
  const MidiIn = new Midi.input();
  const portCount = MidiIn.getPortCount();
  const portNames = _.times(portCount, (port) => MidiIn.getPortName(port));
  _.forEach(portNames, (portName, portNumber) => console.log(`Port ${portNumber}: ${portName}`));
  return portNames;
};

MidiCore.getDefaultDeviceName = () => {
  let defaultDevice;
  const portNames = MidiCore.getDevicePortNames();
  console.log();
  _.forEach(deviceOrderPreferences, (preferredDevice) => {
    defaultDevice = _.find(portNames, (portName) => _.includes(portName, preferredDevice));
    if (defaultDevice) {
      return false; // Match found, break loop
    }
  });
  return defaultDevice;
};

MidiCore.getMappedDevicePortNames = () => {
  const portNames = MidiCore.getDevicePortNames();
  if (process.env.DEBUG) _.forEach(portNames, (portName, portNumber) => console.log(`Port ${portNumber}: ${portName}`));
  const mappedPorts = _.map(portNames, (value, key) => ({ portNumber: key, portName: value }));
  return mappedPorts;
};

MidiCore.getJackMidiDevices = async () => {
  const response = await RequestPromise.get(`${MODEPHOST}/jack/get_midi_devices`)
    .catch(() => {
      console.error(`Unable to get midi devices from ${MODEPHOST}`);
      return {};
    });
  return response;
};

MidiCore.mapDevices = (devicePorts, jackDevices) => {
  const { devList, devsInUse, names: deviceNames } = jackDevices;
  return {
    devicePorts,
    deviceNames,
    devList,
    devsInUse,
  };
};

MidiCore.getDevices = async () => {
  const devicePorts = MidiCore.getDevicePortNames();
  const jackDevices = await MidiCore.getJackMidiDevices();
  const mappedDevices = MidiCore.mapDevices(devicePorts, jackDevices);
  return mappedDevices;
};

MidiCore.getDefaultDeviceNameASYNC = async () => {
  let defaultDevice;
  const midiDevices = await MidiCore.getDevices();
  const { devicePorts, deviceNames, devList, devsInUse } = midiDevices;
  _.forEach(deviceOrderPreferences, (preferredDevice) => {
    defaultDevice = _.find(devicePorts, (devicePort) => _.includes(_.get(devicePort, 'portName'), preferredDevice));
    if (defaultDevice) {
      return false; // Match found, break loop
    }
  });
  const defaultDeviceName = _.get(defaultDevice, 'portName');
  return defaultDeviceName;
};
