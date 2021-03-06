// Copyright Dave Kahler. Do not copy without permission.
var TrackPackage_functionLib =
{
 regexDefaults: '"USPS","((94001|92055|94073|93033|92701|92088|92021)(\\d{15}))|((9400 1|9205 5|9407 3|9303 3|9270 1|9208 8|9202 1)\\d{3} \\d{4} \\d{4} \\d{4} \\d{2})|((82)\\d{8})|((82) \\d{3} \\d{3} \\d{2})|((EC|EA|CP|RA|EL|LZ)(\\d{9})US)|((EC|EA|CP|RA|EL|LZ)( \\d{3} \\d{3} \\d{3}) US)";"UPS","(1Z\\w{16})|(\\d{12})|((T|W|H)\\d{10})|(\\d{9})";"FedEx","((\\d{22})|(\\d{20})|(\\d{15})|(\\d{14})|(\\d{12}))"',
 URLDefaults: '"USPS","https://tools.usps.com/go/TrackConfirmAction_input?tLabels=","";"UPS","http://wwwapps.ups.com/etracking/tracking.cgi?InquiryNumber1=","&TypeOfInquiryNumber=T&AcceptUPSLicenseAgreement=yes&submit=Track";"FedEx","https://www.fedex.com/apps/fedextrack/?action=track&tracknumbers=","&locale=en_US&cntry_code=us"',
 gInThunderbird: false,
 gHasThunderbrowse: false,
 _tpRemoveSpaces: function(myString)
 {
  var newString = '';
  var i;
  myString = myString.toString();
  for (i = 0; i < myString.length; i++)
  {
   if ((myString.charAt(i) !== ' ') && (myString.charAt(i) !== '.') && (myString.charAt(i) !== ','))
    newString += myString.charAt(i);
  }
  return(newString);
 },
 tpOnBlur: function(event)
 {
  var notifyBox = gBrowser.getNotificationBox();
  var allNotifications = notifyBox.allNotifications;
  for (var i = 0; i < allNotifications.length; i++)
  {
   var item = allNotifications[i];
   if (item.label.match('Track Package') || item.label.match('Tracked Package'))
   {
    item.close();
   }
  }
 },
 _searchSelected: function()
 {
  var node = document.popupNode;
  var selection = '';
  if ((node instanceof HTMLTextAreaElement) || (node instanceof HTMLInputElement && node.type === 'text'))
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
  searchStr = searchStr.replace( /^\s+/, '' );
  searchStr = searchStr.replace(/(\n|\r|\t)+/g, ' ');
  searchStr = searchStr.replace(/\s+$/,'');
  return searchStr;
 },
 tpGetTabSetting: function()
 {
  var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  if(myTPPrefs.prefHasUserValue('tpCheckBox'))
   return(myTPPrefs.getBoolPref('tpCheckBox'));
  return true;
 },
 tpGetSmartSenseSetting: function()
 {
  var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  if(myTPPrefs.prefHasUserValue('tpSmartSense'))
   return(myTPPrefs.getBoolPref('tpSmartSense'));
  return true;
 },
 _tpGetNotificationsSetting: function()
 {
  var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  if(myTPPrefs.prefHasUserValue('tpNotifications'))
   return(myTPPrefs.getBoolPref('tpNotifications'));
  return true;
 },
 _tpGetPrivateBrowsingSetting: function()
 {
  var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  if(myTPPrefs.prefHasUserValue('tpPrivateBrowsing'))
   return(myTPPrefs.getBoolPref('tpPrivateBrowsing'));
  return true;
 },
 _tpGetThunderbrowseSetting: function()
 {
  var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  if(myTPPrefs.prefHasUserValue('tpUseThunderbrowse'))
   return(myTPPrefs.getBoolPref('tpUseThunderbrowse'));
  return true;
 },
 tpGetGMapsSetting: function()
 {
  var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  if(myTPPrefs.prefHasUserValue('tpEnableGMaps'))
   return(myTPPrefs.getBoolPref('tpEnableGMaps'));
  return false;
 },
 _tpAllIndicesOf: function(character, string)
 {
  var finalArray = [];
  for (var i = 0; i < string.length; i++)
  {
   if (string[i] === character)
   {
    finalArray[finalArray.length] = i;
   }
  }
  return(finalArray);
 },
 _tpGetHistoryArray: function()
 {
  var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  var historyString = '';
  if (myTPPrefs.prefHasUserValue('tpTrackingHistory'))
   historyString = myTPPrefs.getCharPref('tpTrackingHistory');
  var historySplit = historyString.split(';');
  var historyArray = [];
  if (historyString.length > 0)
  {
   for (var index=0;index<historySplit.length;index++)
   {
    var rowString = historySplit[index];
    var rowArray = rowString.split(',');
    historyArray[index] = [];
    historyArray[index].Carrier = rowArray[0];
    historyArray[index].TrackingNumber = rowArray[1];
    historyArray[index].Date = rowArray[2];
    historyArray[index].Notes = rowArray[3];
   }
  }
  return historyArray;
 },
 tpExtractQuotedStrings: function(string)
 {
  var quoteIndices = TrackPackage_functionLib._tpAllIndicesOf('"', string);
  if (quoteIndices.length % 2 !== 0)
  {
   alert('Malformed preference! Contact webmaster@realityripple.com');
   return('');
  }
  var finalArray = [];
  for (var i = 0; i < quoteIndices.length; i += 2)
  {
   var thisQuote = string.substring(quoteIndices[i]+1, quoteIndices[i+1]);
   finalArray[finalArray.length] = thisQuote;
  }
  return(finalArray);
 },
 tpGetRegexURLArray: function()
 {
  var i;
  var tpPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  var regexesArray = TrackPackage_functionLib.regexDefaults.split(';');
  if (tpPrefs.prefHasUserValue('tpRegex'))
   regexesArray = tpPrefs.getCharPref('tpRegex').split(';');
  var finalArray = [];
  var currentIndex;
  for (i = 0; i < regexesArray.length; i++)
  {
   var carrierRegex = TrackPackage_functionLib.tpExtractQuotedStrings(regexesArray[i]);
   currentIndex = finalArray.length;
   finalArray[currentIndex] = [];
   finalArray[currentIndex][0] = carrierRegex[0];
   finalArray[currentIndex][1] = carrierRegex[1];
  }
  var urlArray =TrackPackage_functionLib.URLDefaults.split(';');
  if (tpPrefs.prefHasUserValue('tpURL'))
   urlArray = tpPrefs.getCharPref('tpURL').split(';');
  for (i = 0; i < urlArray.length; i++)
  {
   var carrierURL = TrackPackage_functionLib.tpExtractQuotedStrings(urlArray[i]);
   var foundRegexMatch = false;
   for (var j = 0; j < finalArray.length; j++)
   {
    if (finalArray[j][0].toLowerCase() === carrierURL[0].toLowerCase())
    {
     finalArray[j][2] = carrierURL[1];
     finalArray[j][3] = carrierURL[2];
     foundRegexMatch = true;
    }
   }
   if (!foundRegexMatch)
   {
    currentIndex = finalArray.length;
    finalArray[currentIndex] = [];
    finalArray[currentIndex][0] = carrierURL[0];
    finalArray[currentIndex][1] = '';
    finalArray[currentIndex][2] = carrierURL[1];
    finalArray[currentIndex][3] = carrierURL[2];
   }
  }
  return(finalArray);
 },
 tpVerifyPackageFedEx: function(trackingString)
 {
  var i;
  if (trackingString.length === 12)
  {
   var val = 0;
   for (i = 0; i < trackingString.length - 1; i++)
   {
    var sChr = trackingString.substring(i, i + 1);
    var chr = parseInt(sChr, 10);
    var mul = 0;
    switch (i % 3)
    {
     case 0:
      mul = chr * 3;
      break;
     case 1:
      mul = chr;
      break;
     case 2:
      mul = chr * 7;
      break;
    }
    val += mul;
   }
   var mod = val % 11;
   if (mod === 10)
    mod = 0;
   var sChk = trackingString.substring(trackingString.length - 1, trackingString.length);
   var chk = parseInt(sChk, 10);
   if (chk === mod)
    return true;
   return false;
  }
  if (trackingString.length === 15)
  {
   var sum1 = 0;
   var sum2 = 0;
   for (i = trackingString.length - 2; i >= 0; i--)
   {
    var sChr2 = trackingString.substring(i, i + 1);
    var chr2 = parseInt(sChr2, 10);
    switch (i % 2)
    {
     case 0:
      sum2 += chr2;
      break;
     case 1:
      sum1 += chr2;
    }
   }
   sum1 *= 3;
   var total = sum1 + sum2;
   var nextDec = Math.ceil(total / 10) * 10;
   var mod2 = nextDec - total;
   var sChk2 = trackingString.substring(trackingString.length - 1, trackingString.length);
   var chk2 = parseInt(sChk2, 10);
   if (chk2 === mod2)
    return true;
   return false;
  }
  return true;
 },
 tpVerifyPackageCarrier: function(carrier, trackingString)
 {
  switch (carrier.toLowerCase())
  {
   case 'fedex':
    return TrackPackage_functionLib.tpVerifyPackageFedEx(trackingString);
  }
  return true;
 },
 tpGetPackageCarrier: function(trackingString)
 {
  var i;
  var historyArray = TrackPackage_functionLib._tpGetHistoryArray();
  for (i = 0; i < historyArray.length; i++)
  {
   if (historyArray[i].TrackingNumber === trackingString)
   {
    return historyArray[i].Carrier;
   }
  }
  var regexURLArray = TrackPackage_functionLib.tpGetRegexURLArray();
  var carrier;
  for (i = 0; i < regexURLArray.length; i++)
  {
   if (regexURLArray[i][1] === '')
    continue;
   var regex = new RegExp(regexURLArray[i][1], 'gi');
   if (regex.test(trackingString))
   {
    if (!TrackPackage_functionLib.tpVerifyPackageCarrier(regexURLArray[i][0], trackingString))
     continue;
    carrier = regexURLArray[i][0];
    break;
   }
  }
  return carrier;
 },
 _tpIsInPrivateBrowsingMode: function()
 {
  if (!TrackPackage_functionLib.gInThunderbird)
  {
   var pbService;
   var PrivateBrowsingUtils;
   try
   {
    pbService = Components.classes['@mozilla.org/privatebrowsing;1'].getService(Components.interfaces.nsIPrivateBrowsingService);
    if (!('privateBrowsingEnabled' in pbService))
     pbService = undefined;
   }
   catch(e) {}
   try
   {
    PrivateBrowsingUtils = Components.utils.import('resource://gre/modules/PrivateBrowsingUtils.jsm', {}).PrivateBrowsingUtils;
   }
   catch(e) {}
   var isGlobalPBSupported = !!pbService;
   var isWindowPBSupported = !isGlobalPBSupported && !!PrivateBrowsingUtils;
   if (isWindowPBSupported)
    return PrivateBrowsingUtils.isWindowPrivate(document.commandDispatcher.focusedWindow);
   else if (isGlobalPBSupported)
    return true;
  }
  return false;
 },
 tpGetTrackingString: function()
 {
  var trackingString = '';
  if (!TrackPackage_functionLib.gInThunderbird)
   trackingString = TrackPackage_functionLib._tpRemoveSpaces(TrackPackage_functionLib._searchSelected());
  else
  {
   if ((typeof gContextMenu === 'object') && gContextMenu.searchSelected)
    trackingString = TrackPackage_functionLib._tpRemoveSpaces(gContextMenu.searchSelected(40));
   else if (typeof getBrowserSelection === 'function')
    trackingString = TrackPackage_functionLib._tpRemoveSpaces(getBrowserSelection(40));
   else if (typeof window._content !== 'undefined' || window._content === null)
    trackingString = TrackPackage_functionLib._tpRemoveSpaces(window._content.getSelection());
   else
   {
    var thisselection = document.commandDispatcher.focusedWindow.getSelection();
    trackingString = thisselection.toString();
   }
  }
  return(trackingString);
 },
 tpRebuildDropdown: function()
 {
  var buttonMenu = document.getElementById('tpButtonMenu');
  var targetMenu = document.getElementById('tpButtonMenuPopup');
  if (typeof(buttonMenu) !== 'undefined' && buttonMenu !== null)
  {
   if (TrackPackage_functionLib.gInThunderbird)
    buttonMenu.className = 'toolbarbutton-1 tb';
   else
    buttonMenu.className = 'toolbarbutton-1';
   while (targetMenu.firstChild)
   {
    targetMenu.removeChild(targetMenu.firstChild);
   }
   var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
   var maxNumbersAllowed = 5;
   if (myTPPrefs.prefHasUserValue('tpMaxDropdownItems'))
    maxNumbersAllowed = myTPPrefs.getIntPref('tpMaxDropdownItems');
   var tempArray = TrackPackage_functionLib._tpGetHistoryArray();
   if (tempArray.length === 0)
   {
    buttonMenu.type = '';
    return;
   }
   buttonMenu.type = 'menu-button';
   for (var index = 0; index < tempArray.length; index++)
   {
    var myLabel = tempArray[index].Carrier + ': ' + tempArray[index].TrackingNumber;
    var uniqueNote = true;
    if (typeof tempArray[index].Notes === 'undefined' || tempArray[index].Notes === null || tempArray[index].Notes === '')
     uniqueNote = false;
    else
    {
     for (var idx = 0; idx < tempArray.length; idx++)
     {
      if (idx === index)
       continue;
      if (typeof tempArray[idx].Notes === 'undefined' || tempArray[idx].Notes === null || tempArray[idx].Notes === '')
       continue;
      if (tempArray[index].Notes.toLowerCase() === tempArray[idx].Notes.toLowerCase())
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
    targetMenu.appendChild(menuitem);
    if (index === maxNumbersAllowed - 1)
     break;
   }
  }
 },
 tpOpenHistory: function()
 {
  var win = window.open('chrome://trackpackage/content/history.xul', 'trackinghistory', 'chrome=yes,resizable=yes,centerscreen=yes,scrollbars=yes,width=720,height=600,');
  win.focus();
  win.onunload = TrackPackage_functionLib.tpRebuildDropdown;
 },
 _tpAddToHistory: function(carrier, trackingString)
 {
  if (TrackPackage_functionLib._tpGetPrivateBrowsingSetting() && TrackPackage_functionLib._tpIsInPrivateBrowsingMode())
   return;
  var now = new Date();
  var finalDate = (now.getMonth()+1) + '/' + now.getDate() + '/' + now.getFullYear();
  var finalString;
  var myTPPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.trackpackage.');
  var currentHistoryString = '';
  if (myTPPrefs.prefHasUserValue('tpTrackingHistory'))
   currentHistoryString = myTPPrefs.getCharPref('tpTrackingHistory');
  var maxNumbersAllowed = 25;
  if (myTPPrefs.prefHasUserValue('tpMaxNumbers'))
   maxNumbersAllowed = myTPPrefs.getIntPref('tpMaxNumbers');
  var numExistingNumbers = currentHistoryString.split(';').length;
  if (numExistingNumbers === maxNumbersAllowed)
  {
   var lastIndex = currentHistoryString.lastIndexOf(';');
   currentHistoryString = currentHistoryString.substring(0, lastIndex);
  }
  var trackingStringIndex = currentHistoryString.indexOf(trackingString + ',');
  if (trackingStringIndex !== -1)
  {
   for (var i = trackingStringIndex - 2; i >= 0; i--)
   {
    if (currentHistoryString[i] === ';')
     break;
   }
   for (var j = trackingStringIndex; j < currentHistoryString.length; j++)
   {
    if (currentHistoryString[j] === ',')
     break;
   }
   i++;
   finalString = currentHistoryString.replace(currentHistoryString.substr(i, j - i), carrier + ',' + trackingString);
  }
  else
  {
   if (currentHistoryString.length > 0)
    finalString = carrier + ',' + trackingString + ',' + finalDate + ';' + currentHistoryString;
   else
    finalString = carrier + ',' + trackingString + ',' + finalDate;
  }
  myTPPrefs.setCharPref('tpTrackingHistory', finalString);
  TrackPackage_functionLib.tpRebuildDropdown();
 },
 tpGetPackageURL: function(carrier,trackingString,addToHistory)
 {
  if (trackingString === '')
   return('');
  if (typeof carrier === 'undefined' || carrier === null)
   carrier = '';
  var windowURL = '';
  var regexURLArray = TrackPackage_functionLib.tpGetRegexURLArray();
  for (var i = 0; i < regexURLArray.length; i++)
  {
   if (regexURLArray[i][1] === '' && carrier.length === 0)
    continue;
   var regex = new RegExp(regexURLArray[i][1],'gi');
   if ((carrier.length === 0 && regex.test(trackingString)) || (carrier.toLowerCase() === regexURLArray[i][0].toLowerCase()))
   {
    carrier = regexURLArray[i][0];
    windowURL = regexURLArray[i][2] + trackingString + regexURLArray[i][3];
    break;
   }
  }
  if (addToHistory)
   TrackPackage_functionLib._tpAddToHistory(carrier, trackingString);
  return(windowURL);
 },
 tpButtonCallback: function(notification, button)
 {
  var regexURLArray = TrackPackage_functionLib.tpGetRegexURLArray();
  for (var i = 0;i < regexURLArray.length; i++)
  {
   var carrier = regexURLArray[i][0];
   if (carrier === button.label)
   {
    var title = carrier + ': ' + notification.value;
    TrackPackage_functionLib.tpOpenPackageWindow(TrackPackage_functionLib.tpGetPackageURL(carrier, notification.value, true), false, false, title);
   }
  }
 },
 _tpShowNotificationBox: function(firstTry)
 {
  if (!TrackPackage_functionLib.gInThunderbird)
  {
   var i;
   var notifyBox = gBrowser.getNotificationBox();
   var allNotifications = notifyBox.allNotifications;
   for (i = 0; i < allNotifications.length; i++)
   {
    var item = allNotifications[i];
    if (item.label.match('Track Package') || item.label.match('Tracked Package'))
     item.close();
   }
   var buttons = [];
   var regexURLArray = TrackPackage_functionLib.tpGetRegexURLArray();
   for (i = 0; i < regexURLArray.length; i++)
   {
    var carrier = regexURLArray[i][0];
    buttons[i] = 
    {
     label: carrier,
     accessKey: '',
     callback: TrackPackage_functionLib.tpButtonCallback
    };
   }
   if (TrackPackage_functionLib._tpGetNotificationsSetting() || firstTry)
   {
    var originalTrackingString = TrackPackage_functionLib.tpGetTrackingString();
    var notifyText;
    if (firstTry)
    {
     notifyText = 'Track Package - Choose Carrier';
    }
    else
    {
     notifyText = 'Tracked Package via ' + TrackPackage_functionLib.tpGetPackageCarrier(originalTrackingString) + '. Fix Carrier?';
    }
    notifyBox.appendNotification(notifyText, originalTrackingString, 'chrome://trackpackage/skin/logo.png', notifyBox.PRIORITY_INFO_HIGH, buttons);
   }
  }
 },
 tpOpenPackageWindow: function(URLString, forceTabs, offerCorrection, title)
 {
  if (URLString !== '')
  {
   if (TrackPackage_functionLib.gInThunderbird)
   {
    if (!TrackPackage_functionLib.gHasThunderbrowse || !TrackPackage_functionLib._tpGetThunderbrowseSetting())
    {
     var messenger = Components.classes['@mozilla.org/messenger;1'].createInstance();         
     messenger = messenger.QueryInterface(Components.interfaces.nsIMessenger);
     messenger.launchExternalURL(URLString);
    }
    else
     browsetothrufield(URLString,null,null,null,null);
   }
   else
   {
    if (!TrackPackage_functionLib.tpGetTabSetting() && !forceTabs)
     var newWindow = window.open(URLString);
    else
    {
     if (!forceTabs)
      openNewTabWith(URLString, null, null, null, false, null);
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
     if (typeof getBrowser === 'function')
     {
      var container = getBrowser().tabContainer;
      container.addEventListener('TabSelect', TrackPackage_functionLib.tpOnBlur, false);
     }
    }
    if (offerCorrection)
     TrackPackage_functionLib._tpShowNotificationBox(false);
   }
  }
  else
   TrackPackage_functionLib._tpShowNotificationBox(true);
 },
 tpHistoryOpenMap: function(carrier, trackingString, forceTabs)
 {
  var gmapsURL = 'http://www.packagemapping.com?action=track&shipper=' + carrier + '&tracknum=' + trackingString;
  if (carrier.length)
   TrackPackage_functionLib.tpOpenPackageWindow(gmapsURL, forceTabs, false);
 },
 tpTrackPackage: function()
 {
  var trackingString = TrackPackage_functionLib.tpGetTrackingString();
  var carrier;
  if (TrackPackage_functionLib.tpGetSmartSenseSetting() || TrackPackage_functionLib.gInThunderbird)
  {
   carrier = TrackPackage_functionLib.tpGetPackageCarrier(trackingString);
   var title = carrier + ': ' + trackingString;
   TrackPackage_functionLib.tpOpenPackageWindow(TrackPackage_functionLib.tpGetPackageURL(carrier, trackingString, true), false, true, title);
  }
  else
   TrackPackage_functionLib.tpOpenPackageWindow('', false, true, '');
 },
 tpTrackGoogleMaps: function()
 {
  var trackingString = TrackPackage_functionLib.tpGetTrackingString();
  var carrierOrig = TrackPackage_functionLib.tpGetPackageCarrier(trackingString);
  var carrier = carrierOrig.toLowerCase();
  var gmapsURL = 'http://www.packagemapping.com?action=track&shipper=' + carrier + '&tracknum=' + trackingString;
  if (carrier.length)
  {
   TrackPackage_functionLib.tpOpenPackageWindow(gmapsURL, false, false, '');
   TrackPackage_functionLib._tpAddToHistory(carrierOrig, trackingString);
  }
 }
};
