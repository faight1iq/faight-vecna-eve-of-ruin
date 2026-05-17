# Faight - Vecna: Eve of Ruin

A custom Foundry VTT compendium module for Vecna: Eve of Ruin containing monsters, items, maps, journals, and music.

**Foundry VTT Version:** v13  
**System:** D&D 5e (dnd5e)

---

## Module Contents

| Compendium | Type | Description |
|---|---|---|
| Monsters | Actor | Creatures and NPCs |
| Items | Item | Weapons, armor, loot, magic items |
| Journals | JournalEntry | Lore, handouts, notes |
| Maps & Scenes | Scene | Battle maps and exploration maps |
| Music & Playlists | Playlist | Background music and ambiance |

---

## Folder Structure

```
faight-vecna-eve-of-ruin/
├── module.json              ← Module manifest
├── packs/                   ← Compendium databases (managed by Foundry)
│   ├── monsters/
│   ├── items/
│   ├── journals/
│   ├── scenes/
│   └── playlists/
├── assets/                  ← All media files bundled with the module
│   ├── maps/                ← Scene background images (.webp)
│   ├── tokens/              ← Token artwork (.webp)
│   ├── images/              ← Item icons, journal images (.webp)
│   └── music/               ← Audio files (.ogg or .mp3)
├── scripts/
│   └── path-fixer.mjs       ← Utility to remap asset paths
├── lang/
│   └── en.json
└── .github/
    └── workflows/
        └── release.yml       ← Auto-builds releases on GitHub
```

---

## Setup Guide

### For the Module Author (You)

#### 1. Clone this repo locally

```bash
git clone https://github.com/faight/faight-vecna-eve-of-ruin.git
```

#### 2. Add your asset files

Drop your maps, tokens, images, and audio into the matching `assets/` subfolders. Use subfolders to organize by chapter if needed:

```
assets/maps/chapter-01/crypt-entrance.webp
assets/tokens/vecna-cultist.webp
assets/music/ambient-dungeon.ogg
```

#### 3. Push to GitHub

```bash
git add .
git commit -m "Add chapter 1 assets"
git push
```

#### 4. Create a release

When you're ready to share a version:

```bash
git tag 1.0.0
git push origin 1.0.0
```

The GitHub Action will automatically build a `faight-vecna-eve-of-ruin.zip` and attach it to the release, with the correct version number in `module.json`.

#### 5. Install on Sqyre (or any Foundry host)

Use this manifest URL to install the latest release:

```
https://github.com/faight/faight-vecna-eve-of-ruin/releases/latest/download/module.json
```

In Sqyre: **Manage Game → Manage Modules → Install from Manifest URL**  
In Foundry: **Setup → Add-on Modules → Install Module → Manifest URL**

---

### For Your Friends

Share this manifest URL — they paste it into Foundry's module installer:

```
https://github.com/faight/faight-vecna-eve-of-ruin/releases/latest/download/module.json
```

All assets (maps, tokens, music) are bundled in the download. They just need to:

1. Install via the manifest URL above
2. Activate the module in their world (Settings → Manage Modules)
3. Import content from the compendiums in the sidebar

---

## Path Fixer Utility

If you're migrating from an existing game where assets lived in a different location (like Sqyre storage), this module includes a path fixer script.

After activating the module, open the browser console (F12) and run:

```javascript
// Preview what would change (safe — no modifications)
PathFixer.dryRun("sqyre/your-old-path")

// Apply the changes for real
PathFixer.run("sqyre/your-old-path")
```

This will scan all scenes, actors, items, journals, and playlists in the current world and update any file paths that start with the old prefix to point to `modules/faight-vecna-eve-of-ruin/assets/` instead.

**⚠️ Back up your world before running this!**

---

## Updating the Module

1. Add or change files locally
2. Bump the version: `git tag 1.1.0 && git push origin 1.1.0`
3. The GitHub Action builds a new release automatically
4. Friends update in Foundry: **Setup → Update All** or update the individual module

---

## Tips

- **Use `.webp` for images** — smaller files, faster loading
- **Use `.ogg` for audio** — good quality at small file sizes
- **Lock compendiums** before exporting or sharing (right-click → Lock)
- **Asset paths** should always reference `modules/faight-vecna-eve-of-ruin/assets/...` so they work for everyone
- **Git LFS**: If your repo grows large (100MB+), consider using [Git LFS](https://git-lfs.github.com/) for binary assets
