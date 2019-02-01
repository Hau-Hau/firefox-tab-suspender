mergeInto(LibraryManager.library, {
  jsConsoleLog: function(number) {
    console.log(number);
  },
  jsExpiredTabsWatcher: function () {
    if (Module['internalInterval'] !== undefined && Module['internalInterval'] !== null) {
      return;
    }
    Module['internalInterval'] = setInterval(function () {
      Module.cwrap('discardTabs', null, [])();
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

    var desaturateFavicon = function (favIconUrl) {
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
        chrome.tabs.executeScript(tabId, {
          code:
            '(function() {' +
            '  if (!document.querySelector("link[rel~=icon]")) {' +
            '    document.head.insertAdjacentHTML(\'beforeend\', \'<link rel="icon">\');' +
            '  }' +
            '  if (document.querySelector("link[rel~=icon]")) {' +
            '    Array.prototype.slice.call(document.querySelectorAll("link[rel~=icon]")).forEach(function(l){ l.href = "' + canvas.toDataURL('image/png') + '"; });' +
            '  }' +
            '})();'
        }, function () {
          setTimeout(function () {
            chrome.tabs.discard(tabId);
          }, 300)
        });
      };
    };

    browser.tabs.query({ active: false, discarded: false }).then(function (tabs) {
      var tabsIndex = tabs.length;
      while (tabsIndex--) {
        if (tabs[tabsIndex].id === tabId) {
          desaturateFavicon(tabs[tabsIndex].favIconUrl);
          break;
        }
      }
    });
  }
});
