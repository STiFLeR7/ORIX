import { jsonLdFor, metadataFor } from "../../lib/seo";
import SiteFrame from "../docs/SiteFrame";
import styles from "../docs/article.module.css";

export const metadata = metadataFor("/privacy/");

const repo = "https://github.com/STiFLeR7/ORIX";
const contents = [
  ["website", "This website"],
  ["local", "Local app data"],
  ["services", "Connected services"],
  ["retention", "Retention and removal"],
] as const;

export default function PrivacyPage() {
  return (
    <SiteFrame>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdFor("/privacy/") }} />
    <main id="main" className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Privacy</span>
      </nav>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Understand your data</p>
        <h1>ORIX privacy</h1>
        <p className={styles.lead}>ORIX keeps its everyday tools local. Optional connections exchange data with the services you choose.</p>
        <p className={styles.meta}>Reviewed 5 November 2026 · <a className={styles.textLink} href={`${repo}/blob/main/docs/PRIVACY.md`}>Application privacy source</a></p>
      </header>
      <div className={styles.layout}>
        <nav className={styles.contents} aria-label="On this page">
          <strong>On this page</strong>
          {contents.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <div className={styles.sections}>
          <section id="website" aria-labelledby="website-title">
            <h2 id="website-title">This website</h2>
            <p>The ORIX website is a static public site served through Cloudflare. It does not require an ORIX account or ask you to submit personal information. The site currently has no first-party analytics or advertising tracker.</p>
            <p>Cloudflare can process ordinary connection data, such as your IP address, browser information and request details, to deliver and protect the site. Cloudflare&apos;s <a className={styles.textLink} href="https://www.cloudflare.com/privacypolicy/">privacy policy</a> explains its handling. Following a download, GitHub or provider link takes you to that service under its own policies.</p>
          </section>

          <section id="local" aria-labelledby="local-title">
            <h2 id="local-title">Local app data and controls</h2>
            <p>The Windows app stores preferences, notes, file-tray paths and integration configuration in its profile, normally <code>%APPDATA%\ORIX</code>. ChatGPT/Codex runtime data uses a separate directory inside that profile. Connected apps and agent tools may keep their own histories and credentials.</p>
            <p>The Clipboard module is enabled by default. While enabled, ORIX holds up to eight copied text entries in memory; it does not write that history to disk. Disable Clipboard in <strong>Modules</strong> and press <strong>Save</strong> to stop capture and clear ORIX&apos;s history. This does not clear the Windows clipboard.</p>
            <p>Notes and file-tray paths remain until you remove them. Turning the desktop layer OFF hides its interface while enabled tools and integrations continue running. Quit ORIX to stop its background processing.</p>
            <p>Spotify tokens use Electron&apos;s OS-backed storage when encryption is available.</p>
          </section>

          <section id="services" aria-labelledby="services-title">
            <h2 id="services-title">Connected services</h2>
            <p>The AI monitor can read supported local window, accessibility and agent-status information to show session state. Connecting a provider, sending a request, selecting project files or asking an AI to inspect a screenshot can send the content to that provider. Project-agent operations may read or change files in the selected project.</p>
            <ul>
              <li><strong>OpenAI / ChatGPT / Codex:</strong> authentication, prompts, selected context, screenshots and responses may pass through OpenAI services and the bundled or installed Codex runtime. <a className={styles.textLink} href="https://openai.com/policies/privacy-policy/">OpenAI privacy policy</a>.</li>
              <li><strong>Claude / Claude Code:</strong> external applications and agent tools handle their own authentication, conversations and project context. Disable the integration and use provider account controls when needed. <a className={styles.textLink} href="https://www.anthropic.com/legal/privacy">Anthropic privacy policy</a>.</li>
              <li><strong>Spotify:</strong> OAuth uses Spotify Accounts and a local callback at <code>http://127.0.0.1:8888/callback</code>. Playback and device requests go to Spotify&apos;s API. Disconnect in ORIX and revoke access in Spotify if desired. <a className={styles.textLink} href="https://www.spotify.com/legal/privacy-policy/">Spotify privacy policy</a>.</li>
              <li><strong>Weather:</strong> a configured city goes to Open-Meteo geocoding, and its coordinates are used for forecasts. Clear the city and save to stop configured-city requests. <a className={styles.textLink} href="https://open-meteo.com/en/terms">Open-Meteo terms and privacy</a>.</li>
              <li><strong>Calendar:</strong> ORIX fetches the HTTPS calendar URL you supply. The calendar service receives the request; a private URL may itself grant access. Clear the URL and save to stop requests.</li>
            </ul>
            <p>Provider accounts, subscriptions and data policies apply to those services. ORIX&apos;s former account, news and automatic-update service defaults are disabled.</p>
          </section>

          <section id="retention" aria-labelledby="retention-title">
            <h2 id="retention-title">Retention and removal</h2>
            <p>In-memory clipboard history clears when capture is disabled or ORIX quits. Saved notes, tray paths and preferences remain in the profile until removed. Program removal keeps the profile unless you separately delete it; back up any data you need first.</p>
            <p>Use the <a className={styles.textLink} href={`${repo}/blob/main/docs/ORIX-REMOVAL.md`}>manual removal guide</a> to disconnect integrations and remove the app safely. External providers retain their data under their own account policies.</p>
            <div className={styles.callout}>
              <p><strong>Report a concern safely.</strong> Use <a className={styles.textLink} href={`${repo}/issues`}>GitHub Issues</a>, but do not post tokens, private calendar URLs, profile files, hook backups, conversations or personal files.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
    </SiteFrame>
  );
}
