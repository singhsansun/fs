# fs
A JavaScript user script that creates citations of external websites, to be used on FamilySearch.

## Configuration

1. Install a browser extension that allows to execute user scripts. For example:
   * Tampermonkey (all major browsers): https://tampermonkey.net/
   * Greasemonkey (Firefox only): https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
2. Open the raw script file at https://raw.githubusercontent.com/singhsansun/fs/master/fs_online_sources.user.js.
The extension should open and ask you to install the script.
Your browser may issue a warning. Install the script. If it worked, skip steps 3-5 below.
3. Open the extension, and create a new userscript. (In the Tampermonkey dashboard, click the button with a '+'.)
4. Remove the default text from the userscript, and replace it with the contents of fs_online_sources.user.js (copy-paste).
5. Don't forget to save the userscript (in Tampermonkey: File > Save, Ctrl-S or ⌘-S).
6. You're set to go. If you want to use the userscript in a tab that is already open, don't forget to refresh that tab.

## Usage

When you want to add or edit an online source, simply go to the sources tab of a profile. Click 'Add Source', then 'Add New Source', and paste the URL in the designated textbox.
The user script will load the HTML of the URL you pasted, and extract information to create a citation out of it.
Similarly when editing a source, and when adding or editing a source for a relationship.
It currently works with the following websites:
* genealogieonline.nl
* geneanet.org
* geni.com
* wikitree.com (only public profiles)

## Receiving newer versions automatically

By default, you will receive updates and bug fixes.
If you don't want: in Tampermonkey: uncheck the "Check for updates" checkbox in the settings tab of the user script.
If you want them, but you don't receive them, make sure that checkbox is checked, that the update URL is set to `https://raw.githubusercontent.com/singhsansun/fs/master/fs_online_sources.user.js` and that the lines

    // @updateURL    https://raw.githubusercontent.com/singhsansun/fs/master/fs_online_sources.meta.js
    // @downloadURL  https://raw.githubusercontent.com/singhsansun/fs/master/fs_online_sources.user.js

appear in the meta block of the user script.

## I found a bug!

Chances are the user script isn't perfect, certainly not on all browsers. If you have found a bug, do open an issue in this GitHub repository.
