// ==UserScript==
// @name         Familysearch source adder
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       singhsansun
// @description  Quickly add external online sources to FamilySearch profiles.
// @homepage     https://github.com/singhsansun/fs
// @updateURL    https://raw.githubusercontent.com/singhsansun/fs/master/fs_online_sources.meta.js
// @downloadURL  https://raw.githubusercontent.com/singhsansun/fs/master/fs_online_sources.user.js
// @match        https://www.familysearch.org/tree/person*
// @grant        none
// ==/UserScript==

/**
* Parameters
*/

var addToSourceBox = false; // true or false

/**
* Source Handler detection.
*/
function sourceHandlers() {
    if (/^https?:\/\/www\.genealogieonline\.nl(|\/en|\/de|\/fr)\/.*/.test(url_string)) {
        readSourceWith(genealogieonline);
    }
    else if (/^https?:\/\/[a-z]+\.geneanet\.org\/.*/.test(url_string)) readSourceWith(geneanet);
    else if (/^https?:\/\/www\.geni\.com\/people\/.*/.test(url_string)) readSourceWith(geni);
    else if (/^https?:\/\/www\.wikitree\.com\/wiki\/.*/.test(url_string)) readSourceWith(wikitree);
    // Other sites
    else sourceStatus = "URL not recognized.";
    finishSourceProcessing();
}

/**
* Source Handler implementations. Website with URL url_string is loaded in element loadSrc.
*/
var url_string;
var dateInput;
var titleInput;
var urlInput;
var citation;
var nameCheckbox;
var genderCheckbox;
var birthCheckbox;
var christeningCheckbox;
var deathCheckbox;
var burialCheckbox;

function genealogieonline() {
    var url = new URL(url_string);
    var short_url = url.origin + url.pathname.replace(/^\/(en|de|fr)/, "");
    urlInput.value = short_url;
    var author = loadSrc.querySelector("meta[name='author']").content;
    var name = loadSrc.querySelector("meta[itemprop='name']").content;
    var treename = loadSrc.querySelector("h1").children[0].innerHTML;
    titleInput.value = "Genealogie Online. " + name + " in " + treename + " by " + author + ".";
    citation.value = author + ", \"" + name + "\", " + treename + " on Genealogie Online, "
        + short_url + " (accessed " + getDateString() + ").";
    // Checkboxes
    checkName(name);
}

function geneanet() {
    // Author name may be private
    var author = (loadSrc.querySelector(".ligne-auteur > strong:first-of-type") || loadSrc.querySelector(".ligne-auteur > a:first-of-type")).innerHTML;
    var url = new URL(url_string);
    var p = url.searchParams.get("p");
    var n = url.searchParams.get("n");
    var oc = url.searchParams.get("oc");
    var short_url = url_string.split("?")[0] + "?p=" + p + "&n=" + n + (oc?"&oc=" + oc:"");
    urlInput.value = short_url.replace(' ', '+');
    // Two possible HTML structures:
    // https://gw.geneanet.org/flokty?p=marie+therese&n=maria+theresa
    // https://gw.geneanet.org/flokty?n=joao&p=jean
    var given_name = (loadSrc.querySelector(".with_tabs > a:nth-of-type(1)") ||
        loadSrc.querySelector("#person-title ~ em > a:nth-of-type(1)")).innerHTML;
    var last_name = (loadSrc.querySelector(".with_tabs > a:nth-of-type(2)") ||
        loadSrc.querySelector("#person-title ~ em > a:nth-of-type(2)")).innerHTML;
    var name = given_name + " " + last_name;
    titleInput.value = "Geneanet " + author + ": " + name;
    citation.value = author + ", \"" + name + "\", Geneanet, "
        + short_url + " (accessed " + getDateString() + ").";
    // Checkboxes
    checkName(name);
    genderCheckbox.checked = loadSrc.querySelector(".with_tabs img").src.indexOf("male") > -1;
    var eventList = loadSrc.querySelector(".page_max ul");
    var eventStrings = [];
    if (eventList) {
        eventList.querySelectorAll("li").forEach(function(e) {eventStrings.push(e.innerText)});
        eventStrings.forEach(function(s) {
            // Birth and death: at least one number, or missing number but location (at least one letter)
            if (/^Born.*([1-9]|-.*[a-zA-Z]).*/.test(s)) birthCheckbox.checked = true;
            if (/^Deceased.*([1-9]|-.*[a-zA-Z]).*/.test(s)) deathCheckbox.checked = true;
            if (s.startsWith("Baptized")) christeningCheckbox.checked = true;
            if (s.startsWith("Buried")) burialCheckbox.checked = true;
        })
    }
}

