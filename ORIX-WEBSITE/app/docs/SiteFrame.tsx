import type { ReactNode } from "react";
import { release } from "../../lib/release";
import styles from "./article.module.css";

export default function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <a className={styles.skip} href="#main">Skip to content</a>
      <header className={styles.siteHeader}>
        <div className={styles.siteHeaderInner}>
          <a className={styles.brand} href="/" aria-label="ORIX home">
            <img src="/brand/orix-lockup-light.svg" alt="ORIX" width="105" height="33" />
          </a>
          <nav className={styles.siteNav} aria-label="Main navigation">
            <a href="/#tools">Features</a>
            <a href="/docs/">Documentation</a>
            <a href="/privacy/">Privacy</a>
          </nav>
          <a className={styles.headerAction} href={release.installerUrl}>Get ORIX <span aria-hidden="true">↗</span></a>
        </div>
      </header>
      {children}
      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterInner}>
          <span>ORIX</span>
          <nav aria-label="Footer navigation">
            <a href="/docs/">Documentation</a>
            <a href="/privacy/">Privacy</a>
            <a href="https://github.com/STiFLeR7/ORIX">Source code</a>
            <a href={release.releaseUrl}>Releases</a>
            <a href="https://github.com/STiFLeR7/ORIX/blob/main/THIRD_PARTY_NOTICES.md">Licenses</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
