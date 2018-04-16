// Copyright Dave Kahler. Do not copy without permission.
if(!com) var com={};
if(!com.dakahler) com.dakahler={};
if(!com.dakahler.tp) com.dakahler.tp={};
if(!com.dakahler.tp.functionLib) com.dakahler.tp.functionLib={};
com.dakahler.tp.functionLib =
{
 regexDefaults: "\"USPS\",\"((94001|92055|94073|93033|92701|92088|92021)(\\d{15}))|((9400 1|9205 5|9407 3|9303 3|9270 1|9208 8|9202 1)\\d{3} \\d{4} \\d{4} \\d{4} \\d{2})|((82)\\d{8})|((82) \\d{3} \\d{3} \\d{2})|((EC|EA|CP|RA|EL|LZ)(\\d{9})US)|((EC|EA|CP|RA|EL|LZ)( \\d{3} \\d{3} \\d{3}) US)\";\"UPS\",\"(1Z\\w{16})|(\\d{12})|((T|W|H)\\d{10})|(\\d{9})\";\"FedEx\",\"((\\d{22})|(\\d{20})|(\\d{15})|(\\d{14})|(\\d{12}))\"",
 URLDefaults: "\"USPS\",\"https://tools.usps.com/go/TrackConfirmAction_input?tLabels=\",\"\";\"UPS\",\"http://wwwapps.ups.com/etracking/tracking.cgi?InquiryNumber1=\",\"&TypeOfInquiryNumber=T&AcceptUPSLicenseAgreement=yes&submit=Track\";\"FedEx\",\"https://www.fedex.com/apps/fedextrack/?action=track&tracknumbers=\",\"&locale=en_US&cntry_code=us\"",
 gInThunderbird: false,
 gHasThunderbrowse: false,
 tpRemoveSpaces: function(myString)
 {
  var newString = "";
  var i;
  myString = myString.toString();
  for (i = 0; i < myString.length; i++)
  {
   if ((myString.charAt(i) != " ") && (myString.charAt(i) != ".") && (myString.charAt(i) != ","))
    newString += myString.charAt(i);
  }
  return(newString);
 },
 tpTrackPackage: function()
 {
  var trackingString = com.dakahler.tp.functionLib.tpGetTrackingString();
  var carrier;
  if (com.dakahler.tp.functionLib.tpGetSmartSenseSetting() || com.dakahler.tp.functionLib.gInThunderbird)
  {
   carrier = com.dakahler.tp.functionLib.tpGetPackageCarrier(trackingString);
   var title = carrier + ": " + trackingString;
   com.dakahler.tp.functionLib.tpOpenPackageWindow(com.dakahler.tp.functionLib.tpGetPackageURL(carrier, trackingString, true), false, true, title);
  }
  else
  {
   com.dakahler.tp.functionLib.tpOpenPackageWindow("", false, true, "");
  }
 },
 tpTrackGoogleMaps: function()
 {
  var trackingString = com.dakahler.tp.functionLib.tpGetTrackingString();
  var carrierOrig = com.dakahler.tp.functionLib.tpGetPackageCarrier(trackingString);
  var carrier = carrierOrig.toLowerCase();
  var gmapsURL = "http://www.packagemapping.com?action=track&shipper=" + carrier + "&tracknum=" + trackingString;
  if (carrier.length)
  {
   com.dakahler.tp.functionLib.tpOpenPackageWindow(gmapsURL, false, false, "");
   com.dakahler.tp.functionLib.tpAddToHistory(carrierOrig, trackingString);
  }
 },
 tpHistoryOpenMap: function(carrier, trackingString, forceTabs)
 {
  var gmapsURL = "http://www.packagemapping.com?action=track&shipper=" + carrier + "&tracknum=" + trackingString;
  if (carrier.length)
  {
   com.dakahler.tp.functionLib.tpOpenPackageWindow(gmapsURL, forceTabs, false);
  }
 },
 tpButtonCallback: function(notification, button)
 {
  var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
  for (var i = 0;i < regexURLArray.length; i++)
  {
   var carrier = regexURLArray[i][0];
   if (carrier == button.label)
   {
    var title = carrier + ": " + notification.value;
    com.dakahler.tp.functionLib.tpOpenPackageWindow(com.dakahler.tp.functionLib.tpGetPackageURL(carrier, notification.value, true), false, false, title);
   }
  }
 },
 tpOnBlur: function(event)
 {
  var notifyBox = gBrowser.getNotificationBox();
  var allNotifications = notifyBox.allNotifications;
  for (var i = 0; i < allNotifications.length; i++)
  {
   var item = allNotifications[i];
   if (item.label.match("Track Package") || item.label.match("Tracked Package"))
   {
    item.close();
   }
  }
 },
 tpOpenPackageWindow: function(URLString, forceTabs, offerCorrection, title)
 {
  if (URLString != "")
  {
   if (com.dakahler.tp.functionLib.gInThunderbird)
   {
    if (!com.dakahler.tp.functionLib.gHasThunderbrowse || !com.dakahler.tp.functionLib.tpGetThunderbrowseSetting())
    {
     var messenger = Components.classes["@mozilla.org/messenger;1"].createInstance();         
     messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
     messenger.launchExternalURL(URLString);
    }
    else
    {
     browsetothrufield(URLString,null,null,null,null);
    }
   }
   else
   {
    if (!com.dakahler.tp.functionLib.tpGetTabSetting() && !forceTabs)
    {
     var newWindow = window.open(URLString);
    }
    else
    {
     if (!forceTabs)
     {
      openNewTabWith(URLString, null, null, null, false, null);
     }
     else
     {
      window.opener.gBrowser.loadOneTab(URLString,
      {
       referrerURI: null,
       charset: null,
       postData: null,
       inBackground: true,
       allowThirdPartyFixup: false,
       relatedToCurrent: false,
       isUTF8: true
      });
     }
     if (typeof getBrowser == 'function')
     {
      var container = getBrowser().tabContainer;
      container.addEventListener("TabSelect", com.dakahler.tp.functionLib.tpOnBlur, false);
     }
    }
    if (offerCorrection)
    {
     com.dakahler.tp.functionLib.tpShowNotificationBox(false);
    }
   }
  }
  else
  {
   com.dakahler.tp.functionLib.tpShowNotificationBox(true);
  }
 },
 tpShowNotificationBox: function(firstTry)
 {
  if (!com.dakahler.tp.functionLib.gInThunderbird)
  {
   var notifyBox = gBrowser.getNotificationBox();
   var allNotifications = notifyBox.allNotifications;
   for (var i = 0; i < allNotifications.length; i++)
   {
    var item = allNotifications[i];
    if (item.label.match("Track Package") || item.label.match("Tracked Package"))
    {
     item.close();
    }
   }
   var buttons = new Array();
   var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
   for (var i = 0; i < regexURLArray.length; i++)
   {
    var carrier = regexURLArray[i][0];
    buttons[i] = 
    {
     label: carrier,
     accessKey: null,
     callback: com.dakahler.tp.functionLib.tpButtonCallback
    };
   }
   if (com.dakahler.tp.functionLib.tpGetNotificationsSetting() || firstTry)
   {
    var originalTrackingString = com.dakahler.tp.functionLib.tpGetTrackingString();
    var notifyBox = gBrowser.getNotificationBox();
    var notifyText;
    if (firstTry)
    {
     notifyText = "Track Package - Choose Carrier";
    }
    else
    {
     notifyText = "Tracked Package via " + com.dakahler.tp.functionLib.tpGetPackageCarrier(originalTrackingString) + ". Fix Carrier?";
    }
    notifyBox.appendNotification(notifyText, originalTrackingString, "chrome://trackpackage/skin/icon.png", notifyBox.PRIORITY_INFO_HIGH, buttons);
   }
  }
 },
 searchSelected: function()
 {
  var node = document.popupNode;
  var selection = "";
  if ((node instanceof HTMLTextAreaElement) || (node instanceof HTMLInputElement && node.type == "text"))
  {
   selection = node.value.substring(node.selectionStart, node.selectionEnd);
  } 
  else
  {
   var focusedWindow = new XPCNativeWrapper(document.commandDispatcher.focusedWindow, 'document', 'getSelection()');
   selection = focusedWindow.getSelection().toString();
  }
  var searchStr = selection;
  searchStr = searchStr.toString();
  searchStr = searchStr.replace( /^\s+/, "" );
  searchStr = searchStr.replace(/(\n|\r|\t)+/g, " ");
  searchStr = searchStr.replace(/\s+$/,"");
  return searchStr;
 },
 tpGetTrackingString: function()
 {
  var trackingString = "";
  if (!com.dakahler.tp.functionLib.gInThunderbird)
  {
   trackingString = com.dakahler.tp.functionLib.tpRemoveSpaces(com.dakahler.tp.functionLib.searchSelected());
  }
  else
  {
   if ((typeof gContextMenu == 'object') && gContextMenu.searchSelected)
   {
    trackingString = com.dakahler.tp.functionLib.tpRemoveSpaces(gContextMenu.searchSelected(40));
   }
   else if (typeof getBrowserSelection == 'function')
   {
    trackingString = com.dakahler.tp.functionLib.tpRemoveSpaces(getBrowserSelection(40));
   }
   else
   {
    trackingString = com.dakahler.tp.functionLib.tpRemoveSpaces(window._content.getSelection());
   }
  }
  return(trackingString);
 },
 tpGetPackageCarrier: function(trackingString)
 {
  var historyArray = com.dakahler.tp.functionLib.tpGetHistoryArray();
  for (var i = 0; i < historyArray.length; i++)
  {
   if (historyArray[i]['TrackingNumber'] == trackingString)
   {
    return historyArray[i]['Carrier'];
   }
  }
  var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
  var carrier;
  for (var i = 0; i < regexURLArray.length; i++)
  {
   if (regexURLArray[i][1] == "")
    continue;
   var regex = new RegExp(regexURLArray[i][1], "gi");
   if (regex.test(trackingString))
   {
    carrier = regexURLArray[i][0];
    break;
   }
  }
  return carrier;
 },
 tpGetPackageURL: function(carrier,trackingString,addToHistory)
 {
  if (trackingString == "")
   return("");
  if (carrier == undefined)
  {
   carrier = "";
  }
  var windowURL = "";
  var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
  for (var i = 0; i < regexURLArray.length; i++)
  {
   if (regexURLArray[i][1] == "" && carrier.length == 0)
    continue;
   var regex = new RegExp(regexURLArray[i][1],"gi");
   if ((carrier.length == 0 && regex.test(trackingString)) || (carrier.toLowerCase() == regexURLArray[i][0].toLowerCase()))
   {
    carrier = regexURLArray[i][0];
    windowURL = regexURLArray[i][2] + trackingString + regexURLArray[i][3];
    break;
   }
  }
  if (addToHistory)
   com.dakahler.tp.functionLib.tpAddToHistory(carrier, trackingString);
  return(windowURL);
 },
 tpGetTabSetting: function()
 {
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  if(myTPPrefs.prefHasUserValue("tpCheckBox"))
   return(myTPPrefs.getBoolPref("tpCheckBox"));
  return true;
 },
 tpGetSmartSenseSetting: function()
 {
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  if(myTPPrefs.prefHasUserValue("tpSmartSense"))
   return(myTPPrefs.getBoolPref("tpSmartSense"));
  return true;
 },
 tpGetNotificationsSetting: function()
 {
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  if(myTPPrefs.prefHasUserValue("tpNotifications"))
   return(myTPPrefs.getBoolPref("tpNotifications"));
  return true;
 },
 tpGetPrivateBrowsingSetting: function()
 {
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  if(myTPPrefs.prefHasUserValue("tpPrivateBrowsing"))
   return(myTPPrefs.getBoolPref("tpPrivateBrowsing"));
  return true;
 },
 tpGetThunderbrowseSetting: function()
 {
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  if(myTPPrefs.prefHasUserValue("tpUseThunderbrowse"))
   return(myTPPrefs.getBoolPref("tpUseThunderbrowse"));
  return true;
 },
 tpGetGMapsSetting: function()
 {
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  if(myTPPrefs.prefHasUserValue("tpEnableGMaps"))
   return(myTPPrefs.getBoolPref("tpEnableGMaps"));
  return false;
 },
 tpOpenHistory: function()
 {
  var win = window.open("chrome://trackpackage/content/history.xul", "trackinghistory", "chrome=yes,resizable=yes,centerscreen=yes,scrollbars=yes,width=720,height=600,");
  win.focus();
  win.onunload = com.dakahler.tp.functionLib.tpRebuildDropdown;
 },
 tpAddToHistory: function(carrier,trackingString)
 {
  if (com.dakahler.tp.functionLib.tpGetPrivateBrowsingSetting() && com.dakahler.tp.functionLib.tpIsInPrivateBrowsingMode())
   return;
  var now = new Date();
  var finalDate = (now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear();
  var finalString;
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  var currentHistoryString = "";
  if (myTPPrefs.prefHasUserValue("tpTrackingHistory"))
   currentHistoryString = myTPPrefs.getCharPref("tpTrackingHistory");
  var maxNumbersAllowed = 25;
  if (myTPPrefs.prefHasUserValue("tpMaxNumbers"))
   maxNumbersAllowed = myTPPrefs.getIntPref("tpMaxNumbers");
  var numExistingNumbers = currentHistoryString.split(";").length;
  if (numExistingNumbers == maxNumbersAllowed)
  {
   var lastIndex = currentHistoryString.lastIndexOf(";");
   currentHistoryString = currentHistoryString.substring(0, lastIndex);
  }
  var trackingStringIndex = currentHistoryString.indexOf(trackingString + ",");
  if (trackingStringIndex != -1)
  {
   for (var i = trackingStringIndex - 2; i >= 0; i--)
   {
    if (currentHistoryString[i] == ';')
    {
     break;
    }
   }
   for (var j = trackingStringIndex; j < currentHistoryString.length; j++)
   {
    if (currentHistoryString[j] == ',')
    {
     break;
    }
   }
   i++;
   finalString = currentHistoryString.replace(currentHistoryString.substr(i, j - i), carrier + "," + trackingString)
  }
  else
  {
   if (currentHistoryString.length > 0)
   {
    finalString = carrier + "," + trackingString + "," + finalDate + ";" + currentHistoryString;
   }
   else
   {
    finalString = carrier + "," + trackingString + "," + finalDate;
   }
  }
  myTPPrefs.setCharPref("tpTrackingHistory", finalString);
  com.dakahler.tp.functionLib.tpRebuildDropdown();
 },
 tpAllIndicesOf: function(character, string)
 {
  var finalArray = new Array();
  for (var i = 0; i < string.length; i++)
  {
   if (string[i] == character)
   {
    finalArray[finalArray.length] = i;
   }
  }
  return(finalArray);
 },
 tpExtractQuotedStrings: function(string)
 {
  var quoteIndices = com.dakahler.tp.functionLib.tpAllIndicesOf("\"", string);
  if (quoteIndices.length % 2 != 0)
  {
   alert("Malformed preference! Contact webmaster@realityripple.com");
   return("");
  }
  var finalArray = new Array();
  for (var i = 0; i < quoteIndices.length; i += 2)
  {
   var thisQuote = string.substring(quoteIndices[i]+1, quoteIndices[i+1]);
   finalArray[finalArray.length] = thisQuote;
  }
  return(finalArray);
 },
 tpGetRegexURLArray: function()
 {
  var tpPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  var regexesArray = com.dakahler.tp.functionLib.regexDefaults.split(";");
  if (tpPrefs.prefHasUserValue("tpRegex"))
   regexesArray = tpPrefs.getCharPref("tpRegex").split(";");
  var finalArray = new Array();
  for (var i = 0; i < regexesArray.length; i++)
  {
   var carrierRegex = com.dakahler.tp.functionLib.tpExtractQuotedStrings(regexesArray[i]);
   var currentIndex = finalArray.length;
   finalArray[currentIndex] = new Array();
   finalArray[currentIndex][0] = carrierRegex[0];
   finalArray[currentIndex][1] = carrierRegex[1];
  }
  var urlArray =com.dakahler.tp.functionLib.URLDefaults.split(";");
  if (tpPrefs.prefHasUserValue("tpURL"))
   urlArray = tpPrefs.getCharPref("tpURL").split(";");
  for (var i = 0; i < urlArray.length; i++)
  {
   var carrierURL = com.dakahler.tp.functionLib.tpExtractQuotedStrings(urlArray[i]);
   var foundRegexMatch = false;
   for (var j = 0; j < finalArray.length; j++)
   {
    if (finalArray[j][0].toLowerCase() == carrierURL[0].toLowerCase())
    {
     finalArray[j][2] = carrierURL[1];
     finalArray[j][3] = carrierURL[2];
     foundRegexMatch = true;
    }
   }
   if (!foundRegexMatch)
   {
    var currentIndex = finalArray.length;
    finalArray[currentIndex] = new Array();
    finalArray[currentIndex][0] = carrierURL[0];
    finalArray[currentIndex][1] = "";
    finalArray[currentIndex][2] = carrierURL[1];
    finalArray[currentIndex][3] = carrierURL[2];
   }
  }
  return(finalArray);
 },
 tpIsInPrivateBrowsingMode: function()
 {
  if (!com.dakahler.tp.functionLib.gInThunderbird)
  {
   let pbService;
   let PrivateBrowsingUtils;
   try
   {
    pbService = Cc["@mozilla.org/privatebrowsing;1"].getService(Ci.nsIPrivateBrowsingService);
    if (!('privateBrowsingEnabled' in pbService))
     pbService = undefined;
   }
   catch(e) { }
   try
   {
    PrivateBrowsingUtils = Cu.import('resource://gre/modules/PrivateBrowsingUtils.jsm', {}).PrivateBrowsingUtils;
   }
   catch(e) { }
   let isGlobalPBSupported = !!pbService;
   let isWindowPBSupported = !isGlobalPBSupported && !!PrivateBrowsingUtils;
   if (isWindowPBSupported)
    return PrivateBrowsingUtils.isWindowPrivate(document.commandDispatcher.focusedWindow);
   else if (isGlobalPBSupported)
    return true;
  }
  return false;
 },
 tpGetHistoryArray: function()
 {
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  
  var historyString = "";
  if (myTPPrefs.prefHasUserValue("tpTrackingHistory"))
   historyString = myTPPrefs.getCharPref("tpTrackingHistory");
  var historySplit = historyString.split(";");
  var historyArray = new Array();
  if (historyString.length > 0)
  {
   for (var index=0;index<historySplit.length;index++)
   {
    var rowString = historySplit[index];
    var rowArray = rowString.split(",");
    historyArray[index] = new Array();
    historyArray[index]['Carrier'] = rowArray[0];
    historyArray[index]['TrackingNumber'] = rowArray[1];
    historyArray[index]['Date'] = rowArray[2];
    historyArray[index]['Notes'] = rowArray[3];
   }
  }
  return historyArray;
 },
 tpRebuildDropdown: function()
 {
  var buttonMenu = document.getElementById("tpbuttonmenu");
  var targetMenu = document.getElementById("toolbarMenuPopup");
  if (typeof(buttonMenu) !== 'undefined' && buttonMenu != null)
  {
   var child = buttonMenu.firstChild;
   while (child)
   {
    var nextSibling =  child.nextSibling;
    if (child != targetMenu)
    {
     buttonMenu.removeChild(child);
    }
    child = nextSibling;
   }
   while (targetMenu.firstChild)
   {
    targetMenu.removeChild(targetMenu.firstChild);
   }
   var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
   var maxNumbersAllowed = 5;
   if (myTPPrefs.prefHasUserValue("tpMaxDropdownItems"))
    maxNumbersAllowed = myTPPrefs.getIntPref("tpMaxDropdownItems");
   var tempArray = com.dakahler.tp.functionLib.tpGetHistoryArray();
   if (tempArray.length == 0)
   {
    buttonMenu.type = "button";
    var menuitem = document.createElement('menuitem');
    menuitem.setAttribute('label', "Tracking History");
    buttonMenu.label = "";
    buttonMenu.appendChild(menuitem);
    buttonMenu.minwidth = 125;
    return;
   }
   buttonMenu.minwidth = 250;
   if (tempArray.length == 1)
    buttonMenu.type = "button";
   else
    buttonMenu.type = "menu-button";
   for (var index = 0; index < tempArray.length; index++)
   {
    var myLabel = tempArray[index].Carrier + ": " + tempArray[index].TrackingNumber;
    var uniqueNote = true;
    if (tempArray[index].Notes == undefined || tempArray[index].Notes == "")
     uniqueNote = false;
    else
    {
     for (var idx = 0; idx < tempArray.length; idx++)
     {
      if (idx == index)
       continue;
      if (tempArray[idx].Notes == undefined || tempArray[idx].Notes == "")
       continue;
      if (tempArray[index].Notes.toLowerCase() == tempArray[idx].Notes.toLowerCase())
      {
       uniqueNote = false;
       break;
      }
     }
    }
    if (uniqueNote)
     myLabel = tempArray[index].Notes;
    var menuitem = document.createElement('menuitem');
    menuitem.setAttribute('label', myLabel);
    menuitem.historyInfo = tempArray[index];
    if (index == 0)
    {
     buttonMenu.label = "";
     buttonMenu.appendChild(menuitem);
    }
    else
    {
     targetMenu.appendChild(menuitem);
    }
    if (index == maxNumbersAllowed - 1)
     break;
   }
  }
 }
}