function geni() {
    var short_url = url_string.split("?")[0];
    urlInput.value = short_url;
    // Two possible HTML structures, depending on whether or not logged in.
    var name = (loadSrc.querySelector("h2.quiet") || loadSrc.querySelector("span.quiet")).innerHTML.trim();
    titleInput.value = "Geni profile: " + name;
    citation.value = "Geni contributors, \"" + name + "\", Geni, "
        + short_url + " (accessed " + getDateString() + ").";
    // Checkboxes
    checkName(name);
}

function wikitree() {
    urlInput.value = url_string;
    // full name, including titles
    /**var nameSpan = loadSrc.querySelector("span.large");
    if (!nameSpan) {
        return "Cannot access WikiTree profile.";
    }
    nameSpan.querySelectorAll("a.BLANK").forEach(e => e.parentNode.removeChild(e));
    var name = nameSpan.innerText.replace(/\s+/g, " ").trim();**/
    //shorter name
    var nameSpan = loadSrc.querySelector("span[itemprop='name']");
    if (!nameSpan) return "Cannot access WikiTree profile.";
    var name = nameSpan.innerText.replace(/\s+/g, " ");
    titleInput.value = "WikiTree profile: " + name;
    citation.value = "WikiTree contributors, \"" + name + "\", WikiTree, "
        + url_string + " (accessed " + getDateString() + ").";
    // Checkboxes
    checkName(name);
}

/**
* If name contains an alphabetical character, check the name checkbox.
* Used by multiple handlers.
*/
function checkName(namestring) {
    if (/[A-Za-z]/.test(namestring)) nameCheckbox.checked = true;
}

/**
* Before and after code common to all source handlers. A source handler may
* return a custom sourceStatus. The default status is success.
*/
function readSourceWith(h) {
    sourceStatus = h(url_string);
    if (!sourceStatus) {
        sourceStatus = "Success!";
        saveButton.disabled = false;
    }
    reasonInput.value = "Source attached assisted by a FamilySearch source attaching userscript (https://github.com/singhsansun/fs)";
}

var loadSrc = document.createElement("div");
var statusIndicator = document.createElement("span");
statusIndicator.style.paddingLeft = "10px";
var env; // DOM element containing the source form
var editing;
var editingTab;
var sourceStatus = ""; // Text to be displayed in statusindicator
var reasonInput;
var saveButton;

/**
* On click, check if earlier source editing environment is still active.
* If not, stop editing. Also, replace editing environment by new one, if present.
* If present, prepare new environment for url paste.
*/
document.addEventListener('click', function() {
    var newEnv = initEnv();
    var nowEditing = newEnv && newEnv.host.parentNode.style.display != "none";
    if (editing) {
        // Editing environment has disappeared.
        if ((editingTab != getActiveTab()) || !nowEditing) {
            stopEditing();
        }
    }
    // Previously not editing or previous editing environment has disappeared, and there is a new one.
    if (!editing && nowEditing) {
        editing = true;
        editingTab = getActiveTab();
        console.log("Source form accessed in tab " + editingTab + ".");
        env = newEnv;
        initInput();
    }
});

/**
* Find source editing environment in current active tab.
* Return null/undefined/false if no environment has been found.
*/
function initEnv() {
    var found = false;
    var env;
    var dig = [ // main
        ["fs-person-page", "fs-tree-person-sources", "fs-source-list",
         "fs-source-list-container", "fs-source"],
        // marriage, parent-child
        ["fs-person-page", "fs-tree-person-details", "fs-tree-person-family",
         "fs-family-members", "fs-relationship", "fs-source-list",
         "fs-source-list-container", "fs-source"]];
    // Dig through Shadow DOM
    for (var j = 0; j < dig.length && !found; j++) {
        env = document.body;
        for (var i = 0; i < dig[j].length && env; i++) {
            env = env.querySelector(dig[j][i]);
            // Environment must be in active tab.
            if (i == 1 && env && !env.classList.contains("iron-selected")) env = false;
            if (!env) break;
            env = env.shadowRoot;
        }
        found = !!env;
    }
    return env;
}

