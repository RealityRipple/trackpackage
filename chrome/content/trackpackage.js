// Copyright Dave Kahler. Do not copy without permission.
if(!com) var com={};
if(!com.dakahler) com.dakahler={};
if(!com.dakahler.tp) com.dakahler.tp={};
if(!com.dakahler.tp.main) com.dakahler.tp.main={};
com.dakahler.tp.main =
{
 observe: function(subject, topic, data)
 {
  if (topic == "nsPref:changed")
  {
   if (data == "tpMaxDropdownItems")
   {
    com.dakahler.tp.functionLib.tpRebuildDropdown();
   }
  }
  subject = subject.QueryInterface(Components.interfaces.nsIUpdateItem);
  if (subject.name == "Track Package" && data == "item-uninstalled")
  {
   var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
   myTPPrefs.deleteBranch("");
  }
 },
 register: function()
 {
  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(this, "em-action-requested", false);
  var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
  this._branch = prefService.getBranch("extensions.trackpackage.");
  this._branch.QueryInterface(Components.interfaces.nsIPrefBranch);
  this._branch.addObserver("", this, false);
 },
 deregister: function()
 {
  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.removeObserver(this,"em-action-requested");
 },
 tpInit: function()
 {
  com.dakahler.tp.main.register();
  const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
  var tpHidePtr = com.dakahler.tp.main.tpHide;
  if (appInfo.ID == THUNDERBIRD_ID)
  {
   com.dakahler.tp.functionLib.gInThunderbird = true;
   if (document.getElementById("messagePaneContext") != null)
    document.getElementById("messagePaneContext").addEventListener("popupshowing", tpHidePtr, false);
   else if (document.getElementById("mailContext") != null)
    document.getElementById("mailContext").addEventListener("popupshowing", tpHidePtr, false);
   if (document.getElementById("msgComposeContext") != null)
    document.getElementById("msgComposeContext").addEventListener("popupshowing", tpHidePtr, false);
   if (document.getElementById("messagepanebox") != null)
    com.dakahler.tp.functionLib.gHasThunderbrowse = document.getElementById("messagepanebox").hasAttribute("thunderbrowse");
  }
  else
  {
   document.getElementById("contentAreaContextMenu").addEventListener("popupshowing",tpHidePtr,false);
  }
  if (com.dakahler.tp.functionLib.tpGetGMapsSetting())
  {
   var menuitem = document.createElement('menuitem');
   menuitem.setAttribute('id',"trackgmaps");
   menuitem.setAttribute('label',"Track with Google Maps");
   menuitem.setAttribute('oncommand',"com.dakahler.tp.functionLib.tpTrackGoogleMaps();");
   if (document.getElementById("contentAreaContextMenu"))
    document.getElementById("contentAreaContextMenu").appendChild(menuitem);
   if (document.getElementById("messagePaneContext"))
    document.getElementById("messagePaneContext").appendChild(menuitem);
   if (document.getElementById("mailContext"))
    document.getElementById("mailContext").appendChild(menuitem);
  }
 },
 tpUnload: function()
 {
  com.dakahler.tp.main.deregister();
 },
 tpHide: function()
 {
  var smartSense     = com.dakahler.tp.functionLib.tpGetSmartSenseSetting();
  var trackingString = com.dakahler.tp.functionLib.tpGetTrackingString();
  var carrier        = com.dakahler.tp.functionLib.tpGetPackageCarrier(trackingString);
  var showTrack      = (com.dakahler.tp.functionLib.tpGetPackageURL(carrier, trackingString, false) != "" || !smartSense);
  var tpItem         = document.getElementById("trackpackage");
  var gmapsItem      = document.getElementById("trackgmaps");
  var explicitItem   = document.getElementById("trackpackage_explicitmenu");
  if (tpItem)
   tpItem.hidden = !showTrack && smartSense;
  if (gmapsItem)
   gmapsItem.hidden = !showTrack && smartSense;
  if (explicitItem)
   explicitItem.hidden = true;
 },
 tpLinkNumbers: function()
 {
  var workingHTML = "";
  if (!com.dakahler.tp.functionLib.gInThunderbird)
  {
   workingHTML = content.document.getElementsByTagName("body").item(0).innerHTML;
  }
  else
  {
   var windowManager       = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(nsIWindowMediator);
   var messengerWindowList = windowManager.getEnumerator("mail:3pane");
   var messageWindowList   = windowManager.getEnumerator("mail:messageWindow");
   var messageURI          = GetFirstSelectedMessage();
   var messageBody         = "";
   if (messageURI != null && messageURI != "")
   {
    while (true)
    {
     if (messengerWindowList.hasMoreElements())
      win = messengerWindowList.getNext();
     else if (messageWindowList.hasMoreElements())
      win = messageWindowList.getNext();
     else
      break;
     loadedMessageURI = win.GetLoadedMessage();
     if (loadedMessageURI != messageURI)
      continue;
     brwsr = win.getMessageBrowser();
     if (!brwsr)
      continue;
     messageBody = brwsr.docShell.contentViewer.DOMDocument.body.textContent;
     break;
    }
   }
   if (messageBody.length > 0)
    workingHTML = brwsr.docShell.contentViewer.DOMDocument.body.innerHTML;
  }
  if (workingHTML == "")
   return;
  var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
  var resultArray   = new Array();
  var dividedHTML   = workingHTML.split(/\s|\t|\n|\r|\f|(<([^<>]*)>)/);
  if (dividedHTML.length == 0)
   return;
  var tempArray     = new Array();
  for (var i = 0; i < regexURLArray.length; i++)
  {
   var stringregex = regexURLArray[i][1];
   if (stringregex.length==0)
    continue;
   var regex = new RegExp(stringregex, "gi");
   for (var j = 0; j < dividedHTML.length; j++)
   {
    if (dividedHTML[j] == undefined)
     continue;
    if (dividedHTML[j] == "")
     continue;
    if (dividedHTML[j].includes("<") ||
        dividedHTML[j].includes(">") ||
        dividedHTML[j].includes("\"") ||
        dividedHTML[j].includes("'") ||
        dividedHTML[j].includes("(") ||
        dividedHTML[j].includes(")") ||
        dividedHTML[j].includes("{") ||
        dividedHTML[j].includes("}") ||
        dividedHTML[j].includes("[") ||
        dividedHTML[j].includes("]") ||
        dividedHTML[j].includes("+") ||
        dividedHTML[j].includes("*") ||
        dividedHTML[j].includes("/") ||
        dividedHTML[j].includes("\\"))
     continue;
    if (dividedHTML[j].match(regex))
    {
     var length = tempArray.length;
     tempArray[length] = new Array();
     tempArray[length][0] = com.dakahler.tp.functionLib.tpRemoveSpaces(dividedHTML[j]);
     tempArray[length][1] = regexURLArray[i][2];
     tempArray[length][2] = regexURLArray[i][3];
    }
   }
  }
  var newlist  = new Array();
  var newIndex = 0;
  for (var index = 0; index < tempArray.length; index++)
  {
   var foundDuplicate = false;
   for (var index2 = 0; index2 < newlist.length; index2++)
   {
    if (tempArray[index][0] == newlist[index2][0])
    {
     foundDuplicate = true;
     break;
    }
   }
   if (!foundDuplicate)
   {
    newlist[newIndex] = new Array();
    newlist[newIndex][0] = tempArray[index][0];
    newlist[newIndex][1] = tempArray[index][1];
    newlist[newIndex][2] = tempArray[index][2];
    newIndex++;
   }
  }
  for (var index = 0; index < newlist.length; index++)
  {
   var regexp = "";
   try
   {
    regexp = new RegExp(newlist[index][0]);
   }
   catch (e)
   {
    alert("Regular Expression Error:\nUnable to handle \"" + newlist[index][0] + "\".\n\nPlease report this issue to webmaster@RealityRipple.com.");
   }
   var regexp = new RegExp(newlist[index][0]);
   var url = "<a href=\"" + newlist[index][1] + newlist[index][0] + newlist[index][2] + "\">" + newlist[index][0] + "</a>";
   workingHTML = workingHTML.replace(regexp,url);
  }
  if (!com.dakahler.tp.functionLib.gInThunderbird)
  {
   content.document.getElementsByTagName("body").item(0).innerHTML = workingHTML;
  }
  else
  {
   brwsr = win.getMessageBrowser();
   if (brwsr)
    brwsr.docShell.contentViewer.DOMDocument.body.innerHTML = workingHTML;
  }
 },
 tpButtonMenuPressed: function(target)
 {
  if (target.id == "tpbuttonmenu")
  {
   var child = target.firstChild;
   while (child)
   {
    if (child.historyInfo != undefined)
    {
     target = child;
     break;
    }
    child = child.nextSibling;
   }
  }
  if (target.historyInfo != undefined)
  {
   var carrier = target.historyInfo['Carrier'];
   var trackingString = target.historyInfo['TrackingNumber'];
   var title = carrier + ": " + trackingString;
   com.dakahler.tp.functionLib.tpOpenPackageWindow(com.dakahler.tp.functionLib.tpGetPackageURL(carrier, trackingString, false), false, false, title);
  }
 },
 tpButtonMenuLoaded: function()
 {
  if (com != undefined)
  {
   com.dakahler.tp.functionLib.tpRebuildDropdown();
  }
 }
}
window.addEventListener("load",com.dakahler.tp.main.tpInit, false);
window.addEventListener("unload", com.dakahler.tp.main.tpUnload, false);
