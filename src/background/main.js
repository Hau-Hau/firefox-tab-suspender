let windows = {};
let loadedTabs = {}
let settings = {};

browser.storage.local.get({
	timeToDiscard: 60,
	neverSuspendPinned: true,
	neverSuspendUnsavedFormInput: true,
	neverSuspendPlayingAudio: true
}).then(function(value) {
	settings = value;
	settings.timeToDiscard = settings.timeToDiscard * 1000;
});

document.addEventListener("DOMContentLoaded", function() {
	chrome.tabs.query({}, function(tabs){     
		for (const tab of tabs) {
			windows[tab.windowId] = windows[tab.windowId] || {};
			createTab(tab);
		}
	});

	chrome.tabs.onCreated.addListener(function(tab) {
		createTab(tab);
	});

	chrome.windows.onCreated.addListener(function(window) {
		windows[window.id] = {};
	});

	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.pinned !== undefined && changeInfo.pinned !== null) {
			windows[tab.windowId][tab.id].pinned = changeInfo.pinned;
		}

		if (changeInfo.audible !== undefined && changeInfo.audible !== null) {
			windows[tab.windowId][tab.id].audible = changeInfo.audible;
		}
	});

	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		delete windows[removeInfo.windowId][tabId];
		delete loadedTabs[removeInfo.windowId][tabId];
	});

	chrome.windows.onRemoved.addListener(function(windowId) {
		delete windows[windowId];
		delete loadedTabs[windowId];
	});

	chrome.tabs.onActivated.addListener(function(activeInfo) {
		chrome.tabs.query({}, function(tabs){   
			let length = tabs.length; 
			while (length--) {
				if (windows[tabs[length].windowId][tabs[length].id] === undefined || windows[tabs[length].windowId][tabs[length].id] === null) {
					windows[tabs[length].windowId] = windows[tabs[length].windowId] || {};
					createTab(tabs[length]);
					continue;
				}

				if ((tabs[length].discarded && !tabs[length].active) 
					|| (settings.neverSuspendPinned && windows[tabs[length].windowId][tabs[length].id].pinned) 
					|| (settings.neverSuspendPlayingAudio && windows[tabs[length].windowId][tabs[length].id].audible)) {
					continue;
				}

				if (tabs[length].active) {
					windows[tabs[length].windowId][tabs[length].id].lastUsageTime = tabs[length].lastAccessed;
				}
				windows[tabs[length].windowId][tabs[length].id].active = tabs[length].active;
				windows[tabs[length].windowId][tabs[length].id].pinned = tabs[length].pinned;
				windows[tabs[length].windowId][tabs[length].id].discarded = tabs[length].discarded;
				windows[tabs[length].windowId][tabs[length].id].audible = tabs[length].audible;

				if (!tabs[length].discard && !tabs[length].active) {
					loadedTabs[tabs[length].windowId] = loadedTabs[tabs[length].windowId] || {};
					loadedTabs[tabs[length].windowId][tabs[length].id];
				}
			}
		});
		discardTabs();
	});

	function discardTabs() {
		let interval = setInterval(function() {
			for (const windowId in windows) {
				for (const tabId in windows[windowId]) {
					if (Date.now() - windows[windowId][tabId].lastUsageTime <= settings.timeToDiscard
						|| windows[windowId][tabId].discarded
						|| windows[windowId][tabId].active
						|| (settings.neverSuspendPinned && windows[windowId][tabId].pinned)
						|| (settings.neverSuspendPlayingAudio && windows[windowId][tabId].audible)) {
						continue;		
					}
					chrome.tabs.discard(tabId >> 0);
					windows[windowId][tabId].discarded = true;
					delete loadedTabs[windowId][tabId];
				}
			}
			if (loadedTabs.length === 0) {
				clearInterval(interval);
				return;
			}


			let found = false;

			// Needed performance check which method is more optimal

			// for (const windowId in windows) {
			// 	for (const tabId in windows[windowId]) {
			// 		if (!windows[windowId][tabId].discarded && !windows[windowId][tabId].active) {
			// 			found = true;
			// 			break;
			// 		}
			// 		if (found) {
			// 			break;
			// 		}
			// 	}
			// }

			for (const windowId in loadedTabs) {
				if  (loadedTabs[windowId].length > 0) {
					found = true;
					break;
				}
			}
			if (!found) {
				clearInterval(interval);
			}
		}, 1000 * 2);
	}

	function createTab(tab) {
		windows[tab.windowId][tab.id] = {
			pinned: tab.pinned,
			lastUsageTime: tab.lastAccessed,
			active: tab.active,
			discarded: tab.discarded,
			audible: tab.audible
		}

		if (!tab.discarded && !tab.active) {
			loadedTabs[tab.windowId] = loadedTabs[tab.windowId] || {};
			loadedTabs[tab.windowId][tab.id];
		}
	}

});
