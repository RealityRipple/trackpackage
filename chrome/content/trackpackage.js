// Copyright Dave Kahler. Do not copy without permission.

if(!com) var com={};
if(!com.dakahler) com.dakahler={};
if(!com.dakahler.tp) com.dakahler.tp={};
if(!com.dakahler.tp.main) com.dakahler.tp.main={};

com.dakahler.tp.main = {

	observe: function(subject, topic, data)
	{
		if (topic == "nsPref:changed")
		{
			// aSubject is the nsIPrefBranch we're observing (after appropriate QI)
			// aData is the name of the pref that's been changed (relative to aSubject)
			if (data == "tpMaxDropdownItems")
			{
				com.dakahler.tp.functionLib.tpRebuildDropdown();
			}
		}

		subject = subject.QueryInterface(Components.interfaces.nsIUpdateItem);

		if (subject.name == "Track Package" && data == "item-uninstalled")
		{
			// uninstall clean-up script
			var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].
							getService(Components.interfaces.nsIPrefService).getBranch("trackpackage.");
							
			myTPPrefs.deleteBranch("");
		}
	},

	register: function()
	{
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, "em-action-requested", false);

		// First we'll need the preference services to look for preferences.
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService);

		// For this._branch we ask that the preferences for extensions.myextension. and children
		this._branch = prefService.getBranch("trackpackage.");

		// Now we queue the interface called nsIPrefBranch. This interface is described as:  
		// "nsIPrefBranch allows clients to observe changes to pref values."
		this._branch.QueryInterface(Components.interfaces.nsIPrefBranch);

		// Finally add the observer.
		this._branch.addObserver("", this, false);

	},

	deregister: function()
	{
		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		observerService.removeObserver(this,"em-action-requested");
	},
	
	tpFirstRun: function(prefs)
	{
        // Disable first run functionality, don't have time to fix it
	    /*
        var ver = -1, firstrun = true;

		var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
								.getService(Components.interfaces.nsIExtensionManager);
		var current = gExtensionManager.getItemForID("{3f669128-5ad3-4053-ad9b-1afc4ea24c28}").version;
		//gets the version number.
		//"extension@guid.net" should be replaced with your extension's GUID.
		
		
		var webpage = "http://trackpackageextension.com/firstrun?version=" + current + "&upgrade=";
	        
		try
		{
			ver = prefs.getCharPref("version");
			firstrun = prefs.getBoolPref("firstrun");
		}
		catch(e)
		{
		  //nothing
		}
		finally
		{
			if (firstrun)
			{
				prefs.setBoolPref("firstrun",false);
				prefs.setCharPref("version",current);
		    
				// Insert code for first run here

				// The example below loads a page by opening a new tab.
				// Useful for loading a mini tutorial
				window.setTimeout(function(){
					gBrowser.selectedTab = gBrowser.addTab(webpage + "0");
				}, 1500); //Firefox 2 fix - or else tab will get closed
			}		
		      
			if (ver!=current && !firstrun)
			{
				// !firstrun ensures that this section does not get loaded if its a first run.
				prefs.setCharPref("version",current);
		        
				// Insert code if version is different here => upgrade
				window.setTimeout(function(){
					gBrowser.selectedTab = gBrowser.addTab(webpage + "1" + "&oldversion=" + ver);
				}, 1500); //Firefox 2 fix - or else tab will get closed
			}
		}
        */

	},

	tpInit: function()
	{

		com.dakahler.tp.main.register();
		
		const FIREFOX_ID = "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}";
		const THUNDERBIRD_ID = "{3550f703-e582-4d05-9a08-453d09bdfdc6}";
		var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
		
		var tpHidePtr = com.dakahler.tp.main.tpHide;
		
		if (appInfo.ID == THUNDERBIRD_ID)
		{
			com.dakahler.tp.functionLib.gInThunderbird = true;
			if (document.getElementById("messagePaneContext") != null)
				document.getElementById("messagePaneContext").addEventListener("popupshowing",tpHidePtr,false);
			else if (document.getElementById("mailContext") != null)
				document.getElementById("mailContext").addEventListener("popupshowing",tpHidePtr,false);
				
			if (document.getElementById("msgComposeContext") != null)
				document.getElementById("msgComposeContext").addEventListener("popupshowing",tpHidePtr,false);
				
			if (document.getElementById("messagepanebox") != null)
				com.dakahler.tp.functionLib.gHasThunderbrowse = document.getElementById("messagepanebox").hasAttribute("thunderbrowse");
		}
		else
		{
			document.getElementById("contentAreaContextMenu").addEventListener("popupshowing",tpHidePtr,false);
		}
		
		var myTPPrefs = Components.classes["@mozilla.org/preferences-service;1"].
						getService(Components.interfaces.nsIPrefService).getBranch("trackpackage.");
		
		if (!myTPPrefs.prefHasUserValue("tpCheckBox"))
			myTPPrefs.setCharPref("tpCheckBox", true);
		
		if (!myTPPrefs.prefHasUserValue("tpSmartSense"))
			myTPPrefs.setCharPref("tpSmartSense", true);
			
		if (!myTPPrefs.prefHasUserValue("tpNotifications"))
			myTPPrefs.setCharPref("tpNotifications", true);
			
		if (!myTPPrefs.prefHasUserValue("tpPrivateBrowsing"))
			myTPPrefs.setCharPref("tpPrivateBrowsing", true);
			
		if (!myTPPrefs.prefHasUserValue("tpUseThunderbrowse"))
			myTPPrefs.setCharPref("tpUseThunderbrowse", true);
			
		if (!myTPPrefs.prefHasUserValue("tpTrackingHistory"))
			myTPPrefs.setCharPref("tpTrackingHistory", "");
			
		if (!myTPPrefs.prefHasUserValue("tpMaxDropdownItems"))
			myTPPrefs.setIntPref("tpMaxDropdownItems", 5);
			
		if (!myTPPrefs.prefHasUserValue("tpMaxNumbers"))
			myTPPrefs.setIntPref("tpMaxNumbers", 25);
			
		if (!myTPPrefs.prefHasUserValue("tpEnableGMaps"))
			myTPPrefs.setCharPref("tpEnableGMaps", false);
			
		if (!myTPPrefs.prefHasUserValue("tpRegex"))
			myTPPrefs.setCharPref("tpRegex", com.dakahler.tp.functionLib.regexDefaults);
			
		if (!myTPPrefs.prefHasUserValue("tpURL"))
			myTPPrefs.setCharPref("tpURL", com.dakahler.tp.functionLib.URLDefaults);
			
		if (!myTPPrefs.prefHasUserValue("tpUpdateURL"))
			myTPPrefs.setCharPref("tpUpdateURL", "https://realityripple.com/Software/Mozilla-Extensions/Track-Package/defaults.xml");
			
			
		// Add necessary items to explicit tracking menu
	//	var regexURLArray = tpGetRegexURLArray();
	//	for (var i=0;i<regexURLArray.length;i++)
	//	{
	//		var menuitem = document.createElement('menuitem');
	//		menuitem.setAttribute('id',regexURLArray[i][0]);
	//		menuitem.setAttribute('label',"Track " + regexURLArray[i][0] + " Package");
	//		menuitem.setAttribute('oncommand',"tpOpenPackageWindow(tpGetPackageURL('"+regexURLArray[i][0]+"','',true),false,false)");
	//		document.getElementById("explicitpopup").appendChild(menuitem);
	//	}
		
		
		// Add google maps option if necessary
		
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
		
		if (!com.dakahler.tp.functionLib.gInThunderbird)
		{
			com.dakahler.tp.main.tpFirstRun(myTPPrefs);
		}
	},

	tpUnload: function()
	{
		com.dakahler.tp.main.deregister();
	},

	tpHide: function() {
		var smartSense = com.dakahler.tp.functionLib.tpGetSmartSenseSetting();
		var trackingString=com.dakahler.tp.functionLib.tpGetTrackingString();
		var carrier = com.dakahler.tp.functionLib.tpGetPackageCarrier(trackingString);
		var showTrack = (com.dakahler.tp.functionLib.tpGetPackageURL(carrier, trackingString, false) != "" || !smartSense);
		var tpItem = document.getElementById("trackpackage");
		var gmapsItem = document.getElementById("trackgmaps");
		var explicitItem = document.getElementById("trackpackage_explicitmenu");

		//if (smartSense) {
			if (tpItem)
				tpItem.hidden = !showTrack && smartSense;
			
			if (gmapsItem)
				gmapsItem.hidden = !showTrack && smartSense;
				
			if (explicitItem)
				explicitItem.hidden = true;
		//}
	//	else {
	//		//gContextMenu.showItem("trackpackage_explicitmenu", showTrack );
	//		//gContextMenu.showItem("trackpackage", false );
	//		
	//		if (gmapsItem)
	//			gContextMenu.showItem("trackgmaps", false );
	//			
	//		if (tpItem)
	//			tpItem.hidden = !showTrack;
	//		
	//		if (gmapsItem)
	//			gmapsItem.hidden = true;
	//			
	//		if (explicitItem)
	//			explicitItem.hidden = !showTrack;
	//	}
	},

	tpLinkNumbers: function()
	{
		var workingHTML;
		
		if (!com.dakahler.tp.functionLib.gInThunderbird)
		{
			workingHTML = content.document.getElementsByTagName("body").item(0).innerHTML;
		}
		else
		{
		
			var windowManager = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(nsIWindowMediator);
			var messengerWindowList = windowManager.getEnumerator("mail:3pane");
			var messageWindowList = windowManager.getEnumerator("mail:messageWindow");
			var messageURI = GetFirstSelectedMessage();
			var messageBody="";
			if (messageURI != null && messageURI != "") {
			 while (true) {
			  if (messengerWindowList.hasMoreElements()) {
			   win = messengerWindowList.getNext();
			  } else if (messageWindowList.hasMoreElements()) {
			   win = messageWindowList.getNext();
			  } else {
			   break;
			  }
			  loadedMessageURI = win.GetLoadedMessage();
			  if (loadedMessageURI != messageURI) continue;
			  brwsr = win.getMessageBrowser();
			  if (!brwsr) continue;
			  messageBody = brwsr.docShell.contentViewer.DOMDocument.body.textContent; break;
			 }
			} 

			if (messageBody.length>0)
				workingHTML = brwsr.docShell.contentViewer.DOMDocument.body.innerHTML;
		}
		
		var regexURLArray = com.dakahler.tp.functionLib.tpGetRegexURLArray();
		var resultArray = new Array();
		var dividedHTML = workingHTML.split(/\s|\t|\n|\r|\f|(<([^<>]*)>)/);
		var tempArray = new Array();
		for (var i=0;i<regexURLArray.length;i++)
		{
			var stringregex = regexURLArray[i][1];
			
			if (stringregex.length==0)
				continue;

			var regex = new RegExp(stringregex,"gi");
			var foundOne=false;
			for (var j=0;j<dividedHTML.length;j++)
			{
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
		
		// remove duplicates
		var newlist = new Array();
		var newIndex=0;
		for (var index=0; index<tempArray.length; index++)
		{
			var foundDuplicate=false;
			for (var index2=0; index2<newlist.length; index2++)
			{
				if (tempArray[index][0]==newlist[index2][0])
				{
					foundDuplicate=true;
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

		for (var index=0;index<newlist.length;index++)
		{
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
		// Here, we either get tpbuttonmenu (user clicked on top-level button),
		// or we get one of the drop-down buttons
		
		if (target.id == "tpbuttonmenu")
		{
			// Look for the child with the historyInfo property we need
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
			
			com.dakahler.tp.functionLib.tpOpenPackageWindow(
					com.dakahler.tp.functionLib.tpGetPackageURL(carrier, trackingString, false), false, false, title);
		}
	},
	
	tpButtonMenuLoaded: function()
	{
		if (com != undefined)
		{
			com.dakahler.tp.functionLib.tpRebuildDropdown();
		}
	},
	
}

window.addEventListener("load",com.dakahler.tp.main.tpInit, false);
window.addEventListener("unload", com.dakahler.tp.main.tpUnload, false);
