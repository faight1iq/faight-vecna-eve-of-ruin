/**
 * Path Fixer for Faight - Vecna: Eve of Ruin
 *
 * This script runs when the module is activated and provides a macro
 * to batch-update asset paths from their old location (e.g. Sqyre storage)
 * to the module's bundled assets folder.
 *
 * USAGE:
 *   1. Activate the module in your world.
 *   2. Open the browser console (F12) or run the included macro.
 *   3. The script will scan all scenes, actors, items, journals, and playlists
 *      and replace the old path prefix with the module path.
 *
 * IMPORTANT: Back up your world before running this!
 */

const MODULE_ID = "faight-vecna-eve-of-ruin";
const MODULE_ASSET_PATH = `modules/${MODULE_ID}/assets`;

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Module loaded. Path fixer available.`);
  console.log(`${MODULE_ID} | Run PathFixer.run("old/path/prefix") from the console to update asset paths.`);
  console.log(`${MODULE_ID} | Example: PathFixer.run("sqyre/my-assets")`);
  console.log(`${MODULE_ID} | Use PathFixer.dryRun("old/path/prefix") to preview changes first.`);
});

class PathFixer {

  /**
   * Preview what would change without modifying anything.
   * @param {string} oldPrefix - The old path prefix to find (e.g. "sqyre/my-uploads")
   */
  static async dryRun(oldPrefix) {
    if (!oldPrefix) {
      ui.notifications.error("Please provide the old path prefix. Example: PathFixer.dryRun('sqyre/my-assets')");
      return;
    }
    console.log(`${MODULE_ID} | === DRY RUN — No changes will be made ===`);
    const results = await this._processAll(oldPrefix, true);
    console.log(`${MODULE_ID} | === DRY RUN COMPLETE ===`);
    console.log(`${MODULE_ID} | Would update ${results.total} paths across ${results.documents} documents.`);
    ui.notifications.info(`Dry run complete: ${results.total} paths across ${results.documents} documents would be updated. Check the console (F12) for details.`);
    return results;
  }

  /**
   * Run the path replacement for real.
   * @param {string} oldPrefix - The old path prefix to find (e.g. "sqyre/my-uploads")
   */
  static async run(oldPrefix) {
    if (!oldPrefix) {
      ui.notifications.error("Please provide the old path prefix. Example: PathFixer.run('sqyre/my-assets')");
      return;
    }
    console.log(`${MODULE_ID} | === UPDATING PATHS ===`);
    console.log(`${MODULE_ID} | Replacing: "${oldPrefix}" → "${MODULE_ASSET_PATH}"`);
    const results = await this._processAll(oldPrefix, false);
    console.log(`${MODULE_ID} | === UPDATE COMPLETE ===`);
    console.log(`${MODULE_ID} | Updated ${results.total} paths across ${results.documents} documents.`);
    ui.notifications.info(`Path update complete: ${results.total} paths across ${results.documents} documents. Check the console (F12) for details.`);
    return results;
  }

  static async _processAll(oldPrefix, dryRun) {
    let total = 0;
    let documents = 0;

    // Normalize: strip trailing slash
    oldPrefix = oldPrefix.replace(/\/+$/, "");

    // --- SCENES ---
    for (const scene of game.scenes) {
      const updates = {};

      // Background image
      if (scene.background?.src?.includes(oldPrefix)) {
        const newPath = scene.background.src.replace(oldPrefix, MODULE_ASSET_PATH);
        updates["background.src"] = newPath;
        console.log(`${MODULE_ID} | Scene "${scene.name}" background: ${scene.background.src} → ${newPath}`);
      }

      // Foreground image
      if (scene.foreground?.includes(oldPrefix)) {
        updates["foreground"] = scene.foreground.replace(oldPrefix, MODULE_ASSET_PATH);
        console.log(`${MODULE_ID} | Scene "${scene.name}" foreground: ${scene.foreground} → ${updates["foreground"]}`);
      }

      // Thumbnail
      if (scene.thumb?.includes(oldPrefix)) {
        updates["thumb"] = scene.thumb.replace(oldPrefix, MODULE_ASSET_PATH);
      }

      // Tiles
      const tileUpdates = [];
      for (const tile of scene.tiles) {
        if (tile.texture?.src?.includes(oldPrefix)) {
          const newPath = tile.texture.src.replace(oldPrefix, MODULE_ASSET_PATH);
          tileUpdates.push({ _id: tile.id, "texture.src": newPath });
          console.log(`${MODULE_ID} | Scene "${scene.name}" tile: ${tile.texture.src} → ${newPath}`);
        }
      }

      // Sounds
      const soundUpdates = [];
      for (const sound of scene.sounds) {
        if (sound.path?.includes(oldPrefix)) {
          const newPath = sound.path.replace(oldPrefix, MODULE_ASSET_PATH);
          soundUpdates.push({ _id: sound.id, path: newPath });
          console.log(`${MODULE_ID} | Scene "${scene.name}" sound: ${sound.path} → ${newPath}`);
        }
      }

      // Tokens on the scene
      const tokenUpdates = [];
      for (const token of scene.tokens) {
        if (token.texture?.src?.includes(oldPrefix)) {
          const newPath = token.texture.src.replace(oldPrefix, MODULE_ASSET_PATH);
          tokenUpdates.push({ _id: token.id, "texture.src": newPath });
          console.log(`${MODULE_ID} | Scene "${scene.name}" token "${token.name}": ${token.texture.src} → ${newPath}`);
        }
      }

      const pathCount = Object.keys(updates).length + tileUpdates.length + soundUpdates.length + tokenUpdates.length;
      if (pathCount > 0) {
        total += pathCount;
        documents++;
        if (!dryRun) {
          if (Object.keys(updates).length) await scene.update(updates);
          if (tileUpdates.length) await scene.updateEmbeddedDocuments("Tile", tileUpdates);
          if (soundUpdates.length) await scene.updateEmbeddedDocuments("AmbientSound", soundUpdates);
          if (tokenUpdates.length) await scene.updateEmbeddedDocuments("Token", tokenUpdates);
        }
      }
    }

    // --- ACTORS ---
    for (const actor of game.actors) {
      const updates = {};

      // Portrait
      if (actor.img?.includes(oldPrefix)) {
        updates["img"] = actor.img.replace(oldPrefix, MODULE_ASSET_PATH);
        console.log(`${MODULE_ID} | Actor "${actor.name}" img: ${actor.img} → ${updates["img"]}`);
      }

      // Prototype token
      if (actor.prototypeToken?.texture?.src?.includes(oldPrefix)) {
        updates["prototypeToken.texture.src"] = actor.prototypeToken.texture.src.replace(oldPrefix, MODULE_ASSET_PATH);
        console.log(`${MODULE_ID} | Actor "${actor.name}" token: ${actor.prototypeToken.texture.src} → ${updates["prototypeToken.texture.src"]}`);
      }

      if (Object.keys(updates).length) {
        total += Object.keys(updates).length;
        documents++;
        if (!dryRun) await actor.update(updates);
      }

      // Actor's owned items
      const itemUpdates = [];
      for (const item of actor.items) {
        if (item.img?.includes(oldPrefix)) {
          const newPath = item.img.replace(oldPrefix, MODULE_ASSET_PATH);
          itemUpdates.push({ _id: item.id, img: newPath });
          console.log(`${MODULE_ID} | Actor "${actor.name}" item "${item.name}": ${item.img} → ${newPath}`);
        }
      }
      if (itemUpdates.length) {
        total += itemUpdates.length;
        if (!dryRun) await actor.updateEmbeddedDocuments("Item", itemUpdates);
      }
    }

    // --- ITEMS ---
    for (const item of game.items) {
      if (item.img?.includes(oldPrefix)) {
        const newPath = item.img.replace(oldPrefix, MODULE_ASSET_PATH);
        console.log(`${MODULE_ID} | Item "${item.name}": ${item.img} → ${newPath}`);
        total++;
        documents++;
        if (!dryRun) await item.update({ img: newPath });
      }
    }

    // --- JOURNAL ENTRIES ---
    for (const journal of game.journal) {
      let changed = false;
      const pageUpdates = [];
      for (const page of journal.pages) {
        if (page.src?.includes(oldPrefix)) {
          const newPath = page.src.replace(oldPrefix, MODULE_ASSET_PATH);
          pageUpdates.push({ _id: page.id, src: newPath });
          console.log(`${MODULE_ID} | Journal "${journal.name}" page "${page.name}" src: ${page.src} → ${newPath}`);
          total++;
          changed = true;
        }
        // Check HTML content for embedded image paths
        if (page.text?.content?.includes(oldPrefix)) {
          const newContent = page.text.content.replaceAll(oldPrefix, MODULE_ASSET_PATH);
          pageUpdates.push({ _id: page.id, "text.content": newContent });
          const matches = page.text.content.match(new RegExp(oldPrefix, "g"))?.length || 0;
          console.log(`${MODULE_ID} | Journal "${journal.name}" page "${page.name}" content: ${matches} path(s) replaced`);
          total += matches;
          changed = true;
        }
      }
      if (changed) {
        documents++;
        if (!dryRun && pageUpdates.length) {
          await journal.updateEmbeddedDocuments("JournalEntryPage", pageUpdates);
        }
      }
    }

    // --- PLAYLISTS ---
    for (const playlist of game.playlists) {
      const soundUpdates = [];
      for (const sound of playlist.sounds) {
        if (sound.path?.includes(oldPrefix)) {
          const newPath = sound.path.replace(oldPrefix, MODULE_ASSET_PATH);
          soundUpdates.push({ _id: sound.id, path: newPath });
          console.log(`${MODULE_ID} | Playlist "${playlist.name}" sound "${sound.name}": ${sound.path} → ${newPath}`);
          total++;
        }
      }
      if (soundUpdates.length) {
        documents++;
        if (!dryRun) await playlist.updateEmbeddedDocuments("PlaylistSound", soundUpdates);
      }
    }

    return { total, documents };
  }
}

// Expose globally so it can be called from the console or a macro
globalThis.PathFixer = PathFixer;