/**
* Create status indicator. Define all input fields so that they become editable.
* Start listening for paste event.
*/
function initInput() {
    insertAfter(statusIndicator, env.querySelector("#web-page-section").children[1]);
    // Init input fields
    dateInput = env.querySelector("birch-standards-picker").shadowRoot;
    dateInput = dateInput.querySelector("birch-typeahead").shadowRoot.querySelector("#input");
    titleInput = env.querySelector("#title-input");
    urlInput = env.querySelector("#url-input");
    citation = env.querySelector("#citation-input");
    reasonInput = env.querySelector("#reason-to-attach-input");
    // Init checkboxes
    nameCheckbox = env.querySelector(".name-checkbox input");
    genderCheckbox = env.querySelector(".gender-checkbox input");
    birthCheckbox = env.querySelector(".birth-checkbox input");
    christeningCheckbox = env.querySelector(".christening-checkbox input");
    deathCheckbox = env.querySelector(".death-checkbox input");
    burialCheckbox = env.querySelector(".burial-checkbox input");
    resetCheckboxes();
    env.querySelector(".sourcebox-checkbox").children[0].checked = addToSourceBox;
    // Start listening for paste event
    urlInput.addEventListener("paste", initURLPaste);
    saveButton = env.querySelector("#save-button");
}

function resetCheckboxes() {
    nameCheckbox.checked = false;
    genderCheckbox.checked = false;
    birthCheckbox.checked = false;
    christeningCheckbox.checked = false;
    deathCheckbox.checked = false;
    burialCheckbox.checked = false;
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
* Code to be executed on paste event. Send XMLHttpRequest through a Proxy,
* and detect whether a URL is valid. If not, dislay failure message. If yes,
* try processing the url with source handlers.
*/
function initURLPaste(e) {
    resetCheckboxes();
    statusIndicator.innerHTML = "";
    url_string = "";
    if (e.clipboardData || e.originalEvent.clipboardData) {
        url_string = (e.originalEvent || e).clipboardData.getData("text/plain");
    } else if (window.clipboardData) {
        url_string = window.clipboardData.getData("Text");
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                loadSrc.innerHTML = this.responseText;
                sourceHandlers(url_string);
            }
            if (this.status == 404) {
                sourceStatus = "Failed."
                finishSourceProcessing();
            }
        }
    }
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    xhttp.open("GET", proxyurl + url_string, true);
    xhttp.send();
    statusIndicator.innerHTML = "Loading external website...";
}

/**
* When user has abandoned editing, remove statusindicator and reset its contents
* (it will be shown again upon next paste event). Stop listening for paste events.
* (Listening will start again when new source environment detected.)
*/
function stopEditing() {
    console.log("Source editing terminated in tab " + editingTab + ".");
    editing = false;
    statusIndicator.remove();
    statusIndicator.innerHTML = "";
    urlInput.removeEventListener("paste", initURLPaste);
}

/**
* Show status (Success, Failed, custom message, ...) and reset the status variable
* to get ready for the next source. Empty the object in which external pages are loaded
* (no reason to keep the external page running). Keep listening for paste event.
*/
function finishSourceProcessing() {
    statusIndicator.innerHTML += " " + sourceStatus;
    sourceStatus = "";
    loadSrc.innerHTML = "";
}

/**
* Return the name of the active tab, or false if it is not of interest.
*/
function getActiveTab() {
    var wrapper = document.body.querySelector("fs-person-page").shadowRoot;
    var tabs = ["fs-tree-person-details", "fs-tree-person-sources"];
    for (var i in tabs) {
        if (wrapper.querySelector(tabs[i]).classList.contains("iron-selected")) {
            return tabs[i];
        }
    }
    return false;
}

var months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"];

/**
* Gives the current date in the format "1 January 1900"
*/
function getDateString() {
    var d = new Date();
    return d.getDate() + " " + months[d.getMonth()] + " " + (d.getYear() + 1900);
}

// ==Version history==
// v0.1: includes genealogieonline.nl, geneanet.org, geni.com, wikitree.com
// v0.2: fixed bug when geneanet author has no public name; use username istead
// v0.3: add a note with a link to this github repository
// v1.0: auto tick checkboxes: detect name on all sites, detect everything on geneanet english version. Fix issue with submit button.
