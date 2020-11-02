/* eslint-disable new-cap, no-console, object-curly-newline, no-unused-vars, arrow-body-style */
const _ = require('lodash');
const RequestPromise = require('request-promise-native').defaults({ json: true });

const Config = require('../config');
const MidiCore = require('../services/midi-core');

/* ****************************** SETUP ***************************** */

const Modep = {};
module.exports = Modep;

/* ****************************** CONFIG ***************************** */

const MODEP_HOST = Config.get('MODEP_HOST_ADDRESS') || 'http://172.24.1.1/'; // http://localhost:80/

/* ****************************** MODEP ***************************** */

Modep.getDevices = async () => {
  const devicePorts = MidiCore.getInputDevicesPortHash();
  const modepJackDevices = await Modep.getJackMidiDevicesFromModepHost();
  const { devList, devsInUse, names: deviceNames } = modepJackDevices || {};
  return {
    devicePorts,
    deviceNames,
    devList,
    devsInUse,
  };
};

Modep.getJackMidiDevicesFromModepHost = () => {
  return RequestPromise.get(`${MODEP_HOST}/jack/get_midi_devices`)
    .catch(() => {
      console.error(`Unable to get midi devices from ${MODEP_HOST}`);
      return {};
    });
};

Modep.getPedalboardPresets = async () => {
  const response = await RequestPromise.get(`${MODEP_HOST}/pedalboard/list`)
    .catch(() => {
      console.error(`Unable to get pedalboard list from ${MODEP_HOST}`);
      return {};
    });

  // Filter out invalid presets and return all valid presets
  return _.filter(response, (preset) => {
    const { broken: isBroken, valid: isValid } = preset || {};
    return isValid && !isBroken;
  });
};

Modep.changeRandomPreset = async () => {
  const pedalboardPresets = await Modep.getPedalboardPresets();
  if (!pedalboardPresets || !pedalboardPresets.length) {
    return false;
  }

  const randomPresetIndex = _.random(0, pedalboardPresets.length);
  const randomPreset = pedalboardPresets[randomPresetIndex];
  const { title: bundleTitle, bundle: bundlepath } = randomPreset || {};

  if (bundlepath) console.log(`Loading Preset: ${bundleTitle}`);

  const resetResponse = await RequestPromise.get(`${MODEP_HOST}/reset`);

  const requestOptions = {
    method: 'POST',
    url: `${MODEP_HOST}/pedalboard/load_bundle/`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: { bundlepath },
  };

  const presetChangeResponse = await RequestPromise(requestOptions)
    .catch((error) => {
      console.error(`Error loading bundle preset ${bundleTitle}`);
      console.log(error);
    });

  return randomPreset;
};
