// Copyright Dave Kahler. Do not copy without permission.
if(!com) var com={};
if(!com.dakahler) com.dakahler={};
if(!com.dakahler.tp) com.dakahler.tp={};
if(!com.dakahler.tp.prefs) com.dakahler.tp.prefs={};
com.dakahler.tp.prefs =
{
 tpPrefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage."),
 observerService: Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService),
 tpXMLObject: null,
 tpLoadCheckSetting: function(pref, def)
 {
  if (com.dakahler.tp.prefs.tpPrefs.prefHasUserValue(pref))
   document.getElementById(pref).setAttribute("checked", com.dakahler.tp.prefs.tpPrefs.getBoolPref(pref));
  else
   document.getElementById(pref).setAttribute("checked", def);
 },
 tpLoadIntValueSetting: function(pref, def)
 {
  if (com.dakahler.tp.prefs.tpPrefs.prefHasUserValue(pref))
   document.getElementById(pref).value = com.dakahler.tp.prefs.tpPrefs.getIntPref(pref);
  else
   document.getElementById(pref).value = def;
 },
 tpLoadCharValueSetting: function(pref, def)
 {
  if (com.dakahler.tp.prefs.tpPrefs.prefHasUserValue(pref))
   document.getElementById(pref).setAttribute("value", com.dakahler.tp.prefs.tpPrefs.getCharPref(pref));
  else
   document.getElementById(pref).setAttribute("value", def);
 },
 tpLoadSettings: function()
 {
  const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
  if (appInfo.ID == THUNDERBIRD_ID)
   com.dakahler.tp.functionLib.gInThunderbird = true;
  else
   com.dakahler.tp.functionLib.gInThunderbird = false;
  com.dakahler.tp.prefs.tpLoadCheckSetting("tpCheckBox", true);
  com.dakahler.tp.prefs.tpLoadCheckSetting("tpSmartSense", true);
  com.dakahler.tp.prefs.tpLoadCheckSetting("tpNotifications", true);
  com.dakahler.tp.prefs.tpLoadCheckSetting("tpPrivateBrowsing", true);
  com.dakahler.tp.prefs.tpLoadCheckSetting("tpUseThunderbrowse", true);
  com.dakahler.tp.prefs.tpLoadIntValueSetting("tpMaxNumbers", 25);
  com.dakahler.tp.prefs.tpLoadIntValueSetting("tpMaxDropdownItems", 5);
  com.dakahler.tp.prefs.tpLoadCheckSetting("tpEnableGMaps", false);
  com.dakahler.tp.prefs.tpLoadCharValueSetting("tpUpdateURL", "https://realityripple.com/Software/Mozilla-Extensions/Track-Package/defaults.xml");
  if (!com.dakahler.tp.functionLib.gInThunderbird)
  {
   document.getElementById("tpUseThunderbrowse").style.visibility = 'hidden';
   document.getElementById("tpUseThunderbrowse").style.display = 'none';
  }
  var regexesArray = com.dakahler.tp.functionLib.regexDefaults.split(";");
  if (com.dakahler.tp.prefs.tpPrefs.prefHasUserValue("tpRegex"))
   regexesArray = com.dakahler.tp.prefs.tpPrefs.getCharPref("tpRegex").split(";");
  var regexListbox = document.getElementById("regexListbox");
  for (var i = 0; i < regexesArray.length; i++)
  {
   var carrierRegex = com.dakahler.tp.functionLib.tpExtractQuotedStrings(regexesArray[i]);
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
  var urlArray = com.dakahler.tp.functionLib.URLDefaults.split(";");
  if (com.dakahler.tp.prefs.tpPrefs.prefHasUserValue("tpURL"))
   urlArray = com.dakahler.tp.prefs.tpPrefs.getCharPref("tpURL").split(";");
  var urlListbox = document.getElementById("urlListbox");
  for (var i=0;i<urlArray.length;i++)
  {
   var carrierURL = com.dakahler.tp.functionLib.tpExtractQuotedStrings(urlArray[i]);
   if (carrierURL == "")
    return;
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
  com.dakahler.tp.prefs.tpPrefs.setBoolPref("tpCheckBox", document.getElementById("tpCheckBox").checked);
  com.dakahler.tp.prefs.tpPrefs.setBoolPref("tpSmartSense", document.getElementById("tpSmartSense").checked);
  com.dakahler.tp.prefs.tpPrefs.setBoolPref("tpNotifications", document.getElementById("tpNotifications").checked);
  com.dakahler.tp.prefs.tpPrefs.setBoolPref("tpPrivateBrowsing", document.getElementById("tpPrivateBrowsing").checked);
  com.dakahler.tp.prefs.tpPrefs.setBoolPref("tpUseThunderbrowse", document.getElementById("tpUseThunderbrowse").checked);
  com.dakahler.tp.prefs.tpPrefs.setIntPref("tpMaxNumbers", document.getElementById("tpMaxNumbers").value);
  com.dakahler.tp.prefs.tpPrefs.setIntPref("tpMaxDropdownItems", document.getElementById("tpMaxDropdownItems").value);
  com.dakahler.tp.prefs.tpPrefs.setBoolPref("tpEnableGMaps", document.getElementById("tpEnableGMaps").checked);
  com.dakahler.tp.prefs.tpPrefs.setCharPref("tpUpdateURL", document.getElementById("tpUpdateURL").value);
  var myListbox = document.getElementById("regexListbox");
  var regexPrefArray = new Array();
  var regexCarrierArray = new Array();
  for (var index = 0; index < myListbox.getRowCount(); index++)
  {
   var item    = myListbox.getItemAtIndex(index);
   var nodes   = item.childNodes;
   var carrier = nodes.item(0).value;
   var regex   = nodes.item(1).value;  
   regexPrefArray[regexPrefArray.length] = "\"" + carrier + "\"" + "," + "\"" + regex + "\"";
   regexCarrierArray[regexCarrierArray.length] = carrier;
  }
  var regexPref = regexPrefArray.join(";");
  myListbox = document.getElementById("urlListbox");
  var urlPrefArray    = new Array();
  var urlCarrierArray = new Array();
  for (var index = 0; index < myListbox.getRowCount(); index++)
  {
   var item     = myListbox.getItemAtIndex(index);
   var nodes    = item.childNodes;
   var carrier  = nodes.item(0).value;
   var urlFront = nodes.item(1).value;
   var urlBack  = nodes.item(2).value;
   urlPrefArray[urlPrefArray.length] = "\"" + carrier + "\"" + "," + "\"" + urlFront + "\"" + "," + "\"" + urlBack + "\"";
   urlCarrierArray[urlCarrierArray.length] = carrier;
  }
  var urlPref = urlPrefArray.join(";");
  for (var i = 0; i < regexCarrierArray.length; i++)
  {
   var foundMatch = false;
   for (var j = 0; j < urlCarrierArray.length; j++)
   {
    if (regexCarrierArray[i].toLowerCase() == urlCarrierArray[j].toLowerCase())
    {
     foundMatch=true;
     break;
    }
   }
   if (!foundMatch)
   {
    alert("Service URL match for Tracking Number Detection not found for Carrier " + regexCarrierArray[i] + "!");
    return false;
   }
  }
  com.dakahler.tp.prefs.tpPrefs.setCharPref("tpURL", urlPref);
  com.dakahler.tp.prefs.tpPrefs.setCharPref("tpRegex", regexPref);
  com.dakahler.tp.prefs.observerService.notifyObservers(null, "trackpackage-settings", "changed");
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
  com.dakahler.tp.prefs.tpPrefs.setCharPref("tpRegex", com.dakahler.tp.functionLib.regexDefaults);
  var regexListbox = document.getElementById("regexListbox");
  var numElements = regexListbox.getRowCount();
  for (var index = 0;index < numElements; index++)
  {
   regexListbox.removeItemAt(0);
  }
  var regexesArray = com.dakahler.tp.functionLib.regexDefaults.split(";");
  for (var i = 0; i < regexesArray.length; i++)
  {
   var carrierRegex = com.dakahler.tp.functionLib.tpExtractQuotedStrings(regexesArray[i]);
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
  com.dakahler.tp.prefs.tpPrefs.setCharPref("tpURL", com.dakahler.tp.functionLib.URLDefaults);
  var urlListbox  = document.getElementById("urlListbox");
  var numElements = urlListbox.getRowCount();
  for (var index = 0;index < numElements; index++)
  {
   urlListbox.removeItemAt(0);
  }
  var urlArray = com.dakahler.tp.functionLib.URLDefaults.split(";");
  for (var i = 0; i < urlArray.length; i++)
  {
   var carrierURL   = com.dakahler.tp.functionLib.tpExtractQuotedStrings(urlArray[i]);
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
 tpUpdateDefs: function()
 {
  if(!confirm("Are you sure you want to update definitions from the Internet?\nThis will overwrite all your current Tracking Number Definitions and Service URLs and cannot be undone."))
   return;
  var xmldoc = document.implementation.createDocument("", "", null);
  xmldoc.addEventListener("load", function(event){com.dakahler.tp.prefs.processXML(event.currentTarget)}, false);
  var req = new XMLHttpRequest();
  com.dakahler.tp.prefs.tpXMLObject = req;
  req.open('GET', document.getElementById("tpUpdateURL").value, false);
  req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
  req.onload = com.dakahler.tp.prefs.processXML;
  req.onerror = com.dakahler.tp.prefs.xmlLoadError;
  req.send(null);
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
   var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
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
  if (!com.dakahler.tp.prefs.tpXMLObject.responseXML)
  {
   com.dakahler.tp.prefs.xmlLoadError();
   return;
  }
  var rootNode = com.dakahler.tp.prefs.tpXMLObject.responseXML.firstChild;
  if (!rootNode)
  {
   com.dakahler.tp.prefs.xmlLoadError()
   return;
  }
  if (rootNode.nodeName == "parsererror")
  {
   com.dakahler.tp.prefs.xmlLoadError()
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
  com.dakahler.tp.prefs.tpPrefs.setCharPref("tpRegex", finalRegexString);
  com.dakahler.tp.prefs.tpPrefs.setCharPref("tpURL", finalURLString);
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
  com.dakahler.tp.prefs.tpLoadSettings();
  alert("Successfully loaded remote XML preferences!");
 }
}
