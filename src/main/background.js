function openPage() {
  browser.runtime.openOptionsPage();
}

browser.browserAction.onClicked.addListener(openPage);