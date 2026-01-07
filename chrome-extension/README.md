# Is This Site Safe? - Chrome Extension

Instantly check if any website is trustworthy with one click.

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `chrome-extension` folder
5. The extension icon will appear in your toolbar

## Usage

1. Visit any website you want to check
2. Click the extension icon in your toolbar
3. Click "Check This Site"
4. View the full trust analysis on IsThisSiteSafe.com

## Creating Icons

Before publishing, create icon files in the `icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any image editor or online tool to create these icons.

## Publishing to Chrome Web Store

1. Create a developer account at https://chrome.google.com/webstore/devconsole
2. Pay the one-time $5 registration fee
3. Zip this folder (excluding README.md)
4. Upload to the Chrome Web Store Developer Dashboard
5. Fill in the required information and submit for review

## Configuration

Update the `checkerUrl` in `popup.js` to point to your deployed app URL.
