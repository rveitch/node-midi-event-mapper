/* eslint-disable new-cap, no-console, object-curly-newline, no-unused-vars */
const _ = require('lodash');
const Midi = require('midi');

const Config = require('../config');

/* ****************************** SETUP ***************************** */

const MidiCore = {};
module.exports = MidiCore;

/* ****************************** EXPORTS ***************************** */

MidiCore.getInputDevicesPortHash = () => {
  const MidiIn = new Midi.input();

  const portCount = MidiIn.getPortCount();
  const portNames = _.times(portCount, (port) => MidiIn.getPortName(port));

  if (!portNames || !portNames.length) {
    return [];
  }

  if (Config.isDebugMode()) {
    console.log('\nMIDI Input Devices By Port:');
    _.forEach(portNames, (portName, portNumber) => console.log(`Port ${portNumber}: ${portName}`));
  }

  return portNames || [];
};

MidiCore.getInputDevices = () => {
  const portNames = MidiCore.getInputDevicesPortHash();
  const mappedPorts = _.map(portNames, (value, key) => ({ portNumber: key, portName: value }));
  return mappedPorts;
};

MidiCore.getDefaultInputDevice = (deviceOrderPreferences) => {
  let defaultDevice = null;
  const portNames = MidiCore.getInputDevices();

  if (deviceOrderPreferences && deviceOrderPreferences.length) {
    _.forEach(deviceOrderPreferences, (preferredDevice) => {
      defaultDevice = _.find(portNames, (port) => ((port && port.portName) || '').includes(preferredDevice));
      if (defaultDevice) return false; // Match found, break loop
    });
  }

  if (!defaultDevice && portNames && portNames.length) {
    defaultDevice = _.first(portNames);
  }

  return defaultDevice;
};

MidiCore.getDefaultInputDeviceName = (deviceOrderPreferences) => {
  const defaultDevice = MidiCore.getDefaultInputDevice(deviceOrderPreferences);
  const { portName: deviceName } = defaultDevice || {};
  return deviceName;
};
