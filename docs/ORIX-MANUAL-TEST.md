# ORIX beta manual test procedure

Use this procedure to record checks that automation has not established. The current build and known limits are in [RELEASE.md](RELEASE.md). Record the build version, Windows version, display scaling and pass/fail/blocked for each row; include reproduction steps for failures. Do not include credentials, clipboard history, private messages, hook tokens or screenshots containing personal data in test reports.

Use a disposable Windows account or test machine with a backup of its profile. Install the candidate there and use only a disposable note, text string and file. The Clipboard module reads the system clipboard when enabled; copy a harmless test string before testing it. Do not connect real agent profiles or services in the basic checks. Do not overwrite an existing installation or profile to create a test environment.

| Check | Steps | Expected result |
| --- | --- | --- |
| Navigation | Open Settings and visit Overview, Appearance, Modules and each Settings subsection. Resize the dashboard to its minimum size and scroll each section. | Controls and text remain reachable; the interface is English. |
| Appearance draft | In Settings → General, change Light/Dark/System, then Cancel; change it again, Save, quit and reopen. | Cancel restores the previous choice; Save survives restart. |
| Note | Open Note, enter a unique disposable note, wait for autosave, quit and reopen. | The same note returns. |
| Focus and layer OFF | Start a short Focus timer. Switch the layer OFF in Overview, wait, reopen Settings, then turn the layer ON. | The layer stays hidden while OFF; Settings remains reachable; the timer continues rather than resetting. |
| Clipboard | Enable Clipboard in Modules and save; copy a harmless unique string, open Clipboard and select the entry. Turn Clipboard off and save. | The copied string appears and can be copied back; after disabling, ORIX's list clears and subsequent copies do not appear. Do not report actual private clipboard content. |
| File tray | Add a disposable file to the tray, open it, drag it to a separate disposable destination, and remove its tray entry. | Open and external drag work; removing the entry does not delete the source file. |
| Keyboard | Navigate the dashboard and layer with Tab, Shift+Tab, Enter, Space and Escape; use Ctrl+Alt+T and the documented tool shortcuts while ON and OFF. | Focus is visible, controls have meaningful names and activate correctly, Escape closes the relevant expanded view, and shortcuts do not re-enable the hidden layer. |
| Restart OFF | Turn the layer OFF, quit normally and restart ORIX; open Settings, then turn it ON. | The layer stays OFF across restart until explicitly enabled. |
| Display and assistive technology | Inspect at 100%, 125% and 150% scaling where available; test high contrast, reduced motion and an actual screen reader. | Controls remain usable and named; report unavailable hardware or assistive technology as blocked, not passed. |

Live Claude Code, Codex, Spotify, AI-provider and project-editor checks require suitable dedicated test accounts or profiles. Back up their configuration first and record exactly which versions and workflows were exercised. Their results are separate from the offline checks above. See the [provisional removal guide](ORIX-REMOVAL.md) before removing a test installation; it is not yet validated end to end on a real profile.
