# fs
A JavaScript user script that creates citations of external websites, to be used on FamilySearch.

## Configuration

1. Install a browser extension that allows to execute user scripts. For example:
   * Tampermonkey (all major browsers): https://tampermonkey.net/
   * Greasemonkey (Firefox only): https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
2. Open the extension, and create a new userscript. (In the Tampermonkey dashboard, click the button with a '+'.)
3. Remove the default text from the userscript, and replace it with the contents of fs-sources.js (copy-paste).
4. Don't forget to save the userscript (in Tampermonkey: File > Save, Ctrl-S or ⌘-S).
5. You're set to go. If you want to use the userscript in a tab that is already open, don't forget to refresh that tab.

## Usage

## Receive newer versions automatically

By default, you will receive update and bug fixes.
If you don't want: in Tampermonkey: uncheck the "Check for updates" checkbox in the settings tab of the user script.
If you want them, but you don't receive them, make sure that checkbox is checked and that the update URL is set to `https://raw.githubusercontent.com/singhsansun/fs/master/fs_online_sources.user.js`.
