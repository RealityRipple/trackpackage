// Copyright Dave Kahler. Do not copy without permission.
var TrackPackage_overlay =
{
 _branch: null,
 observe: function(subject, topic, data)
 {
  if (topic == "nsPref:changed" && data == "tpMaxDropdownItems")
  {
   TrackPackage_functionLib.tpRebuildDropdown();
  }
  if (data == "item-uninstalled")
  {
   subject = subject.QueryInterface(Components.interfaces.nsIUpdateItem);
   if (subject.name == "Track Package")
   {
    var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
    myTPPrefs.deleteBranch("");
   }
  }
 },
 register: function()
 {
  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(this, "em-action-requested", false);
  var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
  TrackPackage_overlay._branch = prefService.getBranch("extensions.trackpackage.");
  TrackPackage_overlay._branch.QueryInterface(Components.interfaces.nsIPrefBranch);
  TrackPackage_overlay._branch.addObserver("", this, false);
 },
 deregister: function()
 {
  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.removeObserver(this,"em-action-requested");
 },
 tpUnload: function()
 {
  TrackPackage_overlay.deregister();
 },
 tpHide: function()
 {
  var smartSense     = TrackPackage_functionLib.tpGetSmartSenseSetting();
  var trackingString = TrackPackage_functionLib.tpGetTrackingString();
  var carrier        = TrackPackage_functionLib.tpGetPackageCarrier(trackingString);
  var showTrack      = (TrackPackage_functionLib.tpGetPackageURL(carrier, trackingString, false) != "" || !smartSense);
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
 tpInit: function()
 {
  TrackPackage_overlay.register();
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
  var tpHidePtr = TrackPackage_overlay.tpHide;
  if (appInfo.ID == "{3550f703-e582-4d05-9a08-453d09bdfdc6}")
  {
   TrackPackage_functionLib.gInThunderbird = true;
   if (document.getElementById("messagePaneContext") != null)
    document.getElementById("messagePaneContext").addEventListener("popupshowing", tpHidePtr, false);
   else if (document.getElementById("mailContext") != null)
    document.getElementById("mailContext").addEventListener("popupshowing", tpHidePtr, false);
   if (document.getElementById("msgComposeContext") != null)
    document.getElementById("msgComposeContext").addEventListener("popupshowing", tpHidePtr, false);
   if (document.getElementById("messagepanebox") != null)
    TrackPackage_functionLib.gHasThunderbrowse = document.getElementById("messagepanebox").hasAttribute("thunderbrowse");
  }
  else
  {
   document.getElementById("contentAreaContextMenu").addEventListener("popupshowing",tpHidePtr,false);
  }
  if (TrackPackage_functionLib.tpGetGMapsSetting())
  {
   var menuitem = document.createElement('menuitem');
   menuitem.setAttribute('id',"trackgmaps");
   menuitem.setAttribute('label',"Track with Google Maps");
   menuitem.setAttribute('oncommand',"TrackPackage_functionLib.tpTrackGoogleMaps();");
   if (document.getElementById("contentAreaContextMenu"))
    document.getElementById("contentAreaContextMenu").appendChild(menuitem);
   if (document.getElementById("messagePaneContext"))
    document.getElementById("messagePaneContext").appendChild(menuitem);
   if (document.getElementById("mailContext"))
    document.getElementById("mailContext").appendChild(menuitem);
  }
 },
 tpButtonMenuPressed: function(target)
 {
  if (target.id == "tpButtonMenu")
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
   var carrier = target.historyInfo.Carrier;
   var trackingString = target.historyInfo.TrackingNumber;
   var title = carrier + ": " + trackingString;
   TrackPackage_functionLib.tpOpenPackageWindow(TrackPackage_functionLib.tpGetPackageURL(carrier, trackingString, false), false, false, title);
  }
  else
  {
   TrackPackage_functionLib.tpOpenHistory();
  }
 },
 tpButtonMenuLoaded: function()
 {
  if (TrackPackage_functionLib != undefined)
  {
   TrackPackage_functionLib.tpRebuildDropdown();
  }
 }
};
window.addEventListener("load", TrackPackage_overlay.tpInit, false);
window.addEventListener("unload", TrackPackage_overlay.tpUnload, false);
