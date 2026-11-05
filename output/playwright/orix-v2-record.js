async (page) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("http://127.0.0.1:43870/index.html");
  await page.waitForTimeout(4300);
  await page.getByRole("slider", { name: "Scrub layer opening", exact: true }).press("Home");
  await page.waitForTimeout(400);
  await page.getByRole("slider", { name: "Scrub layer opening", exact: true }).press("End");
  await page.waitForTimeout(700);
  await page.getByRole("group", { name: "Layer opening chapters", exact: true }).getByRole("button", { name: "Tools", exact: true }).click();
  await page.waitForTimeout(500);
  await page
    .getByRole("group", { name: "Open a sample tool", exact: true })
    .getByRole("button", { name: "Focus", exact: true })
    .click();
  await page.getByRole("button", { name: "Start focus", exact: true }).click();
  await page.waitForTimeout(1100);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "All tools ↑", exact: true }).click();
  await page.getByRole("link", { name: "Your tools", exact: true }).click();
  await page
    .getByRole("group", { name: "Explore everyday tools", exact: true })
    .getByRole("button", { name: "Clipboard", exact: true })
    .click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Spotify", exact: true }).click();
  await page
    .getByRole("button", { name: "Play visual preview", exact: true })
    .click();
  await page.waitForTimeout(1500);
  await page
    .getByRole("button", { name: "Pause visual preview", exact: true })
    .click();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.locator("#get-orix").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  return "Recorded the normal-motion product sequence and interactive sections.";
}
