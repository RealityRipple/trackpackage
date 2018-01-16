// Copyright Dave Kahler. Do not copy without permission.
if(!com) var com={};
if(!com.dakahler) com.dakahler={};
if(!com.dakahler.tp) com.dakahler.tp={};
if(!com.dakahler.tp.history) com.dakahler.tp.history={};
com.dakahler.tp.history =
{
 tpHistoryInit: function()
 {
  const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
  var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
  if (appInfo.ID == THUNDERBIRD_ID)
  {
   com.dakahler.tp.functionLib.gInThunderbird = true;
   if (document.getElementById("messagepanebox"))
   {
    com.dakahler.tp.functionLib.gHasThunderbrowse = document.getElementById("messagepanebox").hasAttribute("thunderbrowse");
   }
  }
  else
  {
   com.dakahler.tp.functionLib.gInThunderbird = false;
  }
  var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.trackpackage.");
  var historyString = "";
  if (myTPPrefs.prefHasUserValue("tpTrackingHistory"))
   historyString = myTPPrefs.getCharPref("tpTrackingHistory");
  var historyArray = com.dakahler.tp.history.tpBuildHistoryArray(historyString);
  com.dakahler.tp.history.tpPopulateListBox(historyArray);
  if (com.dakahler.tp.functionLib.tpGetGMapsSetting() && (document.getElementById("mapButton") == undefined))
  {
   var menuitem = document.createElement('button');
   menuitem.setAttribute('id',"mapButton");
   menuitem.setAttribute('label',"Map Selected");
   menuitem.setAttribute('oncommand',"com.dakahler.tp.history.tpHistoryMapTrack();");
   menuitem.setAttribute('style',"width: 120px; height: 30px;");
   if (document.getElementById("buttonhbox"))
    document.getElementById("buttonhbox").appendChild(menuitem);
   var cmenuitem = document.createElement('menuitem');
   cmenuitem.setAttribute('label', "Map Selected");
   cmenuitem.setAttribute('oncommand',"com.dakahler.tp.history.tpHistoryMapTrack();");
   if (document.getElementById("historyMenu"))
    document.getElementById("historyMenu").insertBefore(cmenuitem, document.getElementById("historyMenuSpace"));
  }
 },
 tpBuildHistoryArray: function(historyString)
 {
  return(historyString.split(";"));
 },
 tpBuildHistoryString: function(historyArray)
 {
  return(historyArray.join(";"));
 },
 tpGetStringFromHistoryContents: function()
 {
  var myListbox = document.getElementById("historyListbox");
  var finalString = "";
  for (index = 0; index < myListbox.getRowCount(); index++)
  {
   var row = myListbox.getItemAtIndex(index);
   var nodes = row.childNodes;
   var rowString = "";
   for (node = 0; node < nodes.length; node++)
   {
    if (node < nodes.length - 1)
     rowString += nodes.item(node).localName + ",";
    else
     rowString += nodes.item(node).localName;
   }
   if (index < myListbox.getRowCount() - 1)
    finalString += rowString + ",";
   else
    finalString += rowString;
  }
  return(finalString);
 },
 tpPopulateListBox: function(historyArray)
 {
  var listBox = document.getElementById("historyListbox");
  var numElements = listBox.getRowCount();
  for (var index = 0; index < numElements; index++)
  {
   listBox.removeItemAt(0);
  }
  for (var index = 0; index < historyArray.length; index++)
  {
   var rowString = historyArray[index];
   var rowArray = rowString.split(",");
   var numItems = 4;
   var row = document.createElement('listitem');
   row.setAttribute('allowevents',true);
   for (var cellIndex = 0;cellIndex < numItems; cellIndex++)
   {
    if (cellIndex == 0)
    {
     var cell = document.createElement('menulist');
     var menupopup = document.createElement('menupopup');
     cell.appendChild(menupopup);
     var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
     var carrier;
     var sIndex = 0;
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
     var cell = document.createElement('listcell');
     if (rowArray[cellIndex]==undefined)
      return;
     cell.setAttribute('label', rowArray[cellIndex]);
     row.appendChild(cell);
     cell.addEventListener("dblclick", com.dakahler.tp.history.tpHistoryTrack,true);
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
   buttonCell.addEventListener("click", com.dakahler.tp.history.tpHistoryDelete, true);
   row.appendChild(buttonCell);
   listBox.appendChild(row);
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
 tpDeleteTextUpdate: function(e)
 {
  var myListbox = document.getElementById("historyListbox");
  if (myListbox.selectedIndex == -1)
   return false;
  var mnuItem = document.getElementById("historyMenuDel");
  if (myListbox.selectedItems.length == 1)
   mnuItem.label = "Delete Tracking Number";
  else
   mnuItem.label = "Delete Tracking Numbers";
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
     var date           = nodes.item(2).getAttribute('label');
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
 tpHistoryDelete: function(e)
 {
  if (e === undefined)
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
     var date           = nodes.item(2).getAttribute('label');
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
  else if (e.which == 1)
  {
   var myListbox = document.getElementById("historyListbox");
   if (myListbox.currentIndex!=-1)
   {
    var nodes          = myListbox.currentItem.childNodes;
    var carrier        = nodes.item(0).getAttribute('label');
    var trackingString = nodes.item(1).getAttribute('label');
    var date           = nodes.item(2).getAttribute('label');
    var info           = nodes.item(3).value;
    var trackID = '';
    if (info == '')
     trackID = carrier + ' ' + trackingString;
    else
     trackID = info + ' [' + carrier + ': ' + trackingString + ']';
    var sConfirm = "Are you sure you want to delete this Tracking Number?";
    if (trackID != '')
     sConfirm = "Are you sure you want to delete " + trackID + "?";
    if(!confirm(sConfirm))
     return;
    myListbox.removeItemAt(myListbox.currentIndex);
   }
  }
 },
 onCloseHistory: function()
 {
  var myListbox = document.getElementById("historyListbox");
  var historyArray = new Array();
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
 tpHistoryTrack: function()
 {
  var myListbox = document.getElementById("historyListbox");
  var items = myListbox.selectedItems;
  for (var index = 0; index < items.length; index++)
  {
   var nodes          = items[index].childNodes;
   var carrier        =  nodes.item(0).getAttribute("label");
   var trackingString =  nodes.item(1).getAttribute("label");
   var date           =  nodes.item(2).getAttribute("label");
   var url            = com.dakahler.tp.functionLib.tpGetPackageURL(carrier,trackingString,false);
   if (url != "")
   {
    if (items.length>1)
    {
     com.dakahler.tp.functionLib.tpOpenPackageWindow(url,true, false);
    }
    else
    {
     if (!com.dakahler.tp.functionLib.tpGetTabSetting())
      com.dakahler.tp.functionLib.tpOpenPackageWindow(url,false, false);
     else
      com.dakahler.tp.functionLib.tpOpenPackageWindow(url,true, false);
    }
   }
  }
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
   var date           = nodes.item(2).getAttribute("label");
   if (items.length > 1)
   {
    com.dakahler.tp.functionLib.tpHistoryOpenMap(carrier,trackingString,true);
   }
   else
   {
    if (!com.dakahler.tp.functionLib.tpGetTabSetting())
     com.dakahler.tp.functionLib.tpHistoryOpenMap(carrier,trackingString,false);
    else
     com.dakahler.tp.functionLib.tpHistoryOpenMap(carrier,trackingString,true);
   }
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
  win.onunload = com.dakahler.tp.history.tpHistoryInit;
 }
}
window.addEventListener("load",com.dakahler.tp.history.tpHistoryInit,false);
