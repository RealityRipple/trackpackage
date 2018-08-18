// Copyright Dave Kahler. Do not copy without permission.
var TrackPackage_prefs =
{
 tpPrefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage."),
 observerService: Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService),
 tpXMLObject: null,
 tpLoadCheckSetting: function(pref, def)
 {
  if (TrackPackage_prefs.tpPrefs.prefHasUserValue(pref))
   document.getElementById(pref).setAttribute("checked", TrackPackage_prefs.tpPrefs.getBoolPref(pref));
  else
   document.getElementById(pref).setAttribute("checked", def);
 },
 tpLoadIntValueSetting: function(pref, def)
 {
  if (TrackPackage_prefs.tpPrefs.prefHasUserValue(pref))
   document.getElementById(pref).value = TrackPackage_prefs.tpPrefs.getIntPref(pref);
  else
   document.getElementById(pref).value = def;
 },
 tpLoadCharValueSetting: function(pref, def)
 {
  if (TrackPackage_prefs.tpPrefs.prefHasUserValue(pref))
   document.getElementById(pref).setAttribute("value", TrackPackage_prefs.tpPrefs.getCharPref(pref));
  else
   document.getElementById(pref).setAttribute("value", def);
 },
 tpLoadSettings: function()
 {
  const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
  if (appInfo.ID == THUNDERBIRD_ID)
   TrackPackage_functionLib.gInThunderbird = true;
  else
   TrackPackage_functionLib.gInThunderbird = false;
  TrackPackage_prefs.tpLoadCheckSetting("tpCheckBox", true);
  TrackPackage_prefs.tpLoadCheckSetting("tpSmartSense", true);
  TrackPackage_prefs.tpLoadCheckSetting("tpNotifications", true);
  TrackPackage_prefs.tpLoadCheckSetting("tpPrivateBrowsing", true);
  TrackPackage_prefs.tpLoadCheckSetting("tpUseThunderbrowse", true);
  TrackPackage_prefs.tpLoadIntValueSetting("tpMaxNumbers", 25);
  TrackPackage_prefs.tpLoadIntValueSetting("tpMaxDropdownItems", 5);
  TrackPackage_prefs.tpLoadCheckSetting("tpEnableGMaps", false);
  TrackPackage_prefs.tpLoadCharValueSetting("tpUpdateURL", "https://realityripple.com/Software/Mozilla-Extensions/Track-Package/defaults.xml");
  if (!TrackPackage_functionLib.gInThunderbird)
  {
   document.getElementById("tpUseThunderbrowse").style.visibility = 'hidden';
   document.getElementById("tpUseThunderbrowse").style.display = 'none';
  }
  var regexesArray = TrackPackage_functionLib.regexDefaults.split(";");
  if (TrackPackage_prefs.tpPrefs.prefHasUserValue("tpRegex"))
   regexesArray = TrackPackage_prefs.tpPrefs.getCharPref("tpRegex").split(";");
  var regexListbox = document.getElementById("regexListbox");
  for (var i = 0; i < regexesArray.length; i++)
  {
   var carrierRegex = TrackPackage_functionLib.tpExtractQuotedStrings(regexesArray[i]);
   if (carrierRegex == "")
    return;
   var newCarrierField = document.createElement("textbox");
   var newRegexField   = document.createElement("textbox");
   var row             = document.createElement('listitem');
   var carrierCell     = document.createElement('textbox');
   var regexCell       = document.createElement('textbox');
   row.setAttribute('allowevents',true);
   carrierCell.setAttribute('value', carrierRegex[0] );
   regexCell.setAttribute('value', carrierRegex[1] );
   row.appendChild(carrierCell);
   row.appendChild(regexCell);
   regexListbox.appendChild(row);
  }
  var urlArray = TrackPackage_functionLib.URLDefaults.split(";");
  if (TrackPackage_prefs.tpPrefs.prefHasUserValue("tpURL"))
   urlArray = TrackPackage_prefs.tpPrefs.getCharPref("tpURL").split(";");
  var urlListbox = document.getElementById("urlListbox");
  for (var i = 0; i < urlArray.length; i++)
  {
   var carrierURL = TrackPackage_functionLib.tpExtractQuotedStrings(urlArray[i]);
   if (carrierURL == "")
    continue;
   var newCarrierField  = document.createElement("textbox");
   var newURLFrontField = document.createElement("textbox");
   var newURLBackField  = document.createElement("textbox");
   var row              = document.createElement('listitem');
   var carrierCell      = document.createElement('textbox');
   var urlFrontCell     = document.createElement('textbox');
   var urlBackCell      = document.createElement('textbox');
   row.setAttribute('allowevents',true);
   carrierCell.setAttribute('value', carrierURL[0] );
   urlFrontCell.setAttribute('value', carrierURL[1] );
   urlBackCell.setAttribute('value', carrierURL[2] );
   row.appendChild(carrierCell);
   row.appendChild(urlFrontCell);
   row.appendChild(urlBackCell);
   urlListbox.appendChild(row);
  }
  return true;
 },
 tpSaveSettings: function()
 {
  TrackPackage_prefs.tpPrefs.setBoolPref("tpCheckBox", document.getElementById("tpCheckBox").checked);
  TrackPackage_prefs.tpPrefs.setBoolPref("tpSmartSense", document.getElementById("tpSmartSense").checked);
  TrackPackage_prefs.tpPrefs.setBoolPref("tpNotifications", document.getElementById("tpNotifications").checked);
  TrackPackage_prefs.tpPrefs.setBoolPref("tpPrivateBrowsing", document.getElementById("tpPrivateBrowsing").checked);
  TrackPackage_prefs.tpPrefs.setBoolPref("tpUseThunderbrowse", document.getElementById("tpUseThunderbrowse").checked);
  TrackPackage_prefs.tpPrefs.setIntPref("tpMaxNumbers", document.getElementById("tpMaxNumbers").value);
  TrackPackage_prefs.tpPrefs.setIntPref("tpMaxDropdownItems", document.getElementById("tpMaxDropdownItems").value);
  TrackPackage_prefs.tpPrefs.setBoolPref("tpEnableGMaps", document.getElementById("tpEnableGMaps").checked);
  TrackPackage_prefs.tpPrefs.setCharPref("tpUpdateURL", document.getElementById("tpUpdateURL").value);
  var myRegListbox      = document.getElementById("regexListbox");
  var regexPrefArray    = new Array();
  var regexCarrierArray = new Array();
  var regCount          = myRegListbox.getRowCount();
  for (var index = 0; index < regCount; index++)
  {
   var item    = myRegListbox.getItemAtIndex(index);
   var nodes   = item.childNodes;
   var carrier = nodes.item(0).value;
   if (carrier == undefined)
    carrier    = nodes.item(0).getAttribute("value");
   var regex   = nodes.item(1).value;  
   if (regex   == undefined)
    regex      = nodes.item(1).getAttribute("value");
   regexPrefArray[regexPrefArray.length] = "\"" + carrier + "\"" + "," + "\"" + regex + "\"";
   regexCarrierArray[regexCarrierArray.length] = carrier;
  }
  var regexPref       = regexPrefArray.join(";");
  var myURLListbox    = document.getElementById("urlListbox");
  var urlPrefArray    = new Array();
  var urlCarrierArray = new Array();
  var urlCount        = myURLListbox.getRowCount()
  for (var index = 0; index < urlCount; index++)
  {
   var item     = myURLListbox.getItemAtIndex(index);
   var nodes    = item.childNodes;
   var carrier  = nodes.item(0).value;
   if (carrier  == undefined)
    carrier     = nodes.item(0).getAttribute("value");
   var urlFront = nodes.item(1).value;
   if (urlFront == undefined)
    urlFront    = nodes.item(1).getAttribute("value");
   var urlBack  = nodes.item(2).value;
   if (urlBack  == undefined)
    urlBack     = nodes.item(2).getAttribute("value");
   if (carrier == undefined)
    continue;
   urlPrefArray[urlPrefArray.length] = "\"" + carrier + "\"" + "," + "\"" + urlFront + "\"" + "," + "\"" + urlBack + "\"";
   urlCarrierArray[urlCarrierArray.length] = carrier;
  }
  var urlPref = urlPrefArray.join(";");
  regCount = regexCarrierArray.length;
  urlCount = urlCarrierArray.length;
  for (var i = 0; i < regCount; i++)
  {
   if (regexCarrierArray[i] == undefined || regexCarrierArray[i] == "")
    continue;
   var foundMatch = false;
   for (var j = 0; j < urlCount; j++)
   {
    if (urlCarrierArray[j] == undefined || urlCarrierArray[j] == "")
     continue;
    if (regexCarrierArray[i].toLowerCase() == urlCarrierArray[j].toLowerCase())
    {
     foundMatch=true;
     break;
    }
   }
   if (!foundMatch)
   {
    alert("Please make sure an entry for Carrier \"" + regexCarrierArray[i] + "\" is included in the Service URLs list!\nIf a carrier is listed in the Tracking Number Detections list, it must have a valid Service URL.");
    return false;
   }
  }
  TrackPackage_prefs.tpPrefs.setCharPref("tpURL", urlPref);
  TrackPackage_prefs.tpPrefs.setCharPref("tpRegex", regexPref);
  TrackPackage_prefs.observerService.notifyObservers(null, "trackpackage-settings", "changed");
  return true;
 },
 tpAddNewRegex: function()
 {
  var regexListbox = document.getElementById("regexListbox");
  var row          = document.createElement('listitem');
  var carrierCell  = document.createElement('textbox');
  var regexCell    = document.createElement('textbox');
  row.setAttribute('allowevents', true);
  carrierCell.setAttribute('value', "");
  regexCell.setAttribute('value', "");
  row.appendChild(carrierCell);
  row.appendChild(regexCell);
  regexListbox.appendChild(row);
 },
 tpDeleteRegex: function()
 {
  var regexListbox = document.getElementById("regexListbox");
  regexListbox.removeItemAt(regexListbox.selectedIndex);
 },
 tpAddNewURL: function()
 {
  var urlListbox   = document.getElementById("urlListbox");
  var row          = document.createElement('listitem');
  var carrierCell  = document.createElement('textbox');
  var urlFrontCell = document.createElement('textbox');
  var urlBackCell  = document.createElement('textbox');
  row.setAttribute('allowevents', true);
  carrierCell.setAttribute('value', "");
  urlFrontCell.setAttribute('value', "");
  urlBackCell.setAttribute('value', "");
  row.appendChild(carrierCell);
  row.appendChild(urlFrontCell);
  row.appendChild(urlBackCell);
  urlListbox.appendChild(row);
 },
 tpDeleteURL: function()
 {
  var urlListbox = document.getElementById("urlListbox");
  urlListbox.removeItemAt(urlListbox.selectedIndex);
 },
 tpResetRegexDefaults: function()
 {
  if(!confirm("Are you sure you want to reset the Tracking Number Detections to default? This cannot be undone!"))
   return;
  TrackPackage_prefs.tpPrefs.setCharPref("tpRegex", TrackPackage_functionLib.regexDefaults);
  var regexListbox = document.getElementById("regexListbox");
  var numElements = regexListbox.getRowCount();
  for (var index = 0; index < numElements; index++)
  {
   regexListbox.removeItemAt(0);
  }
  var regexesArray = TrackPackage_functionLib.regexDefaults.split(";");
  for (var i = 0; i < regexesArray.length; i++)
  {
   var carrierRegex = TrackPackage_functionLib.tpExtractQuotedStrings(regexesArray[i]);
   var row          = document.createElement('listitem');
   var carrierCell  = document.createElement('textbox');
   var regexCell    = document.createElement('textbox');
   row.setAttribute('allowevents', true);
   carrierCell.setAttribute('value', carrierRegex[0] );
   regexCell.setAttribute('value', carrierRegex[1] );
   row.appendChild(carrierCell);
   row.appendChild(regexCell);
   regexListbox.appendChild(row);
  }
 },
 tpResetURLDefaults: function()
 {
  if(!confirm("Are you sure you want to reset the Service URLs to default? This cannot be undone!"))
   return;
  TrackPackage_prefs.tpPrefs.setCharPref("tpURL", TrackPackage_functionLib.URLDefaults);
  var urlListbox  = document.getElementById("urlListbox");
  var numElements = urlListbox.getRowCount();
  for (var index = 0; index < numElements; index++)
  {
   urlListbox.removeItemAt(0);
  }
  var urlArray = TrackPackage_functionLib.URLDefaults.split(";");
  for (var i = 0; i < urlArray.length; i++)
  {
   var carrierURL   = TrackPackage_functionLib.tpExtractQuotedStrings(urlArray[i]);
   var row          = document.createElement('listitem');
   var carrierCell  = document.createElement('textbox');
   var urlFrontCell = document.createElement('textbox');
   var urlBackCell  = document.createElement('textbox');
   row.setAttribute('allowevents', true);
   carrierCell.setAttribute('value', carrierURL[0] );
   urlFrontCell.setAttribute('value', carrierURL[1] );
   urlBackCell.setAttribute('value', carrierURL[2] );
   row.appendChild(carrierCell);
   row.appendChild(urlFrontCell);
   row.appendChild(urlBackCell);
   urlListbox.appendChild(row);
  }
 },
 tpSaveXML: function()
 {
  const nsIFilePicker = Components.interfaces.nsIFilePicker;
  var filePicker   = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  filePicker.init(window, "Save As", filePicker.modeSave);
  filePicker.appendFilters(nsIFilePicker.filterXML);
  filePicker.defaultExtension = "xml";
  filePicker.defaultString = "customXML";
  var result = filePicker.show();
  if(result == filePicker.returnOK || result == filePicker.returnReplace)
  {
   var finalXML = "<?xml version=\"1.0\"?>\n\n";
   finalXML += "<trackpackage>\n\n";
   var regexURLArray = TrackPackage_functionLib.tpGetRegexURLArray();
   for (var i = 0; i < regexURLArray.length; i++)
   {
    if (regexURLArray[i][1] == "")
     continue;
    finalXML += "\t<regex carrier=\"" + regexURLArray[i][0] + "\" value=\"" + regexURLArray[i][1] + "\" />\n";
   }
   finalXML += "\n";
   for (var i = 0; i < regexURLArray.length; i++)
   {
    finalXML += "\t<url carrier=\"" + regexURLArray[i][0] + "\" front=\"" + regexURLArray[i][2] + "\" back=\"" + regexURLArray[i][3] + "\" />\n";
   }
   finalXML += "\n";
   finalXML += "</trackpackage>\n";
   var regex = new RegExp("&","gi");
   finalXML = finalXML.replace(regex,"&amp;");
   var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
   var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
   file.initWithPath(filePicker.file.path);
   foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
   foStream.write(finalXML, finalXML.length);
   foStream.close();
  }
 },
 xmlLoadError: function()
 {
  alert("Error loading XML file. Check the URL or try again later.");
 },
 processXML: function(xmlDoc)
 {
  if (!TrackPackage_prefs.tpXMLObject.responseXML)
  {
   TrackPackage_prefs.xmlLoadError();
   return;
  }
  var rootNode = TrackPackage_prefs.tpXMLObject.responseXML.firstChild;
  if (!rootNode)
  {
   TrackPackage_prefs.xmlLoadError()
   return;
  }
  if (rootNode.nodeName == "parsererror")
  {
   TrackPackage_prefs.xmlLoadError()
   return;
  }
  var nodes      = rootNode.childNodes;
  var regexArray = new Array();
  var urlArray   = new Array();
  for (var i = 0; i < nodes.length; i++)
  {
   var node = nodes.item(i);
   var name = node.nodeName;
   if (name == "regex")
   {
    var carrier = node.getAttribute("carrier");
    var value   = node.getAttribute("value");
    regexArray[regexArray.length] = "\"" + carrier + "\",\"" + value + "\"";
   }
   if (name == "url")
   {
    var carrier = node.getAttribute("carrier");
    var front   = node.getAttribute("front");
    var back    = node.getAttribute("back");
    urlArray[urlArray.length] = "\"" + carrier + "\",\"" + front + "\",\"" + back + "\"";
   }
  }
  var finalRegexString = regexArray.join(";");
  var finalURLString   = urlArray.join(";");
  TrackPackage_prefs.tpPrefs.setCharPref("tpRegex", finalRegexString);
  TrackPackage_prefs.tpPrefs.setCharPref("tpURL", finalURLString);
  var regexListbox = document.getElementById("regexListbox");
  var numElements  = regexListbox.getRowCount();
  for (var index = 0; index < numElements; index++)
  {
   regexListbox.removeItemAt(0);
  }
  var urlListbox  = document.getElementById("urlListbox");
  var numElements = urlListbox.getRowCount();
  for (var index = 0; index < numElements; index++)
  {
   urlListbox.removeItemAt(0);
  }
  TrackPackage_prefs.tpLoadSettings();
  alert("Successfully loaded remote XML preferences!");
 },
 tpUpdateDefs: function()
 {
  if(!confirm("Are you sure you want to update definitions from the Internet?\nThis will overwrite all your current Tracking Number Definitions and Service URLs and cannot be undone."))
   return;
  var xmldoc = document.implementation.createDocument("", "", null);
  xmldoc.addEventListener("load", function(event){TrackPackage_prefs.processXML(event.currentTarget)}, false);
  var req = new XMLHttpRequest();
  TrackPackage_prefs.tpXMLObject = req;
  req.open('GET', document.getElementById("tpUpdateURL").value, false);
  req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
  req.onload = TrackPackage_prefs.processXML;
  req.onerror = TrackPackage_prefs.xmlLoadError;
  req.send(null);
 }
};
