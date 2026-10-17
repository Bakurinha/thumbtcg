const { chromium } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs/promises");
(async () => {
  const b = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    const p = await b.newPage({
        viewport: { width: 1440, height: 1000 },
        acceptDownloads: true,
      }),
      errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(
      (process.env.BASE_URL || "http://localhost:8778") + "/#digimon",
    );
    await p.waitForFunction(() => !!window.ThumbEndscreen);
    const initial = await p.evaluate(() => ThumbStudio.snapshot());
    await p.evaluate(() => {
      ThumbInteractions.commit();
      const s = ThumbEndscreen.getState();
      Object.assign(s, {
        enabled: true,
        title: "SEU PRÓXIMO DUELO",
        caption: "Obrigado por assistir!",
      });
      ThumbEndscreen.setState(s);
      ThumbInteractions.commit();
    });
    assert.equal(
      await p
        .locator("#thumb")
        .evaluate((e) => e.classList.contains("youtube-end-screen")),
      true,
    );
    for (const width of [320, 440])
      for (const gap of [40, 160])
        for (const y of [160, 390]) {
          const boxes = await p.evaluate(
            (v) => {
              ThumbEndscreen.setState({ ...ThumbEndscreen.getState(), ...v });
              return ThumbEndscreen.geometry();
            },
            { width, gap, y },
          );
          for (const a of boxes) {
            assert.equal(a.width / a.height, 16 / 9);
            assert.ok(a.x >= 64 && a.x + a.width <= 1216);
            assert.ok(a.y >= 64 && a.y + a.height <= 656);
          }
          assert.ok(boxes[0].x + boxes[0].width < boxes[1].x);
        }
    await p.evaluate(() =>
      ThumbEndscreen.setState({
        ...ThumbEndscreen.getState(),
        width: 420,
        gap: 120,
        y: 280,
      }),
    );
    const save = await p.evaluate(() => ThumbStudio.snapshot());
    await p.evaluate((s) => ThumbStudio.restore(s), save);
    assert.deepEqual(
      await p.evaluate(() => ThumbEndscreen.getState()),
      save.endscreen,
    );
    // Export with no cards; preview-only guides must never affect exported pixels.
    let guided;
    for (const width of [1280, 1920, 2560]) {
      await p.selectOption("#export-size", String(width));
      const d = p.waitForEvent("download");
      await p.click("#export");
      const data = await fs.readFile(await (await d).path());
      assert.equal(data.readUInt32BE(16), width);
      assert.equal(data.readUInt32BE(20), (width * 9) / 16);
      if (width === 1280) {
        guided = data;
        await fs.writeFile("/tmp/end-screen-export.png", data);
      }
    }
    await p.selectOption("#export-size", "1280");
    await p.evaluate(() =>
      ThumbEndscreen.setState({ ...ThumbEndscreen.getState(), guides: false }),
    );
    const d = p.waitForEvent("download");
    await p.click("#export");
    assert.deepEqual(await fs.readFile(await (await d).path()), guided);
    await p.evaluate((s) => ThumbStudio.restore(s), initial);
    assert.equal(
      await p.evaluate(() => ThumbEndscreen.getState().enabled),
      false,
    );
    // Old projects lack the new optional field.
    await p.evaluate(async (s) => {
      delete s.endscreen;
      await ThumbStudio.restore(s);
    }, save);
    assert.equal(
      await p.evaluate(() => ThumbEndscreen.getState().enabled),
      false,
    );
    const invalid = await p.evaluate(() => {
      try {
        ThumbEndscreen.setState({ ...ThumbEndscreen.getState(), width: 5000 });
        return false;
      } catch {
        return true;
      }
    });
    assert.equal(invalid, true);
    await p.evaluate(() => {
      ThumbInteractions.resetHistory();
      ThumbEndscreen.setState({ ...ThumbEndscreen.getState(), enabled: true });
      ThumbInteractions.commit();
      ThumbInteractions.undo();
    });
    await p.waitForFunction(() => !ThumbEndscreen.getState().enabled);
    await p.evaluate(() => ThumbInteractions.redo());
    await p.waitForFunction(() => ThumbEndscreen.getState().enabled);
    await p.click('[data-tool="themes"]');
    for (const id of ["cs-eden", "cs-kuremi", "cs-hudie"]) {
      await p.click(`[data-theme="${id}"]`);
      await p.evaluate(() => ThumbThemes.ready());
      assert.match(
        await p.locator("#theme-background image").getAttribute("href"),
        /^data:image\/webp/,
      );
      const d = p.waitForEvent("download");
      await p.click("#export");
      assert.ok((await fs.readFile(await (await d).path())).length > 50000);
    }
    await p.click('[data-tool="layouts"]');
    await p.locator(".layout-toolbar details summary").first().click();
    for (const lang of ["en", "es", "pt-BR"])
      await p.selectOption("#site-language", lang);
    await p.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await p.screenshot({ path: "/tmp/end-screen-mobile.png" });
    assert.deepEqual(errors, []);
    console.log(
      "PASS end screen: geometry extremes, export sizes, guides excluded, no cards needed, persistence, legacy, validation, undo/redo, CS assets and mobile.",
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
