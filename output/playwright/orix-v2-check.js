async (page) => {
  const check = (value, message) => {
    if (!value) throw new Error(message);
  };
  await page.goto("http://127.0.0.1:43870/index.html");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("button", { name: "Try the layer ↓", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Collapse layer", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      Math.abs(
        document.getElementById("notch-shell").getBoundingClientRect().width -
          164,
      ) < 1,
  );
  await page.screenshot({
    path: "output/playwright/orix-v2-motion-01-collapsed.png",
  });
  await page.getByRole("button", { name: "Open ORIX", exact: true }).click();
  await page.waitForTimeout(110);
  const intermediate = await page
    .locator("#notch-shell")
    .evaluate((e) => e.getBoundingClientRect().width);
  check(
    intermediate > 164 && intermediate < 400,
    "Notch has a genuine intermediate width",
  );
  await page.screenshot({
    path: "output/playwright/orix-v2-motion-02-expanding.png",
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document.getElementById("notch-shell").getBoundingClientRect().width -
          400,
      ) < 1,
  );
  await page.waitForTimeout(450);
  await page.screenshot({
    path: "output/playwright/orix-v2-motion-03-expanded.png",
  });
  const chapters = page.getByRole("group", {
    name: "Layer opening chapters",
    exact: true,
  });
  await chapters.getByRole("button", { name: "Resting", exact: true }).click();
  await page.waitForFunction(
    () => document.getElementById("notch-shell").dataset.state === "collapsed",
  );
  const scrubber = page.getByRole("slider", {
    name: "Scrub layer opening",
    exact: true,
  });
  await scrubber.press("Home");
  await scrubber.press("ArrowRight");
  check(
    (await scrubber.inputValue()) === "1",
    "Scrubber preserves keyboard progress",
  );
  await scrubber.press("End");
  check(
    (await page.locator("#notch-shell").getAttribute("data-state")) === "note",
    "Scrubber reaches Note chapter",
  );
  await chapters.getByRole("button", { name: "Tools", exact: true }).click();
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(80);
  const handoff = await page
    .locator("#overview")
    .evaluate((e) => e.style.getPropertyValue("--handoff"));
  await page.evaluate(() => scrollTo({ top: 220, behavior: "instant" }));
  await page.waitForTimeout(80);
  check(
    handoff !==
      (await page
        .locator("#overview")
        .evaluate((e) => e.style.getPropertyValue("--handoff"))),
    "Native scroll drives the hero handoff",
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  const before = await page
    .locator(".metal-orbit")
    .evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(250);
  check(
    before !==
      (await page
        .locator(".metal-orbit")
        .evaluate((e) => getComputedStyle(e).transform)),
    "Orbit visibly progresses",
  );
  await page.evaluate(() => {
    window.notchAuditStates = [];
    window.notchAuditObserver = new MutationObserver(() =>
      window.notchAuditStates.push(
        document.getElementById("notch-shell").dataset.state,
      ),
    );
    window.notchAuditObserver.observe(document.getElementById("notch-shell"), {
      attributes: true,
      attributeFilter: ["data-state"],
    });
  });
  await page
    .getByRole("button", { name: "↻ Replay opening", exact: true })
    .click();
  await page.waitForTimeout(3100);
  const sequence = await page.evaluate(() => {
    window.notchAuditObserver.disconnect();
    return window.notchAuditStates;
  });
  check(
    sequence.join(",") === "collapsed,home,note,home",
    "Replay shows collapsed → home → note → home",
  );
  await page
    .getByRole("group", { name: "Open a sample tool", exact: true })
    .getByRole("button", { name: "Focus", exact: true })
    .click();
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await page.waitForFunction(
    () => document.getElementById("focus-time").textContent !== "25:00",
  );
  await page.getByRole("button", { name: "Pause focus", exact: true }).click();
  const paused = await page.locator("#focus-time").textContent();
  await page.waitForTimeout(1100);
  check(
    paused === (await page.locator("#focus-time").textContent()),
    "Timer pauses",
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  check(
    (await page.locator("#focus-time").textContent()) === "25:00",
    "Timer resets",
  );
  await page.getByRole("button", { name: "All tools ↑", exact: true }).click();
  await page
    .getByRole("group", { name: "Open a sample tool", exact: true })
    .getByRole("button", { name: "Clipboard", exact: true })
    .click();
  await page
    .getByRole("button", { name: "A thought worth keeping.", exact: true })
    .click();
  check(
    (await page.locator("#sample-note").inputValue()) ===
      "A thought worth keeping.",
    "Clipboard sample updates page note",
  );
  await page
    .getByRole("group", { name: "Explore everyday tools", exact: true })
    .getByRole("button", { name: "File tray", exact: true })
    .click();
  check(
    (await page.locator("#tool-title").textContent()).includes("files"),
    "Tool arc selects relevant detail",
  );
  await page
    .getByRole("button", { name: "Try File tray in the layer ↑", exact: true })
    .click();
  check(
    (await page.locator("#notch-shell").getAttribute("data-state")) === "files",
    "Tool arc opens matching layer",
  );
  await page.getByRole("button", { name: "Spotify", exact: true }).click();
  check(
    await page.locator(".album").isVisible(),
    "Spotify has distinct playback visual",
  );
  await page
    .getByRole("button", { name: "Play visual preview", exact: true })
    .click();
  check(
    await page
      .locator("#connection-preview")
      .evaluate((e) => e.classList.contains("playing")),
    "Spotify visualization starts",
  );
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".equalizer i"))
        .animationPlayState === "paused",
  );
  await page.locator("#integrations").scrollIntoViewIfNeeded();
  await page
    .getByRole("button", { name: "Pause visual preview", exact: true })
    .click();
  await page.getByRole("button", { name: "ChatGPT", exact: true }).click();
  await page
    .getByRole("button", { name: "Show sample response", exact: true })
    .click();
  check(
    await page.locator("#sample-reply").isVisible(),
    "Prepared response interaction",
  );
  await page.getByRole("button", { name: "Codex", exact: true }).click();
  await page
    .getByRole("button", { name: "Run sample session", exact: true })
    .click();
  await page.waitForFunction(() =>
    document
      .getElementById("connection-status")
      .textContent.includes("Sample complete"),
  );
  await page.getByRole("button", { name: "Claude Code", exact: true }).click();
  const darkSource = await page.locator("#dashboard-image").getAttribute("src");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  check(
    (await page.locator("#dashboard-image").getAttribute("src")) !== darkSource,
    "Actual Light capture replaces actual Dark capture",
  );
  await page
    .getByRole("button", { name: "Next dashboard view", exact: true })
    .click();
  check(
    (await page.locator("#gallery-frame").getAttribute("data-view")) ===
      "controls",
    "Gallery next",
  );
  await page
    .getByRole("button", { name: "Previous dashboard view", exact: true })
    .click();
  check(
    (await page.locator("#gallery-frame").getAttribute("data-view")) ===
      "overview",
    "Gallery previous",
  );
  await page
    .getByRole("button", { name: "Enlarge dashboard ↗", exact: true })
    .click();
  check(await page.getByRole("dialog").isVisible(), "Image dialog");
  await page.keyboard.press("Escape");
  check(!(await page.getByRole("dialog").isVisible()), "Dialog Escape closes");
  check(
    await page
      .locator("#zoom-capture")
      .evaluate((e) => e === document.activeElement),
    "Dialog restores focus",
  );
  await page.getByRole("button", { name: "System", exact: true }).click();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(() =>
    document.getElementById("capture-caption").textContent.includes("/ DARK /"),
  );
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForFunction(() =>
    document
      .getElementById("capture-caption")
      .textContent.includes("/ LIGHT /"),
  );
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page
    .getByRole("switch", { name: "Show sample desktop layer", exact: true })
    .click();
  check(
    await page.locator(".notch-anchor").evaluate((e) => e.hidden),
    "Visibility hides actual sample container",
  );
  await page
    .getByRole("switch", { name: "Show sample desktop layer", exact: true })
    .click();
  await page.locator("#get-orix").scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  const terrainOne = await page
    .locator("#terrain")
    .evaluate((e) => e.toDataURL());
  await page.waitForTimeout(200);
  check(
    terrainOne !==
      (await page.locator("#terrain").evaluate((e) => e.toDataURL())),
    "Terrain visibly changes over time",
  );
  await page.getByRole("button", { name: "Motion on", exact: true }).click();
  const stopped = await page.locator("#terrain").evaluate((e) => e.toDataURL());
  await page.waitForTimeout(200);
  check(
    stopped === (await page.locator("#terrain").evaluate((e) => e.toDataURL())),
    "Motion off stops canvas",
  );
  check(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length === 0,
    ),
    "Motion off stops CSS and scripted animation",
  );
  await page.getByRole("button", { name: "Motion off", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => document.documentElement.dataset.effects === "off",
  );
  check(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length === 0,
    ),
    "Reduced motion stops animation",
  );
  await page.screenshot({
    path: "output/playwright/orix-v2-reduced-motion.png",
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(
    () => document.documentElement.dataset.effects === "on",
  );
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "No overflow at " + width,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "ORIX home", exact: true }).click();
  await page
    .getByRole("button", { name: "Try the layer ↓", exact: true })
    .click();
  await page.waitForTimeout(650);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  const panelBox = await page.locator("#notch-shell").boundingBox();
  check(
    panelBox.y + panelBox.height < 844,
    "Open layer is discoverable in first mobile viewport",
  );
  await page.screenshot({ path: "output/playwright/orix-v2-mobile.png" });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.keyboard.press("Escape");
  check(
    await page
      .locator("#menu-toggle")
      .evaluate((e) => e === document.activeElement),
    "Mobile menu focus restoration",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: "output/playwright/orix-v2-desktop.png" });
  for (const target of [
    "#tools",
    "#integrations",
    "#appearance",
    "#open-source",
    "#get-orix",
    "#faq",
  ]) {
    await page.locator(target).scrollIntoViewIfNeeded();
    await page.waitForTimeout(850);
  }
  await page.evaluate(() => {
    document.activeElement.blur();
    scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(150);
  await page.screenshot({
    path: "output/playwright/orix-v2-full.png",
    fullPage: true,
  });
  const context = await page
    .context()
    .browser()
    .newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
  const staticPage = await context.newPage();
  await staticPage.goto("http://127.0.0.1:43870/index.html");
  check(await staticPage.locator("h1").isVisible(), "Static heading");
  check(
    await staticPage.locator(".notch-home").isVisible(),
    "No-JS settled tool preview",
  );
  check(
    await staticPage.locator("#navigation").isVisible(),
    "No-JS mobile navigation",
  );
  check(
    (await staticPage.locator("details").count()) === 9,
    "No-JS FAQ content",
  );
  await context.close();
  await page.getByRole("link", { name: "ORIX home", exact: true }).click();
  return {
    status: "PASS",
    replaySequence: sequence,
    intermediateNotchWidth: Math.round(intermediate),
    checks:
      "motion progression, notch states, tools, timer, integrations, real themes, gallery/modal, terrain/pause, reduced motion, five widths, first-screen mobile and no-JS",
  };
}
