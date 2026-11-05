import { release } from "../../lib/release";
import { jsonLdFor, metadataFor } from "../../lib/seo";
import SiteFrame from "./SiteFrame";
import styles from "./article.module.css";

export const metadata = metadataFor("/docs/");

const repo = "https://github.com/STiFLeR7/ORIX";
const contents = [
  ["install", "Install"],
  ["tools", "Everyday tools"],
  ["connections", "Connections"],
  ["appearance", "Appearance and shortcuts"],
  ["updates", "Updates"],
  ["help", "Troubleshooting"],
  ["remove", "Removal"],
] as const;

export default function DocumentationPage() {
  return (
    <SiteFrame>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdFor("/docs/") }} />
    <main id="main" className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Documentation</span>
      </nav>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Get started with ORIX</p>
        <h1>ORIX documentation</h1>
        <p className={styles.lead}>
          Install the Windows beta, choose the tools you use, and bring the desktop layer into your workflow.
        </p>
        <p className={styles.meta}>Current public release: {release.version} · Windows 10/11 x64 · English interface</p>
      </header>
      <div className={styles.layout}>
        <nav className={styles.contents} aria-label="On this page">
          <strong>On this page</strong>
          {contents.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <div className={styles.sections}>
          <section id="install" aria-labelledby="install-title">
            <h2 id="install-title">Install ORIX</h2>
            <ol>
              <li>Download the current Windows installer from the <a className={styles.textLink} href={release.releaseUrl}>verified GitHub release</a>.</li>
              <li>Open the installer on Windows 10 or 11 (x64). ORIX installs for the current user, normally under <code>%LOCALAPPDATA%\Programs\ORIX</code>.</li>
              <li>Open <strong>ORIX Settings</strong> from the Start menu or tray, then choose the tools you want under <strong>Modules</strong>.</li>
            </ol>
            {!release.isSigned && <div className={styles.callout}>
              <p><strong>Unsigned beta.</strong> The current installer is not code signed. Windows may show an unknown-publisher warning. Check the file against the <a className={styles.textLink} href={release.releaseUrl}>release assets and checksums</a> before installing.</p>
              <p>Installer SHA-256: <code>{release.sha256}</code></p>
            </div>}
            <div className={styles.linkRow}>
              <a className={styles.button} href={release.installerUrl}>Download for Windows</a>
              <a className={styles.button} href={release.releaseUrl}>Release notes and checksums</a>
            </div>
          </section>

          <section id="tools" aria-labelledby="tools-title">
            <h2 id="tools-title">Everyday tools</h2>
            <p>Enable or disable tools in <strong>ORIX Settings → Modules</strong> and press <strong>Save</strong>. Hiding the desktop layer does not stop enabled tools.</p>
            <ul>
              <li><strong>Notes:</strong> write and return to quick notes from the desktop layer. Notes are saved in the ORIX profile.</li>
              <li><strong>Focus:</strong> set a timer and follow its progress while you work.</li>
              <li><strong>Clipboard:</strong> while enabled, ORIX keeps up to eight recent copied text entries in memory. It is enabled by default. Disable it in Modules and save to stop capture and clear ORIX&apos;s in-memory history; the Windows clipboard is separate.</li>
              <li><strong>File tray:</strong> keep references to selected files within reach.</li>
            </ul>
          </section>

          <section id="connections" aria-labelledby="connections-title">
            <h2 id="connections-title">Connections</h2>
            <p>Configure optional services in <strong>ORIX Settings → Connections</strong>. Core notes, focus, clipboard and file-tray tools do not need a connected account.</p>
            <h3>AI work</h3>
            <p>Supported Claude Code and Codex integrations can show local session status. A readable conversation window or agent-status source is needed for applicable monitoring; provider interface changes may affect recognition. ChatGPT requests are a separate provider connection and require its own sign-in or access. Review any Codex hook changes through <code>/hooks</code>.</p>
            <p>Prompts, selected project context and screenshots you explicitly ask an AI to inspect may leave your computer through the selected provider. Provider terms and account charges apply.</p>
            <h3>Spotify</h3>
            <p>Spotify controls act on an active Spotify device. Connection uses Spotify OAuth. Direct sign-in requires a public Spotify client ID configured for ORIX; your Spotify account and its terms still apply. You can disconnect in ORIX and revoke access in Spotify.</p>
            <p>See <a className={styles.textLink} href="/privacy/">how connected services handle data</a> for the complete list of network destinations.</p>
          </section>

          <section id="appearance" aria-labelledby="appearance-title">
            <h2 id="appearance-title">Appearance and shortcuts</h2>
            <p>Choose <strong>Light</strong>, <strong>Dark</strong> or <strong>System</strong> in <strong>Settings → General</strong>. Changes preview in the dashboard; <strong>Save</strong> commits them and <strong>Cancel</strong> restores saved choices. Appearance controls status colors and motion.</p>
            <p>The switch on <strong>Overview</strong> hides the desktop layer when OFF; enabled tools and integrations keep running. Turn it ON in Overview or choose <strong>Show desktop layer</strong> from the tray.</p>
            <ul>
              <li><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd> shows the layer while it is ON.</li>
              <li><kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>1–6</kbd> selects an enabled tool while the layer is ON.</li>
            </ul>
            <p>Open Settings from the island, tray or Start menu. Quit from the island power button or the tray menu.</p>
          </section>

          <section id="updates" aria-labelledby="updates-title">
            <h2 id="updates-title">Updates are manual</h2>
            <p>ORIX does not automatically download or install updates. Check <a className={styles.textLink} href={`${repo}/releases`}>GitHub Releases</a>, read the notes and checksums for the version you choose, quit ORIX, then install the reviewed full package. Reopen ORIX and check its version and saved settings.</p>
            <p>The <a className={styles.textLink} href={`${repo}/blob/main/UPDATES.md`}>update guide</a> contains the maintained procedure.</p>
          </section>

          <section id="help" aria-labelledby="help-title">
            <h2 id="help-title">Troubleshooting</h2>
            <ul>
              <li><strong>Layer hidden:</strong> check the Overview switch or choose <strong>Show desktop layer</strong> in the tray.</li>
              <li><strong>Connection status absent:</strong> confirm the integration is enabled, its provider is available and the applicable conversation window is open and readable.</li>
              <li><strong>Spotify not responding:</strong> check that a Spotify device is active and the account is connected.</li>
              <li><strong>Install or upgrade issue:</strong> verify the release version and checksum, quit any running ORIX process and consult the release notes.</li>
            </ul>
            <p>Report reproducible issues with your ORIX version and steps at <a className={styles.textLink} href={`${repo}/issues`}>GitHub Issues</a>. Do not post tokens, private URLs, conversations or personal files.</p>
          </section>

          <section id="remove" aria-labelledby="remove-title">
            <h2 id="remove-title">Remove ORIX</h2>
            <p>The current beta has no identified application uninstaller. Follow the <a className={styles.textLink} href={`${repo}/blob/main/docs/ORIX-REMOVAL.md`}>maintained manual removal guide</a>, which covers disconnecting hooks, quitting the app, checking the installation folder and shortcuts, and retaining or deleting the separate profile deliberately.</p>
            <p>Your notes and settings normally remain under <code>%APPDATA%\ORIX</code> after program removal. Back up what you need before removing profile data. Default-profile cleanup has not been fully verified, so follow the guide rather than deleting folders by guesswork.</p>
          </section>
        </div>
      </div>
    </main>
    </SiteFrame>
  );
}
