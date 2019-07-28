if (value.suspendOptionInContextMenu) {
  browser.menus.create({
    id: 'suspend',
    contexts: ['tab'],
    title: 'Suspend',
  });
}

if (value.suspendOthersOptionInContextMenu) {
  browser.menus.create({
    id: 'suspend-others',
    contexts: ['tab'],
    title: 'Suspend Others',
  });
}

if (value.suspendLeftAndRightOptionsInContextMenu) {
  browser.menus.create({
    id: 'suspend-left',
    contexts: ['tab'],
    title: 'Suspend All to the Left',
  });

  browser.menus.create({
    id: 'suspend-right',
    contexts: ['tab'],
    title: 'Suspend All to the Right',
  });
}

browser.menus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == 'suspend') {
    Module['jsChromeTabsDiscard'](tab.id);
  }

  if (info.menuItemId == 'suspend-others') {
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

  if (info.menuItemId == 'suspend-left') {
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

  if (info.menuItemId == 'suspend-right') {
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
});
