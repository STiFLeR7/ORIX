'use strict';
const dictionaries = {
  en: { showLayer: 'Show desktop layer', hideLayer: 'Hide desktop layer', settings: 'Settings', startup: 'Start with Windows', restart: 'Restart', quit: 'Quit ORIX',
    starting: 'ORIX is starting.', showFirst: 'Show the desktop layer first.', invalidAppearance: 'Invalid appearance settings.',
    loadLicense: 'Could not load license information.', savePreferences: 'Could not save preferences. Try again.', chooseVisibility: 'Choose ON or OFF.',
    saveVisibility: 'Could not save layer visibility. Try again.', notAllowed: 'Not allowed.',
    chooseProject: 'Choose your ORIX project', projectChoose: 'Choose project', loginTitle: 'ORIX · Connect ChatGPT',
    loginCode: 'Your one-time login code:', loginDetail: 'Copy the code and open the official OpenAI login page. Sign in and paste the code there. Keep ORIX open until the connection is complete.',
    loginOpen: 'Copy code and open browser', cancel: 'Cancel' }
};
const text = (lang, key) => { const copy = dictionaries.en; return Object.hasOwn(copy, key) ? copy[key] : ''; };
module.exports = { text, dictionaries };
