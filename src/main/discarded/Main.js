// eslint-disable-next-line filenames/match-regex
document.addEventListener('DOMContentLoaded', () => {
  const RESTORE_PAGE_ACTION_ID = 'RESTORE_PAGE';

  const urlObject = new URL(window.location.href);
  const url = urlObject.searchParams.get('u');
  const title = urlObject.searchParams.get('t');
  const hash = urlObject.searchParams.get('h');
  const darkTheme = urlObject.searchParams.get('d');

  if (darkTheme != null && darkTheme === 'true') {
    document.body.style.background = '#000';
    document.body.style.color = '#fff';
  }

  const restorePage = () => {
    if (browser.runtime == null) {
      location.replace(url);

      return;
    }

    browser.runtime.sendMessage({
      action: RESTORE_PAGE_ACTION_ID,
      url,
    });
  };

  const reloading = sessionStorage.getItem(hash);
  if (reloading) {
    sessionStorage.removeItem(reloading);
    restorePage();
  }

  sessionStorage.setItem(hash, 'true');
  document.title = title + ' - discarded';
  document.querySelector('#t').innerHTML = title;
  document.querySelector('#u').innerHTML = url;

  document.body.addEventListener('click', () => {
    restorePage();
  }, true);
});
