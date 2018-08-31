// Copyright Dave Kahler. Do not copy without permission.
var TrackPackage_history =
{
 _tpBuildHistoryArray: function(historyString)
 {
  return(historyString.split(";"));
 },
 tpHistoryTrack: function()
 {
  var myListbox = document.getElementById("historyListbox");
  var items = myListbox.selectedItems;
  for (var index = 0; index < items.length; index++)
  {
   var nodes          = items[index].childNodes;
   var carrier        =  nodes.item(0).getAttribute("label");
   var trackingString =  nodes.item(1).getAttribute("label");
   var url            = TrackPackage_functionLib.tpGetPackageURL(carrier,trackingString,false);
   if (url != "")
   {
    if (items.length>1)
    {
     TrackPackage_functionLib.tpOpenPackageWindow(url,true, false);
    }
    else
    {
     if (!TrackPackage_functionLib.tpGetTabSetting())
      TrackPackage_functionLib.tpOpenPackageWindow(url,false, false);
     else
      TrackPackage_functionLib.tpOpenPackageWindow(url,true, false);
    }
   }
  }
 },
 tpHistoryDelete: function(e)
 {
  var myListbox;
  var nodes;
  var carrier;
  var trackingString;
  var date;
  var info;
  var trackID;
  var sConfirm;
  if (e === undefined)
  {
   myListbox = document.getElementById("historyListbox");
   if (myListbox.selectedIndex != -1)
   {
    sConfirm = "Are you sure you want to delete the selected Tracking Numbers?";
    if (myListbox.selectedItems.length == 1)
    {
     nodes          = myListbox.selectedItem.childNodes;
     carrier        = nodes.item(0).getAttribute('label');
     trackingString = nodes.item(1).getAttribute('label');
     date           = nodes.item(2).getAttribute('label');
     info           = nodes.item(3).value;
     trackID = '';
     if (info == '')
      trackID = carrier + ' ' + trackingString;
     else
      trackID = info + ' [' + carrier + ': ' + trackingString + ']';
     sConfirm = "Are you sure you want to delete the selected Tracking Number?";
     if (trackID != '')
      sConfirm = "Are you sure you want to delete " + trackID + "?";
    }
    if(!confirm(sConfirm))
     return;
    while (myListbox.selectedIndex!=-1)
    {
     myListbox.removeItemAt(myListbox.selectedIndex);
    }
   }
  }
  else if (e.which == 1)
  {
   myListbox = document.getElementById("historyListbox");
   if (myListbox.currentIndex!=-1)
   {
    nodes          = myListbox.currentItem.childNodes;
    carrier        = nodes.item(0).getAttribute('label');
    trackingString = nodes.item(1).getAttribute('label');
    date           = nodes.item(2).getAttribute('label');
    info           = nodes.item(3).value;
    trackID = '';
    if (info == '')
     trackID = carrier + ' ' + trackingString;
    else
     trackID = info + ' [' + carrier + ': ' + trackingString + ']';
    sConfirm = "Are you sure you want to delete this Tracking Number?";
    if (trackID != '')
     sConfirm = "Are you sure you want to delete " + trackID + "?";
    if(!confirm(sConfirm))
     return;
    myListbox.removeItemAt(myListbox.currentIndex);
   }
  }
 },
 _tpPopulateListBox: function(historyArray)
 {
  var listBox = document.getElementById("historyListbox");
  var numElements = listBox.getRowCount();
  var index;
  for (index = 0; index < numElements; index++)
  {
   listBox.removeItemAt(0);
  }
  for (index = 0; index < historyArray.length; index++)
  {
   var rowString = historyArray[index];
   var rowArray = rowString.split(",");
   var numItems = 4;
   var row = document.createElement('listitem');
   row.setAttribute('allowevents',true);
   for (var cellIndex = 0;cellIndex < numItems; cellIndex++)
   {
    var cell;
    if (cellIndex == 0)
    {
     cell = document.createElement('menulist');
     var menupopup = document.createElement('menupopup');
     cell.appendChild(menupopup);
     var regexURLArray = TrackPackage_functionLib.tpGetRegexURLArray();
     var carrier;
     for (var i = 0; i < regexURLArray.length; i++)
     {
      if (regexURLArray[i][1] == "" && carrier.length == 0)
       continue;
      carrier = regexURLArray[i][0];
      var menuitem = document.createElement('menuitem');
      menuitem.setAttribute('label',carrier);
      if (carrier == rowArray[cellIndex])
       menuitem.setAttribute('selected',true);
      menupopup.appendChild(menuitem);
     }
     row.appendChild(cell);
    }
    else if (cellIndex < numItems - 1)
    {
     cell = document.createElement('listcell');
     if (rowArray[cellIndex]==undefined)
      return;
     cell.setAttribute('label', rowArray[cellIndex]);
     row.appendChild(cell);
     cell.addEventListener("dblclick", TrackPackage_history.tpHistoryTrack,true);
    }
    else
    {
     var infoCell = document.createElement('textbox');
     if (rowArray[cellIndex] != undefined)
      infoCell.setAttribute('value', rowArray[cellIndex] );
     else
      infoCell.setAttribute('value', "" );
     infoCell.setAttribute('clickSelectsAll', true);
     row.appendChild(infoCell);
    }
   }
   var buttonCell = document.createElement('button');
   buttonCell.setAttribute('label', "X");
   buttonCell.addEventListener("click", TrackPackage_history.tpHistoryDelete, true);
   row.appendChild(buttonCell);
   listBox.appendChild(row);
  }
 },
 tpHistoryInit: function()
 {
  const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
  if (appInfo.ID == THUNDERBIRD_ID)
  {
   TrackPackage_functionLib.gInThunderbird = true;
   if (document.getElementById("messagepanebox"))
   {
    TrackPackage_functionLib.gHasThunderbrowse = document.getElementById("messagepanebox").hasAttribute("thunderbrowse");
   }
  }
  else
  {
   TrackPackage_functionLib.gInThunderbird = false;
  }
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  var historyString = "";
  if (myTPPrefs.prefHasUserValue("tpTrackingHistory"))
   historyString = myTPPrefs.getCharPref("tpTrackingHistory");
  var historyArray = TrackPackage_history._tpBuildHistoryArray(historyString);
  TrackPackage_history._tpPopulateListBox(historyArray);
  if (TrackPackage_functionLib.tpGetGMapsSetting() && (document.getElementById("mapButton") == undefined))
  {
   var menuitem = document.createElement('button');
   menuitem.setAttribute('id',"mapButton");
   menuitem.setAttribute('label',"Map Selected");
   menuitem.setAttribute('oncommand',"TrackPackage_history.tpHistoryMapTrack();");
   menuitem.setAttribute('style',"width: 120px; height: 30px;");
   if (document.getElementById("buttonhbox"))
    document.getElementById("buttonhbox").appendChild(menuitem);
   var cmenuitem = document.createElement('menuitem');
   cmenuitem.setAttribute('label', "Map Selected");
   cmenuitem.setAttribute('oncommand',"TrackPackage_history.tpHistoryMapTrack();");
   if (document.getElementById("historyMenu"))
    document.getElementById("historyMenu").insertBefore(cmenuitem, document.getElementById("historyMenuSpace"));
  }
 },
 onResizeHistory: function(e)
 {
  var listCol = document.getElementById("historyListLabel");
  if (listCol.flex == 1)
   listCol.flex = 2;
  else if (listCol.flex == 2)
   listCol.flex = 1;
 },
 tpTextUpdate: function(e)
 {
  var myListbox = document.getElementById("historyListbox");
  if (myListbox.selectedIndex == -1)
   return false;
  var mnuCopyItem = document.getElementById("historyMenuCopy");
  var mnuDelItem = document.getElementById("historyMenuDel");
  if (myListbox.selectedItems.length == 1)
  {
   mnuCopyItem.label = "Copy Tracking Number";
   mnuDelItem.label = "Delete Tracking Number";
  }
  else
  {
   mnuCopyItem.label = "Copy Tracking Numbers";
   mnuDelItem.label = "Delete Tracking Numbers";
  }
  return true;
 },
 tpHistoryKeyDown: function(e)
 {
  if (e.keyCode == 46)
  {
   var myListbox = document.getElementById("historyListbox");
   if (myListbox.selectedIndex != -1)
   {
    var sConfirm = "Are you sure you want to delete the selected Tracking Numbers?";
    if (myListbox.selectedItems.length == 1)
    {
     var nodes          = myListbox.selectedItem.childNodes;
     var carrier        = nodes.item(0).getAttribute('label');
     var trackingString = nodes.item(1).getAttribute('label');
     var info           = nodes.item(3).value;
     var trackID = '';
     if (info == '')
      trackID = carrier + ' ' + trackingString;
     else
      trackID = info + ' [' + carrier + ': ' + trackingString + ']';
     sConfirm = "Are you sure you want to delete the selected Tracking Number?";
     if (trackID != '')
      sConfirm = "Are you sure you want to delete " + trackID + "?";
    }
    if(!confirm(sConfirm))
     return;
    while (myListbox.selectedIndex!=-1)
    {
     myListbox.removeItemAt(myListbox.selectedIndex);
    }
   }
  }
 },
 onCloseHistory: function()
 {
  var myListbox = document.getElementById("historyListbox");
  var historyArray = [];
  for (var index = 0; index < myListbox.getRowCount(); index++)
  {
   var item           = myListbox.getItemAtIndex(index);
   var nodes          = item.childNodes;
   var carrier        = nodes.item(0).getAttribute('label');
   var trackingString = nodes.item(1).getAttribute('label');
   var date           = nodes.item(2).getAttribute('label');
   var info           = nodes.item(3).value;
   info = info.replace(/[\;\,]+/," ");
   if (info != "")
    historyArray[historyArray.length] = carrier  + "," + trackingString  + "," + date  + "," + info;
   else
    historyArray[historyArray.length] = carrier  + "," + trackingString  + "," + date;
  }
  var historyPref = historyArray.join(";");
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  myTPPrefs.setCharPref("tpTrackingHistory",historyPref);
 },
 tpHistoryMapTrack: function()
 {
  var myListbox  = document.getElementById("historyListbox");
  var items      = myListbox.selectedItems;
  for (var index = 0; index < items.length; index++)
  {
   var nodes          = items[index].childNodes;
   var carrier        = nodes.item(0).getAttribute("label");
   var trackingString = nodes.item(1).getAttribute("label");
   if (items.length > 1)
   {
    TrackPackage_functionLib.tpHistoryOpenMap(carrier,trackingString,true);
   }
   else
   {
    if (!TrackPackage_functionLib.tpGetTabSetting())
     TrackPackage_functionLib.tpHistoryOpenMap(carrier,trackingString,false);
    else
     TrackPackage_functionLib.tpHistoryOpenMap(carrier,trackingString,true);
   }
  }
 },
 tpCopyNumber: function()
 {
  const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
  var myListbox  = document.getElementById("historyListbox");
  var items      = myListbox.selectedItems;
  var nodes;
  var trackingString;
  if (items.length == 1)
  {
   nodes          = items[0].childNodes;
   trackingString = nodes.item(1).getAttribute("label");
   gClipboardHelper.copyString(trackingString);
  }
  else
  {
   var clipStr = "";
   for (var index = 0; index < items.length; index++)
   {
    nodes          = items[index].childNodes;
    var carrier    = nodes.item(0).getAttribute("label");
    trackingString = nodes.item(1).getAttribute("label");
    clipStr += carrier + ": " + trackingString + "\n";
   }
   gClipboardHelper.copyString(clipStr.trim());
  }
 },
 tpClearHistory: function()
 {
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  if (myTPPrefs.prefHasUserValue("tpTrackingHistory"))
  {
   if (confirm("Are you sure you want to clear your Tracking History?"))
   {
    myTPPrefs.setCharPref("tpTrackingHistory","");
    var listBox = document.getElementById("historyListbox");
    var numElements = listBox.getRowCount();
    for (var index=0;index<numElements;index++)
    {
     listBox.removeItemAt(0);
    }
   }
  }
 },
 tpOpenHistoryOptions: function()
 {
  var win = window.open("chrome://trackpackage/content/tpPrefDialog.xul", "prefdialog", "chrome,screenX=150,screenY=150");
  win.focus();
  win.onunload = TrackPackage_history.tpHistoryInit;
 }
};
window.addEventListener("load", TrackPackage_history.tpHistoryInit, false);
