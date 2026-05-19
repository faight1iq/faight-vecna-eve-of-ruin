# ================================================================
# Faight - Vecna: Eve of Ruin — External Asset Downloader
# Version: 260518-1000
# ================================================================
# Downloads all external assets from Sqyre and places them in the
# correct folders in the GitHub repo.
#
# Usage:
#   1. Place this script and asset-migration-list.json in the same folder
#      (or update the $ManifestPath below)
#   2. Open PowerShell
#   3. cd "D:\Storage\My Files\Code\GitHub\faight-vecna-eve-of-ruin"
#   4. .\download-assets.ps1
#
# After running:
#   - Commit and push with GitHub Desktop
#   - Create a new release tag on GitHub
#   - Reinstall the module on Sqyre
#   - Run the main script in "Copy and Update" mode
# ================================================================

$RepoRoot = "D:\Storage\My Files\Code\GitHub\faight-vecna-eve-of-ruin"
$ManifestPath = Join-Path $RepoRoot "asset-migration-list.json"

# Check manifest exists
if (-not (Test-Path $ManifestPath)) {
    Write-Host "ERROR: Cannot find manifest at $ManifestPath" -ForegroundColor Red
    Write-Host "Place asset-migration-list.json in the repo root folder."
    exit 1
}

# Read manifest
$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  External Asset Downloader" -ForegroundColor Cyan
Write-Host "  Files to download: $($manifest.Count)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$success = 0
$skipped = 0
$failed = 0
$dupes = 0

foreach ($item in $manifest) {
    $sourceUrl = $item.sourceUrl
    $targetRelPath = $item.targetRepoPath
    $filename = $item.filename
    
    # Build full target path
    $targetFullPath = Join-Path $RepoRoot $targetRelPath
    $targetDir = Split-Path $targetFullPath -Parent
    
    # Skip if file already exists
    if (Test-Path $targetFullPath) {
        $skipped++
        continue
    }
    
    # Create target directory if needed
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        Write-Host "  Created: $targetDir" -ForegroundColor DarkGray
    }
    
    # Download the file
    try {
        Write-Host "  Downloading: $filename" -ForegroundColor White -NoNewline
        Invoke-WebRequest -Uri $sourceUrl -OutFile $targetFullPath -UseBasicParsing -ErrorAction Stop
        
        # Verify download
        if (Test-Path $targetFullPath) {
            $size = (Get-Item $targetFullPath).Length
            Write-Host " -> $targetRelPath ($size bytes)" -ForegroundColor Green
            $success++
        } else {
            Write-Host " -> FAILED (file not created)" -ForegroundColor Red
            $failed++
        }
    }
    catch {
        Write-Host " -> FAILED ($($_.Exception.Message))" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Downloaded: $success" -ForegroundColor Green
Write-Host "  Skipped (already exist): $skipped" -ForegroundColor Yellow
Write-Host "  Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Open GitHub Desktop and commit all new files"
Write-Host "  2. Push to GitHub"
Write-Host "  3. Create a new release (e.g. tag 260518.1000)"
Write-Host "  4. Reinstall the module on Sqyre"
Write-Host "  5. Run the main script in 'Copy and Update' mode"
Write-Host ""
