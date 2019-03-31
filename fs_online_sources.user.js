// ==UserScript==
// @name         Familysearch source adder
// @namespace    http://tampermonkey.net/
// @version      0.1.1.1.1
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
    if (/https?:\/\/[a-z]+\.geneanet\.org\/.*/.test(url_string)) readSourceWith(geneanet);
    else if (/https?:\/\/www\.geni\.com\/people\/.*/.test(url_string)) readSourceWith(geni);
    else if (/https?:\/\/www\.genealogieonline\.nl(|\/en|\/de|\/fr)\/.*/.test(url_string)) {
        readSourceWith(genealogieonline);
    }
    else if (/https?:\/\/www\.wikitree\.com\/wiki\/.*/.test(url_string)) readSourceWith(wikitree);
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
}

function geneanet() {
    var author = loadSrc.querySelector(".ligne-auteur > strong:first-of-type").innerHTML;
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
}

function geni() {
    var short_url = url_string.split("?")[0];
    urlInput.value = short_url;
    // Two possible HTML structures, depending on whether or not logged in.
    var name = (loadSrc.querySelector("h2.quiet") || loadSrc.querySelector("span.quiet")).innerHTML.trim();
    titleInput.value = "Geni profile: " + name;
    citation.value = "Geni contributors, \"" + name + "\", Geni, "
        + short_url + " (accessed " + getDateString() + ").";
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
}

/**
* Main code below.
*/

function readSourceWith(h) {
    sourceStatus = h(url_string);
    if (!sourceStatus) sourceStatus = "Success!";
}

var loadSrc = document.createElement("div");
var statusIndicator = document.createElement("span");
statusIndicator.style.paddingLeft = "10px";
var env;
var editing;
var editingTab;
var sourceStatus = "";

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

function initInput() {
    insertAfter(statusIndicator, env.querySelector("#web-page-section").children[1]);
    dateInput = env.querySelector("birch-standards-picker").shadowRoot;
    dateInput = dateInput.querySelector("birch-typeahead").shadowRoot.querySelector("#input");
    titleInput = env.querySelector("#title-input");
    urlInput = env.querySelector("#url-input");
    citation = env.querySelector("#citation-input");
    env.querySelector(".sourcebox-checkbox").children[0].checked = addToSourceBox;
    urlInput.addEventListener("paste", initURLPaste);
}

function initURLPaste(e) {
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
                console.log("Page not found.");
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

function stopEditing() {
    console.log("Source editing terminated in tab " + editingTab + ".");
    editing = false;
    statusIndicator.remove();
    statusIndicator.innerHTML = "";
    urlInput.removeEventListener("paste", initURLPaste);
}

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

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

var months = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"];

function getDateString() {
    var d = new Date();
    return d.getDate() + " " + months[d.getMonth()] + " " + (d.getYear() + 1900);
}
