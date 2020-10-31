# Midi Event Mapper
Midi event handling and mapping for NodeJS, Raspberry Pi, and PiSound MODEP by Blokas Labs

## Local Setup
- `$ git clone git@github.com:rveitch/node-midi-event-mapper.git`
- `$ npm install`
- Copy `template.env.txt` and rename it to `.env`
- Add your local environment variable keys to the `.env` file and save it.
- Run `$ npm start` or `$ node app` to initialize the app.
- Visit http://localhost:3000 in your browser.


```midi event examples
{ channel: 0, number: 3, _type: 'program' }
{ channel: 7, controller: 31, value: 85, _type: 'cc' }
{ channel: 0, note: 84, velocity: 10, _type: 'noteon' }
{ channel: 0, note: 84, velocity: 0, _type: 'noteoff' }
{ channel: 0, value: 8192, _type: 'pitch' }
```
