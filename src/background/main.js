let windows = {};
let settings = {};
browser.storage.local.get({
	timeToDiscard: 60,
	neverSuspendPinned: true,
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
		chrome.tabs.query({}, function(tabs){     
			for (const tab of tabs) {
				if (windows[tab.windowId][tab.id] === undefined || windows[tab.windowId][tab.id] === null) {
					windows[tab.windowId] = windows[tab.windowId] || {};
					createTab(tab);
					continue;
				}

				if (tab.discarded && !tab.active 
					|| (settings.neverSuspendPinned && windows[tab.windowId][tab.id].pinned) 
					|| (settings.neverSuspendPlayingAudio && windows[tab.windowId][tab.id].audible)) {
					continue;
				}

				windows[tab.windowId][tab.id].active = tab.active;
				windows[tab.windowId][tab.id].pinned = tab.pinned;
				windows[tab.windowId][tab.id].discarded = tab.discarded;
				windows[tab.windowId][tab.id].audible = tab.audible;
				if (tab.active) {
					windows[tab.windowId][tab.id].lastUsageTime = tab.lastAccessed;
				}
			}
		});
	});

	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		delete windows[removeInfo.windowId][tabId];
	});

	chrome.windows.onRemoved.addListener(function(windowId) {
		delete windows[windowId];
	});

	chrome.tabs.onActivated.addListener(function(activeInfo) {
		chrome.tabs.get(activeInfo.tabId, function(tab) {
			updateTab(tab);
		});
	});

	setInterval(function() {
		for (const windowId in windows) {
			for (const tabId in windows[windowId]) {
				if (Date.now() - windows[windowId][tabId].lastUsageTime <= settings.timeToDiscard
					|| windows[windowId][tabId].discarded
					|| windows[windowId][tabId].active
					|| (settings.neverSuspendPinned && windows[windowId][tabId].pinned)
					|| (settings.neverSuspendPlayingAudio && windows[windowId][tabId].audible)) {
					continue;		
				}
				chrome.tabs.discard(parseInt(tabId));
				windows[windowId][tabId].discarded = true;
			}
		}
	}, 1000 * 2);

	function createTab(tab) {
		windows[tab.windowId][tab.id] = {
			pinned: tab.pinned,
			lastUsageTime: tab.lastAccessed,
			active: tab.active,
			discarded: tab.discarded,
			audible: tab.audible
		}
	}

	function updateTab(tab) {
		windows[tab.windowId][tab.id] = windows[tab.windowId][tab.id] || {};
		windows[tab.windowId][tab.id].pinned = tab.pinned;
		windows[tab.windowId][tab.id].lastUsageTime = tab.lastAccessed;
		windows[tab.windowId][tab.id].active = tab.active;
		windows[tab.windowId][tab.id].discarded = tab.discarded;
		windows[tab.windowId][tab.id].audible = tab.audible;
	}
});
