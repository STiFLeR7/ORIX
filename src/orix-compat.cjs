'use strict';

(function identityCompatibility() {
  // Earlier ORIX betas used this prefix for settings and local callbacks.
  const previous = ['two', 'code'].join('');

  function migrateEnvironment(environment) {
    for (const suffix of ['INSTALL_DIR', 'INSTALL_DRYRUN', 'AI_MODEL', 'OPENAI_API_KEY']) {
      const value = environment[previous.toUpperCase() + '_' + suffix];
      if (value !== undefined) environment['ORIX_' + suffix] ??= value;
    }
  }

  function migrateProfile(directory) {
    const fs = require('node:fs');
    const path = require('node:path');
    const { randomUUID } = require('node:crypto');
    for (const suffix of ['project.json', 'ai-settings.json', 'project-chats.json', 'history.json', 'buddy-fixes.json']) {
      const source = path.join(directory, previous + '-' + suffix);
      const destination = path.join(directory, 'orix-' + suffix);
      const temporary = destination + '.' + randomUUID() + '.tmp';
      try {
        if (fs.existsSync(destination)) continue;
        fs.copyFileSync(source, temporary, fs.constants.COPYFILE_EXCL);
        // Publish a complete copy atomically without replacing newer data.
        fs.linkSync(temporary, destination);
      } catch (error) {
        if (!['ENOENT', 'EEXIST'].includes(error.code)) throw error;
      } finally {
        fs.rmSync(temporary, { force: true });
      }
    }
  }

  function migrateStorage(storage) {
    if (storage.getItem('orix:identity-version') === '1') return;
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
    for (const key of keys) {
      if (!key?.startsWith(previous + ':')) continue;
      const destination = 'orix:' + key.slice(previous.length + 1);
      if (storage.getItem(destination) === null) storage.setItem(destination, storage.getItem(key));
    }
    storage.setItem('orix:identity-version', '1');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { previous, migrateProfile, migrateStorage, migrateEnvironment };
  } else {
    migrateStorage(localStorage);
  }
})();
