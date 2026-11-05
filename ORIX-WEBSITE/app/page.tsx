import Script from "next/script";
import type { CSSProperties } from "react";
import { release } from "../lib/release";
import { jsonLdFor } from "../lib/seo";

export default function HomePage() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <svg
        className="symbols"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <symbol id="arrow" viewBox="0 0 24 24">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </symbol>
        <symbol id="external" viewBox="0 0 24 24">
          <path d="M7 17 17 7M7 7h10v10" />
        </symbol>
        <symbol id="note" viewBox="0 0 24 24">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9ZM14 3v6h6M8 13h8M8 17h5" />
        </symbol>
        <symbol id="timer" viewBox="0 0 24 24">
          <circle cx="12" cy="14" r="8" />
          <path d="M12 10v4l3 2M9 2h6M12 2v4M18 7l2-2" />
        </symbol>
        <symbol id="clip" viewBox="0 0 24 24">
          <rect x="5" y="5" width="14" height="16" rx="2" />
          <rect x="9" y="2" width="6" height="6" rx="1" />
          <path d="M9 12h6m-6 4h6" />
        </symbol>
        <symbol id="folder" viewBox="0 0 24 24">
          <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM3 9h18" />
        </symbol>
        <symbol id="code" viewBox="0 0 24 24">
          <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />
        </symbol>
        <symbol id="windows" viewBox="0 0 24 24">
          <path d="m3 5 8-1v7H3Zm10-1 8-1v8h-8ZM3 13h8v7l-8-1Zm10 0h8v8l-8-1Z" />
        </symbol>
        <symbol id="menu" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </symbol>
      </svg>
      <header className="topbar">
        <div className="nav wrap">
          <a className="brand-link" href="#overview" aria-label="ORIX home">
            <img
              className="logo"
              src="/brand/orix-lockup-light.svg"
              alt="ORIX"
              width="105"
              height="33"
            />
          </a>
          <nav className="links" id="navigation" aria-label="Main navigation">
            <a href="#tools">Your tools</a>
            <a href="#integrations">Connections</a>
            <a href="#appearance">Your space</a>
            <a href="https://github.com/STiFLeR7/ORIX">GitHub ↗</a>
          </nav>
          <div className="nav-end">
            <button
              className="motion-control"
              id="motion-control"
              type="button"
              aria-label="Pause background animation"
              aria-pressed="false"
              title="Pause background animation"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path className="pause-shape" d="M4 3h4v14H4zm8 0h4v14h-4z" />
                <path className="play-shape" d="M5 2.5 17 10 5 17.5z" />
              </svg>
            </button>
            <a className="btn" href={release.installerUrl}>
              Get ORIX
              <svg className="icon" aria-hidden="true">
                <use href="#arrow" />
              </svg>
            </a>
            <button
              className="menu-button"
              id="menu-toggle"
              aria-label="Open navigation"
              aria-expanded="false"
              aria-controls="navigation"
            >
              <svg className="icon" aria-hidden="true">
                <use href="#menu" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        <section
          className="hero motion-region"
          id="overview"
          aria-labelledby="hero-title"
        >
          <div className="wrap">
            <div className="hero-intro">
              <div className="eyebrow">
                Free &amp; open source · Built for Windows
              </div>
              <h1 className="hero-title" id="hero-title">
                <span>Your desktop.</span>
                <span>Within reach.</span>
              </h1>
              <p>
                A little space for your notes, your focus and your AI workflow.
                Right where you need it.
              </p>
              <div className="actions">
                <a className="btn primary" href={release.installerUrl}>
                  Download for Windows
                  <svg className="icon" aria-hidden="true">
                    <use href="#arrow" />
                  </svg>
                </a>
                <button className="btn" id="try-layer">
                  Try the layer ↓
                </button>
              </div>
            </div>
            <section
              className="hero-stage"
              id="demo"
              aria-labelledby="demo-title"
            >
              <h2 className="sr-only" id="demo-title">
                Try the ORIX desktop layer
              </h2>
              <div className="light-well ambient" aria-hidden="true"></div>
              <div className="metal-orbit ambient" aria-hidden="true"></div>
              <div className="workspace-sheet" aria-hidden="true">
                <img id="hero-dashboard" width="1402" height="953" alt="" />
              </div>
              <div className="sample-chip ambient" aria-hidden="true">
                <svg className="icon">
                  <use href="#timer" />
                </svg>
                <div>
                  Make room for a little focus.
                  <small>ONE THING AT A TIME</small>
                </div>
              </div>
              <div className="notch-anchor">
                <div
                  className="notch-shell"
                  id="notch-shell"
                  data-state="collapsed"
                >
                  <button
                    className="notch-trigger"
                    id="notch-trigger"
                    aria-expanded="false"
                    aria-controls="notch-body"
                  >
                    <img
                      src="/brand/orix-icon.svg"
                      alt=""
                      width="25"
                      height="25"
                    />
                    <span>Open ORIX</span>
                  </button>
                  <div className="notch-body" id="notch-body" hidden>
                    <div className="notch-head">
                      <span>
                        <img
                          src="/brand/orix-icon.svg"
                          alt=""
                          width="24"
                          height="24"
                        />
                        ORIX / DESKTOP LAYER DEMO
                      </span>
                      <button
                        className="round"
                        id="notch-close"
                        aria-label="Collapse layer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="notch-home" data-panel="home">
                      <h3>Everything in reach.</h3>
                      <p>Pick a tool. Make a little room.</p>
                      <div
                        className="notch-tools"
                        role="group"
                        aria-label="Open a sample tool"
                      >
                        <button data-open="note">
                          <svg className="icon" aria-hidden="true">
                            <use href="#note" />
                          </svg>
                          Note
                        </button>
                        <button data-open="focus">
                          <svg className="icon" aria-hidden="true">
                            <use href="#timer" />
                          </svg>
                          Focus
                        </button>
                        <button data-open="clipboard">
                          <svg className="icon" aria-hidden="true">
                            <use href="#clip" />
                          </svg>
                          Clipboard
                        </button>
                        <button data-open="files">
                          <svg className="icon" aria-hidden="true">
                            <use href="#folder" />
                          </svg>
                          Files
                        </button>
                      </div>
                    </div>
                    <div data-panel="note" hidden>
                      <div className="panel-heading">
                        <span>Quick note</span>
                        <button data-back>All tools ↑</button>
                      </div>
                      <label className="sr-only" htmlFor="sample-note">
                        Try editing this sample
                      </label>
                      <textarea id="sample-note" className="sample-note">
                        Good ideas need a little space. Sketch the idea. Keep
                        the good parts close.
                      </textarea>
                      <span className="sample-hint">
                        Sample data · temporary edits stay in this page
                      </span>
                    </div>
                    <div data-panel="focus" hidden>
                      <div className="panel-heading">
                        <span>Focus session</span>
                        <button data-back>All tools ↑</button>
                      </div>
                      <div
                        className="focus-time"
                        id="focus-time"
                        role="timer"
                        aria-label="Focus time remaining"
                      >
                        25:00
                      </div>
                      <div className="focus-actions">
                        <button className="btn primary" id="focus-toggle">
                          Start focus
                        </button>
                        <button className="btn" id="focus-reset">
                          Reset
                        </button>
                      </div>
                      <span
                        className="sample-hint"
                        id="focus-status"
                        role="status"
                      >
                        A 25-minute sample session.
                      </span>
                    </div>
                    <div data-panel="clipboard" hidden>
                      <div className="panel-heading">
                        <span>Clipboard sample</span>
                        <button data-back>All tools ↑</button>
                      </div>
                      <div className="sample-list">
                        <button data-sample-copy="Your desktop, within reach.">
                          Your desktop, within reach.
                        </button>
                        <button data-sample-copy="A thought worth keeping.">
                          A thought worth keeping.
                        </button>
                      </div>
                      <span
                        className="sample-hint"
                        id="copy-status"
                        role="status"
                      >
                        Select text to put it in the sample note. Your clipboard
                        stays separate.
                      </span>
                    </div>
                    <div data-panel="files" hidden>
                      <div className="panel-heading">
                        <span>File tray sample</span>
                        <button data-back>All tools ↑</button>
                      </div>
                      <div className="sample-list">
                        <div>
                          <svg className="icon" aria-hidden="true">
                            <use href="#note" />
                          </svg>
                          ideas.md <small>Sample reference</small>
                        </div>
                        <div>
                          <svg className="icon" aria-hidden="true">
                            <use href="#folder" />
                          </svg>
                          your-next-project <small>Sample folder</small>
                        </div>
                      </div>
                      <span className="sample-hint">
                        Illustrative references. Local files stay separate.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stage-caption">
                <div className="phase-controls">
                  <div role="group" aria-label="Layer opening chapters">
                    <button data-chapter="collapsed" aria-pressed="true">
                      Resting
                    </button>
                    <button data-chapter="home" aria-pressed="false">
                      Tools
                    </button>
                    <button data-chapter="note" aria-pressed="false">
                      Note
                    </button>
                  </div>
                  <input
                    id="opening-progress"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value="0"
                    aria-label="Scrub layer opening"
                    aria-valuetext="Resting phase"
                  />
                </div>
                <button className="replay" id="replay-layer">
                  ↻ Replay opening
                </button>
              </div>
            </section>
            <div className="hero-strip">
              <span>
                <svg className="icon" aria-hidden="true">
                  <use href="#windows" />
                </svg>
                Windows 10 &amp; 11
              </span>
              <span>
                <svg className="icon" aria-hidden="true">
                  <use href="#code" />
                </svg>
                Open source · ISC
              </span>
              <span>Your tools, one interaction away.</span>
            </div>
          </div>
        </section>
        <section
          className="tools light-section section-pad"
          id="tools"
          aria-labelledby="tools-title"
        >
          <div className="wrap">
            <div className="center-head">
              <div className="eyebrow">01 / Everyday essentials</div>
              <h2 id="tools-title">
                Small things.
                <br />A little closer.
              </h2>
              <p className="subtle">
                Catch a thought. Find that copied text. Give one thing your full
                attention.
              </p>
            </div>
            <div className="tour-track" id="tour-track">
              <div className="tour-stage">
                <div>
                  <div className="eyebrow">A little walkthrough</div>
                  <div
                    className="tour-steps"
                    role="group"
                    aria-label="Everyday story chapters"
                  >
                    <button
                      className="tour-step"
                      data-tour="note"
                      aria-pressed="true"
                      aria-controls="tool-detail"
                    >
                      <span className="tour-number">01</span>
                      <span>
                        <b>Capture a thought</b>
                        <small>Give the idea somewhere to land.</small>
                      </span>
                    </button>
                    <button
                      className="tour-step"
                      data-tour="focus"
                      aria-pressed="false"
                      aria-controls="tool-detail"
                    >
                      <span className="tour-number">02</span>
                      <span>
                        <b>Make room to focus</b>
                        <small>Bring one task to the foreground.</small>
                      </span>
                    </button>
                    <button
                      className="tour-step"
                      data-tour="clipboard"
                      aria-pressed="false"
                      aria-controls="tool-detail"
                    >
                      <span className="tour-number">03</span>
                      <span>
                        <b>Find the text again</b>
                        <small>Keep a useful fragment close.</small>
                      </span>
                    </button>
                    <button
                      className="tour-step"
                      data-tour="files"
                      aria-pressed="false"
                      aria-controls="tool-detail"
                    >
                      <span className="tour-number">04</span>
                      <span>
                        <b>Bring files along</b>
                        <small>Return to your references quickly.</small>
                      </span>
                    </button>
                  </div>
                  <span className="tour-meter" aria-hidden="true">
                    <i id="tour-progress"></i>
                  </span>
                </div>
                <div className="tour-visual">
                  <div
                    className="tool-arc visual-reveal"
                    role="group"
                    aria-label="Explore everyday tools"
                  >
                    <button
                      className="tool-tile"
                      data-tool="note"
                      aria-pressed="true"
                      aria-controls="tool-detail"
                      style={{ "--i": "0" } as CSSProperties}
                    >
                      <svg className="icon" aria-hidden="true">
                        <use href="#note" />
                      </svg>
                      Notes
                    </button>
                    <button
                      className="tool-tile"
                      data-tool="focus"
                      aria-pressed="false"
                      aria-controls="tool-detail"
                      style={{ "--i": "1" } as CSSProperties}
                    >
                      <svg className="icon" aria-hidden="true">
                        <use href="#timer" />
                      </svg>
                      Focus
                    </button>
                    <button
                      className="tool-tile"
                      data-tool="clipboard"
                      aria-pressed="false"
                      aria-controls="tool-detail"
                      style={{ "--i": "2" } as CSSProperties}
                    >
                      <svg className="icon" aria-hidden="true">
                        <use href="#clip" />
                      </svg>
                      Clipboard
                    </button>
                    <button
                      className="tool-tile"
                      data-tool="files"
                      aria-pressed="false"
                      aria-controls="tool-detail"
                      style={{ "--i": "3" } as CSSProperties}
                    >
                      <svg className="icon" aria-hidden="true">
                        <use href="#folder" />
                      </svg>
                      File tray
                    </button>
                  </div>
                  <div className="tool-detail" id="tool-detail">
                    <div aria-live="polite">
                      <h3 id="tool-title">Keep a thought close.</h3>
                      <p id="tool-description">
                        A nearby place to write something down and pick it up
                        again.
                      </p>
                      <button
                        className="text-link"
                        id="open-selected-tool"
                        style={{
                          border: "0",
                          background: "transparent",
                          padding: "0",
                        }}
                      >
                        Try Notes in the layer ↑
                      </button>
                    </div>
                    <div className="tool-sketch" id="tool-sketch">
                      <small>QUICK NOTE / SAMPLE</small>
                      <strong>Good ideas need somewhere to land.</strong>
                      <span>Start here. Come back to it.</span>
                    </div>
                  </div>
                  <div className="tour-controls">
                    <span id="tour-hint">
                      Choose a chapter or play the story.
                    </span>
                    <button className="tour-play" id="tour-play" hidden>
                      Play tool story
                    </button>
                  </div>
                  <span
                    className="sr-only"
                    role="status"
                    id="tour-status"
                  ></span>
                </div>
              </div>
            </div>
            <p className="section-foot">
              Clipboard capture is enabled by default in the app. Up to eight
              text entries are held in memory.
              <a className="text-link" href="#faq">
                See data controls ↓
              </a>
            </p>
          </div>
        </section>
        <section
          className="integrations section-pad motion-region"
          id="integrations"
          aria-labelledby="integrations-title"
        >
          <div className="wrap">
            <div className="center-head">
              <div className="eyebrow ice">02 / In good company</div>
              <h2 id="integrations-title">
                Your workflow.
                <br />
                <span className="ice">More in sync.</span>
              </h2>
              <p className="subtle">
                Explore the connections that make ORIX part of your day.
              </p>
            </div>
            <div
              className="glass-grid visual-reveal"
              id="glass-grid"
              role="group"
              aria-label="Choose an integration"
              style={{ "--selected": "0" } as CSSProperties}
            >
              <button
                className="glass-tile"
                data-integration="claude"
                aria-pressed="true"
                aria-controls="connection-detail"
              >
                <img
                  src="/providers/claudecode.svg"
                  width="47"
                  height="47"
                  alt=""
                />
                Claude Code
              </button>
              <button
                className="glass-tile"
                data-integration="codex"
                aria-pressed="false"
                aria-controls="connection-detail"
              >
                <img
                  src="/providers/codex_dark.svg"
                  width="47"
                  height="47"
                  alt=""
                />
                Codex
              </button>
              <button
                className="glass-tile"
                data-integration="chatgpt"
                aria-pressed="false"
                aria-controls="connection-detail"
              >
                <img
                  src="/providers/openai_dark.svg"
                  width="47"
                  height="47"
                  alt=""
                />
                ChatGPT
              </button>
              <button
                className="glass-tile"
                data-integration="spotify"
                aria-pressed="false"
                aria-controls="connection-detail"
              >
                <img
                  src="/providers/spotify.svg"
                  width="47"
                  height="47"
                  alt=""
                />
                Spotify
              </button>
            </div>
            <div className="connection-detail" id="connection-detail">
              <div className="connection-copy" aria-live="polite">
                <h3 id="integration-name">Claude Code</h3>
                <p id="integration-description">
                  Keep supported Claude Code session information in the layer.
                  See when your work is ready for attention, with the local
                  integration configured in ORIX.
                </p>
                <a className="text-link" href="/docs/">
                  Explore connection setup
                  <svg className="icon" aria-hidden="true">
                    <use href="#external" />
                  </svg>
                </a>
              </div>
              <div className="connection-preview" id="connection-preview">
                <div className="preview-bar">
                  <span>CLAUDE CODE / SAMPLE SESSION</span>
                  <span>ILLUSTRATIVE</span>
                </div>
                <div className="workflow-row">
                  <span>your-next-idea</span>
                  <span>Ready for review</span>
                </div>
                <div className="workflow-row">
                  <span>Changes prepared</span>
                  <span>Session complete</span>
                </div>
                <button className="sample-action" id="connection-action">
                  Run sample session
                </button>
                <span
                  className="sample-hint"
                  id="connection-status"
                  role="status"
                >
                  Prepared sample data · no provider connection
                </span>
              </div>
            </div>
            <p className="section-foot" style={{ color: "var(--muted)" }}>
              Local monitoring and provider requests use individual setup paths.
              Connected services apply their own accounts and terms.
            </p>
            <div
              className="signal-route"
              id="signal-route"
              data-state="idle"
              aria-label="Illustrative connection path"
            >
              <svg
                viewBox="0 0 1000 40"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M80 20H920" pathLength="100" />
                <path
                  className="signal-packet ambient"
                  d="M80 20H920"
                  pathLength="100"
                />
              </svg>
              <span className="signal-node">Your work</span>
              <span className="signal-node processor">
                <img src="/brand/orix-icon.svg" alt="ORIX" />
              </span>
              <span className="signal-node" id="signal-destination">
                Claude Code
              </span>
            </div>
          </div>
        </section>
        <section
          className="appearance section-pad"
          id="appearance"
          aria-labelledby="appearance-title"
        >
          <div className="wrap">
            <div className="appearance-head">
              <div>
                <div className="eyebrow">03 / Your space, your way</div>
                <h2 id="appearance-title">
                  A familiar desktop.
                  <br />A different feeling.
                </h2>
              </div>
              <p>
                Actual ORIX beta views. Explore the details, compare Light and
                Dark, and make room for your way of working.
              </p>
            </div>
            <div className="appearance-controls">
              <div
                className="segmented"
                role="group"
                aria-label="Dashboard appearance"
              >
                <button data-theme="dark" aria-pressed="true">
                  Dark
                </button>
                <button data-theme="light" aria-pressed="false">
                  Light
                </button>
                <button data-theme="system" aria-pressed="false">
                  System
                </button>
              </div>
              <div className="gallery-controls">
                <button
                  className="round"
                  id="gallery-prev"
                  aria-label="Previous dashboard view"
                >
                  ←
                </button>
                <span id="gallery-position">01 / 03</span>
                <button
                  className="round"
                  id="gallery-next"
                  aria-label="Next dashboard view"
                >
                  →
                </button>
              </div>
            </div>
            <div className="gallery-stage visual-reveal">
              <figure style={{ margin: "0" }}>
                <div
                  className="gallery-frame"
                  id="gallery-frame"
                  data-view="overview"
                >
                  <img
                    id="dashboard-image"
                    src="/images/dashboard-dark.png"
                    data-light="/images/dashboard-light.png"
                    width="1402"
                    height="953"
                    loading="lazy"
                    alt="Actual ORIX beta Overview dashboard in Dark mode"
                  />
                  <button className="zoom-button" id="zoom-capture">
                    Enlarge dashboard ↗
                  </button>
                </div>
                <figcaption className="gallery-caption">
                  <span id="capture-caption">
                    ACTUAL ORIX BETA / DARK / OVERVIEW
                  </span>
                  <span>Isolated profile · prepared app capture</span>
                </figcaption>
              </figure>
            </div>
            <div
              className="gallery-dots"
              role="group"
              aria-label="Dashboard detail"
            >
              <button data-gallery="overview" aria-pressed="true">
                Overview
              </button>
              <button data-gallery="controls" aria-pressed="false">
                Layer controls
              </button>
              <button data-gallery="connections" aria-pressed="false">
                Connections
              </button>
            </div>
            <div className="visibility">
              <span>Show the sample desktop layer</span>
              <button
                className="switch"
                id="layer-switch"
                role="switch"
                aria-checked="true"
                aria-label="Show sample desktop layer"
              >
                <span></span>
              </button>
              <span id="visibility-status" role="status">
                Hiding the layer leaves enabled tools running.
              </span>
            </div>
            <p className="section-foot" style={{ color: "#334c70" }}>
              Choose your app theme in ORIX Settings. These captures show beta
              Overview states; the Light capture includes an unsaved-preferences
              bar.
            </p>
          </div>
        </section>
        <section
          className="source section-pad motion-region"
          id="open-source"
          aria-labelledby="source-title"
        >
          <div className="wrap">
            <div className="source-grid">
              <div className="source-copy">
                <div className="eyebrow ice">04 / Open by design</div>
                <h2 id="source-title">
                  Built in the open.
                  <br />
                  Yours to make.
                </h2>
                <p>
                  Explore the code. Follow development. Shape what comes next.
                  ORIX is free and open source under the ISC license.
                </p>
                <div className="actions">
                  <a
                    className="btn primary"
                    href="https://github.com/STiFLeR7/ORIX"
                  >
                    <svg className="icon" aria-hidden="true">
                      <use href="#code" />
                    </svg>
                    Explore the source
                  </a>
                  <a
                    className="text-link"
                    href="https://github.com/STiFLeR7/ORIX/blob/main/docs/CONTRIBUTING.md"
                  >
                    Contribute ↗
                  </a>
                </div>
              </div>
              <div className="code-portal visual-reveal" aria-hidden="true">
                <div className="code-ribbon">
                  <pre className="ambient">
                    ORIX / OPEN SOURCE / WINDOWS / ISC Permission to use, copy,
                    modify, and/or distribute this software for any purpose with
                    or without fee is hereby granted, provided that the above
                    copyright notice and this permission notice appear in all
                    copies. ORIX / OPEN SOURCE / WINDOWS / ISC Permission to
                    use, copy, modify, and/or distribute this software for any
                    purpose with or without fee is hereby granted, provided that
                    the above copyright notice and this permission notice appear
                    in all copies.
                  </pre>
                </div>
                <img
                  className="source-symbol ambient"
                  src="/brand/orix-icon.svg"
                  width="140"
                  height="140"
                  alt=""
                />
              </div>
            </div>
            <div className="source-facts">
              <span>Local tool data in your app profile.</span>
              <span>Optional providers use their own services.</span>
              <a href="/privacy/">Understand your data ↗</a>
            </div>
          </div>
        </section>
        <section
          className="release motion-region"
          id="get-orix"
          aria-labelledby="get-title"
        >
          <canvas className="terrain" id="terrain" aria-hidden="true"></canvas>
          <div className="wrap">
            <div className="eyebrow">05 / Make a little room</div>
            <h2 id="get-title">
              A new layer.
              <br />A familiar desktop.
            </h2>
            <p>
              Bring your tools closer to the work you care about. Explore ORIX
              for Windows.
            </p>
            <div className="actions">
              <a className="btn primary" href={release.installerUrl}>
                <svg className="icon" aria-hidden="true">
                  <use href="#windows" />
                </svg>
                Download for Windows
                <svg className="icon" aria-hidden="true">
                  <use href="#external" />
                </svg>
              </a>
              <a className="btn" href="https://github.com/STiFLeR7/ORIX">
                View source ↗
              </a>
            </div>
            <small>
              v{release.version} · {release.requirements} ·{" "}
              {release.isSigned ? "Signed" : "Unsigned beta"}
              <br />
              Review
              <a href={release.releaseUrl}>release notes and checksums</a>, and
              the code signing policy.
            </small>
          </div>
        </section>
        <section className="faq" id="faq" aria-labelledby="faq-title">
          <div className="wrap faq-grid">
            <div className="faq-head">
              <div className="eyebrow">06 / The practical things</div>
              <h2 id="faq-title">
                A few things
                <br />
                before you begin.
              </h2>
              <p>
                Get to know your desktop layer, its tools and its connections.
              </p>
              <a className="text-link" href="/docs/">
                Read the documentation ↗
              </a>
            </div>
            <div>
              <details open>
                <summary>What does ORIX do?</summary>
                <p>
                  ORIX is a free, open-source Windows desktop layer for
                  supported AI session status, notes, clipboard history, focus
                  tools, file references and optional Spotify controls.
                </p>
              </details>
              <details>
                <summary>Which Windows versions can I use?</summary>
                <p>
                  The current beta supplies Windows 10/11 x64 artifacts. Check
                  the selected release for its exact requirements.
                </p>
              </details>
              <details>
                <summary>Is ORIX completely free?</summary>
                <p>
                  ORIX is free and open source under ISC. Connected AI and music
                  services apply their own accounts, subscriptions and terms.
                </p>
              </details>
              <details>
                <summary>Where can I inspect the source?</summary>
                <p>
                  The
                  <a href="https://github.com/STiFLeR7/ORIX">
                    public ORIX repository
                  </a>
                  contains the source, license, contribution guidance and
                  release records.
                </p>
              </details>
              <details>
                <summary>Do integrations need an account?</summary>
                <p>
                  Setup depends on the selected connection. Core local tools
                  work independently. Optional providers and Spotify use their
                  own authentication and service requirements.
                </p>
              </details>
              <details>
                <summary>What happens to clipboard history?</summary>
                <p>
                  Clipboard capture is enabled by default and retains up to
                  eight text entries in memory. Disable Clipboard in Modules and
                  save to stop capture and clear ORIX's history. The history
                  also clears when the process ends. The Windows clipboard is
                  managed separately.
                </p>
              </details>
              <details>
                <summary>What happens when I hide the layer?</summary>
                <p>
                  Enabled tools and integrations keep running. Quit ORIX to stop
                  its running background processing. The website's visibility
                  control illustrates this behavior using sample state.
                </p>
              </details>
              <details>
                <summary>How do updates and removal work?</summary>
                <p>
                  Updates are manual in the current application. Follow your
                  release's instructions and the
                  <a href="https://github.com/STiFLeR7/ORIX/blob/main/docs/ORIX-REMOVAL.md">
                    removal guide
                  </a>
                  for the program, hooks and retained profile data.
                </p>
              </details>
              <details>
                <summary>Is the Windows beta signed?</summary>
                <p>
                  The current Windows beta is{" "}
                  {release.isSigned ? "signed" : "unsigned"}.{" "}
                  {release.isSigned ? "" : "Signing setup is pending."}
                  Review release checksums, known limitations and the
                  <a href="https://github.com/STiFLeR7/ORIX/blob/main/docs/CODE-SIGNING.md">
                    code signing policy
                  </a>
                  .
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">
          <div className="footer-top">
            <a href="#overview" aria-label="Back to ORIX home">
              <img
                className="logo"
                src="/brand/orix-lockup-light.svg"
                alt="ORIX"
                width="105"
                height="33"
              />
            </a>
            <nav className="footer-links" aria-label="Footer">
              <a href="/docs/">Documentation</a>
              <a href="/privacy/">Privacy</a>
              <a href="https://github.com/STiFLeR7/ORIX/blob/main/THIRD_PARTY_NOTICES.md">
                Licenses
              </a>
              <a href="https://github.com/STiFLeR7/ORIX/releases">Releases</a>
              <a href="https://github.com/STiFLeR7/ORIX/issues">
                Report an issue ↗
              </a>
            </nav>
          </div>
        </div>
      </footer>
      <dialog id="capture-dialog" aria-labelledby="dialog-title">
        <div className="dialog-top">
          <span id="dialog-title">Actual ORIX beta dashboard</span>
          <form method="dialog">
            <button className="round" aria-label="Close dashboard image">
              ×
            </button>
          </form>
        </div>
        <img
          id="dialog-image"
          width="1402"
          height="953"
          alt="Full actual ORIX beta dashboard capture"
        />
      </dialog>

      <Script src="/site-interactions.js" strategy="afterInteractive" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdFor("/") }}
      />
    </>
  );
}
