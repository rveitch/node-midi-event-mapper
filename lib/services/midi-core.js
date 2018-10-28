/* eslint-disable new-cap, no-console, object-curly-newline, no-unused-vars */
const dotenv = require('dotenv').config();
const _ = require('lodash');
const Midi = require('midi');
const RequestPromise = require('request-promise-native').defaults({ json: true });

const MidiCore = {};
module.exports = MidiCore;

/* ****************************** EXPORTS ***************************** */

const MODEPHOST = process.env.MODEP_HOST_ADDRESS || 'http://172.24.1.1/'; // http://localhost:80/
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

MidiCore.getPedalboardPresets = async () => {
  const response = await RequestPromise.get(`${MODEPHOST}/pedalboard/list`)
    .catch(() => {
      console.error(`Unable to get pedalboard list from ${MODEPHOST}`);
      return {};
    });
  const validPresets = _.filter(response, (preset) => preset && !preset.broken && preset.valid);
  return validPresets;
};

MidiCore.changeRandomPreset = async () => {
  const pedalboardPresets = await MidiCore.getPedalboardPresets();
  if (!pedalboardPresets || !pedalboardPresets.length) {
    return false;
  }
  const randomPresetIndex = _.random(0, pedalboardPresets.length);
  const randomPreset = pedalboardPresets[randomPresetIndex];
  const bundleTitle = _.get(randomPreset, 'title')
  const bundlePath = _.get(randomPreset, 'bundle');
  if (bundlePath) console.log(`Loading Preset: ${bundleTitle}`);
  const resetResponse = await RequestPromise.get(`${MODEPHOST}/reset`);
  const requestOptions = {
    method: 'POST',
    url: `${MODEPHOST}/pedalboard/load_bundle/`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: { bundlepath: bundlePath },
  };
  const presetChangeResponse = await RequestPromise(requestOptions)
    .catch((error) => {
      console.error(`Error loading bundle preset ${bundleTitle}`);
      console.log(error);
    });
  return randomPreset;
};
