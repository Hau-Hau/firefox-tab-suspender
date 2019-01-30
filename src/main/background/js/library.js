mergeInto(LibraryManager.library, {
  jsExpiredTabsWatcher: function() {
    if (Module['internalInterval'] !== undefined && Module['internalInterval'] !== null) {
      return;
    }
    Module['internalInterval'] = setInterval(function() {
      Module.cwrap('discardTabs', null, [])();
    }, 2000);
  },
  jsClearInterval: function() {
    clearInterval(Module['internalInterval']);
    Module['internalInterval'] = undefined;
  },
  jsChromeTabsDiscard: function(tabId) {
    const desaturateFavicon = function(favIconUrl) {
      const image = new Image();
      image.src = favIconUrl;

      image.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
                
        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);

        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let px = imageData.data;
        let grey;
        for (let i = px.length; i >= 0; i -= 4) {
          grey = px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11;
          px[i] = px[i + 1] = px[i + 2] = grey;
        }

        context.putImageData(imageData, 0, 0);
        browser.tabs.executeScript(tabId, {
          code:
            `if (!document.querySelector("link[rel~=icon]")) {
              document.head.insertAdjacentHTML(\'beforeend\', \'<link rel="icon">\');
            }
            if (document.querySelector("link[rel~=icon]")) {
              Array.prototype.slice.call(document.querySelectorAll("link[rel~=icon]")).forEach(function(l){ l.href = "${canvas.toDataURL('image/png')}"; });
            }`
        }, function() {
            setTimeout(function() {
              chrome.tabs.discard(tabId);
            }, 150)
        });
      };
    };

    browser.tabs.query({ active: false, discarded: false }).then((tabs) => {
      for (let tab of tabs) {
        if (tab.id === tabId) {
          desaturateFavicon(tab.favIconUrl);
          break;
        }
      }
    });
  },
  jsDesaturateFavicon: function(tabId) {

  },
  jsRestoreFavicon: function(tabId) {
    
  }
});
