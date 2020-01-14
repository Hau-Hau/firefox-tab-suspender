const suspendId = 'suspend';
const suspendOthersId = 'suspend-others';
const suspendLeftId = 'suspend-left';
const suspendRightId = 'suspend-right';
const suspendAllId = 'suspend-all';

browser.menus.remove(suspendId);
browser.menus.remove(suspendOthersId);
browser.menus.remove(suspendLeftId);
browser.menus.remove(suspendRightId);
browser.menus.remove(suspendAllId);

if (value.suspendOptionInContextMenu) {
  browser.menus.create({
    id: suspendId,
    contexts: ['tab'],
    title: 'Suspend',
  });
}

if (value.suspendOthersOptionInContextMenu) {
  browser.menus.create({
    id: suspendOthersId,
    contexts: ['tab'],
    title: 'Suspend Others',
  });
}

if (value.suspendLeftAndRightOptionsInContextMenu) {
  browser.menus.create({
    id: suspendLeftId,
    contexts: ['tab'],
    title: 'Suspend All to the Left',
  });

  browser.menus.create({
    id: suspendRightId,
    contexts: ['tab'],
    title: 'Suspend All to the Right',
  });
}

if (value.suspendAllOptionInContextMenu) {
  browser.menus.create({
    id: suspendAllId,
    contexts: ['tab'],
    title: 'Suspend All',
  });
}

browser.menus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == suspendId) {
    Module['jsChromeTabsDiscard'](tab.id);
  }

  if (info.menuItemId == suspendOthersId) {
    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      let index = tabs.length;
      while (index--) {
        if (tabs[index].id === tab.id) {
          continue;
        }
        Module['jsChromeTabsDiscard'](tabs[index].id);
      }
    });
  }

  if (info.menuItemId == suspendLeftId) {
    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      let startSuspending = false;
      let index = tabs.length;
      while (index--) {
        if (tabs[index].id === tab.id) {
          startSuspending = true;
          continue;
        }
        if (startSuspending === false) {
          continue;
        }
        if ((value.neverSuspendPlayingAudio && tabs[index].audible)
            || (value.neverSuspendPinned && tabs[index].pinned)) {
          continue;
        }
        Module['jsChromeTabsDiscard'](tabs[index].id);
      }
    });
  }

  if (info.menuItemId == suspendRightId) {
    chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
      let index = tabs.length;
      while (index--) {
        if (tabs[index].id === tab.id) {
          break;
        }
        Module['jsChromeTabsDiscard'](tabs[index].id);
      }
    });
  }

  if (info.menuItemId == suspendAllId) {
    chrome.tabs.query({}, function(tabs) {
      let index = tabs.length;
      while (index--) {
        Module['jsChromeTabsDiscard'](tabs[index].id);
      }
    });
  }
});
