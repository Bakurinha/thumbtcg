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
    await p.waitForFunction(() => !!window.ThumbRaster);
    await p.evaluate(async () => {
      ThumbEngine.applyLayout("layout31");
      const r = await (await fetch("assets/home/hero-digimon.jpg")).blob();
      for (const side of ["left", "right"])
        await ThumbEngine.loadFile(
          side,
          new File([r], "card.jpg", { type: r.type }),
        );
      await ThumbRaster.ready();
      ThumbInteractions.commit();
    });
    const original = await p.locator("#art-left").getAttribute("href");
    const art = await p.evaluate(() => ThumbStudio.snapshot().art);
    for (const effect of [
      "Pixelate",
      "Posterize",
      "Emboss",
      "Sepia",
      "Solarize",
    ]) {
      await p.evaluate(async (effect) => {
        const s = ThumbRaster.getState();
        s.left.effect = effect;
        ThumbRaster.setState(s);
        await ThumbRaster.ready();
      }, effect);
      assert.notEqual(
        await p.locator("#art-left").getAttribute("href"),
        original,
      );
      assert.deepEqual(await p.evaluate(() => ThumbStudio.snapshot().art), art);
      const d = p.waitForEvent("download");
      await p.click("#export");
      const bytes = await fs.readFile(await (await d).path());
      assert.equal(bytes.readUInt32BE(16), 1280);
      if (effect === "Emboss")
        await fs.writeFile("/tmp/raster-emboss.png", bytes);
    }
    const saved = await p.evaluate(() => ThumbStudio.snapshot());
    await p.evaluate(async (s) => {
      await ThumbStudio.restore(s);
      await ThumbRaster.ready();
    }, saved);
    assert.equal(
      await p.evaluate(() => ThumbRaster.getState().left.effect),
      "Solarize",
    );
    await p.evaluate(async (s) => {
      delete s.raster;
      await ThumbStudio.restore(s);
      await ThumbRaster.ready();
    }, saved);
    assert.equal(await p.locator("#art-left").getAttribute("href"), original);
    // Latest slider values win even while previous worker jobs are still running.
    await p.evaluate(async () => {
      for (const effect of ["Emboss", "Solarize", "Pixelate"]) {
        const s = ThumbRaster.getState();
        s.left.effect = effect;
        ThumbRaster.setState(s);
      }
      await ThumbRaster.ready();
    });
    assert.equal(
      await p.evaluate(() => ThumbRaster.getState().left.effect),
      "Pixelate",
    );
    await p.evaluate(async () => {
      ThumbInteractions.resetHistory();
      const s = ThumbRaster.getState();
      s.left.effect = "Sepia";
      ThumbRaster.setState(s);
      await ThumbRaster.ready();
      ThumbInteractions.commit();
      await ThumbInteractions.undo();
      await ThumbRaster.ready();
    });
    assert.equal(
      await p.evaluate(() => ThumbRaster.getState().left.effect),
      "Pixelate",
    );
    for (const size of ["1920", "2560"]) {
      await p.selectOption("#export-size", size);
      const d = p.waitForEvent("download");
      await p.click("#export");
      const bytes = await fs.readFile(await (await d).path());
      assert.equal(bytes.readUInt32BE(16), Number(size));
    }
    await p.evaluate(async () => {
      ThumbEngine.applyLayout("layout30");
      await ThumbRaster.ready();
    });
    assert.equal(await p.locator("#toggle-right-art").isChecked(), false);
    assert.equal(
      await p.evaluate(() => ThumbComposition.getState().images.left.rotation),
      9,
    );
    for (const lang of ["en", "es"]) {
      await p.selectOption("#site-language", lang);
      assert.equal(
        await p
          .locator('#raster-effect option[value="Pixelate"]')
          .textContent(),
        lang === "en" ? "Pixelation" : "Pixelación",
      );
    }
    await p.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await p.evaluate(async () => {
      ThumbRaster.reset();
      await ThumbRaster.ready();
    });
    assert.equal(await p.locator("#art-left").getAttribute("href"), original);
    // An unavailable optional engine must leave originals usable.
    const unavailable = await b.newPage();
    await unavailable.route("**/raster-worker.js*", (route) => route.abort());
    await unavailable.goto(
      (process.env.BASE_URL || "http://localhost:8778") + "/#digimon",
    );
    await unavailable.waitForFunction(() => !!window.ThumbRaster);
    const recovered = await unavailable.evaluate(async () => {
      const blob = await (await fetch("assets/home/hero-digimon.jpg")).blob();
      await ThumbEngine.loadFile(
        "left",
        new File([blob], "card.jpg", { type: blob.type }),
      );
      await ThumbRaster.ready();
      const original = document.getElementById("art-left").getAttribute("href");
      const state = ThumbRaster.getState();
      state.left.effect = "Sepia";
      ThumbRaster.setState(state);
      const rejected = await ThumbRaster.ready().then(
        () => false,
        () => true,
      );
      ThumbRaster.reset();
      await ThumbRaster.ready();
      return (
        rejected &&
        original === document.getElementById("art-left").getAttribute("href")
      );
    });
    assert.equal(recovered, true);
    await unavailable.close();
    assert.deepEqual(errors, []);
    console.log(
      "PASS 5 Konva filters, original preservation, project migration, undo, races, 3 export sizes, layouts, translations, mobile.",
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
