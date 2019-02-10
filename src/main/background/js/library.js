mergeInto(LibraryManager.library, {
  jsExpiredTabsWatcher: function () {
    if (Module['internalInterval'] !== undefined && Module['internalInterval'] !== null) {
      return;
    }
    Module['internalInterval'] = setInterval(function () {
      if (!!Module.cwrap('checkLastEvent', 'number', ['number'])(6)) {
        return;
      }
      Module.cwrap('pushEvent', null, ['number'])(6);
    }, 2000);
  },
  jsClearInterval: function () {
    clearInterval(Module['internalInterval']);
    Module['internalInterval'] = undefined;
  },
  jsChromeTabsDiscard: function (tabId, shouldDesaturateFavicon) {
    if (shouldDesaturateFavicon === 0) {
      chrome.tabs.discard(tabId);
      return;
    }

    var processFavIconChange = function(tabId, url) {
      chrome.tabs.executeScript(tabId, {
        code:
          '(function() {' +
          '  if (!document.querySelector("link[rel~=icon]")) {' +
          '    document.head.insertAdjacentHTML(\'beforeend\', \'<link rel="icon">\');' +
          '  }' +
          '  if (document.querySelector("link[rel~=icon]")) {' +
          '    Array.prototype.slice.call(document.querySelectorAll("link[rel~=icon]")).forEach(function(l){ l.href = "' + url + '"; });' +
          '  }' +
          '})();'
      });
    }

    var changeFavicon = function (favIconUrl) {
      var image = new Image();
      image.src = favIconUrl;

      image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var px = imageData.data;
        var grey;
        for (var i = px.length; i >= 0; i -= 4) {
          grey = px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11;
          px[i] = px[i + 1] = px[i + 2] = grey;
        }

        context.putImageData(imageData, 0, 0);
        processFavIconChange(tabId, canvas.toDataURL('image/png'));
      };
    };

    browser.tabs.query({}).then(function (tabs) {
      var tabsIndex = tabs.length;
      while (tabsIndex--) {
        if (tabs[tabsIndex].id === tabId) {
          changeFavicon(tabs[tabsIndex].favIconUrl, tabs[tabsIndex].active);
          setTimeout(function () {
            var discarding = browser.tabs.discard(tabId);
            discarding.then(null, processFavIconChange(tabId, tabs[tabsIndex].favIconUrl));
          }, 1000);
          break;
        }
      }
    });
  }
});
