# ORIX open-source foundation

User decisions: the recovered application becomes ORIX, fully free and open source; replace Robo with the neutral desktop-layer direction in the supplied reference. Preserve working core desktop tools. A larger dashboard workflow redesign is a later phase.

Visual direction: dark navy (#0f171f), slate layers (#21313d), white typography, green accent (#00c48a). Product copy: ORIX; Desktop layer; Everything in reach.; A smarter interaction layer.; Your desktop. Reimagined.; Your operating system, within reach.

Release requirements: retain the manifest's ISC license and add full text/third-party attribution; patch reported Electron/Undici advisories without a major-version jump; permanently unlock feature packs; remove the original remote update trust/publishing/news/account service defaults. Spotify may remain a direct optional integration using a user-supplied public client ID. No legacy service or account is required for the desktop tools.

ORIX must use separate application IDs, data/install paths, and local hook identity so it cannot silently replace TwoCode or remove TwoCode's agent hooks. Keep internal IPC names and filenames where changing them adds migration risk. Do not edit recovered/ or publish anything. Do not create/read .env files or expose secrets.

Validation: regression tests for release behavior and isolation; npm audit; syntax; full node test suite; patched-runtime ORIX startup and focused Computer Use checks; local package/installer build if feasible. Document live-service and OS checks that remain unverified. Update Waypoint last.
