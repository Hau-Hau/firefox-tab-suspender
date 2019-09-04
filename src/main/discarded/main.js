document.addEventListener('DOMContentLoaded', () => {
  const urlObj = new URL(window.location.href);
  const url = urlObj.searchParams.get('u');
  const title = urlObj.searchParams.get('t');
  const hash = urlObj.searchParams.get('h');
  const darkTheme = urlObj.searchParams.get('d');

  if (darkTheme != null && darkTheme === 'true') {
    document.body.style.background = '#000';
    document.body.style.color = '#fff';
  }

  const reloading = sessionStorage.getItem(hash);
  if (reloading) {
    sessionStorage.removeItem(reloading);
    window.location.replace(url);
  }

  sessionStorage.setItem(hash, 'true');
  document.title = title + ' - discarded';
  document.getElementById('t').innerHTML = title;
  document.getElementById('u').innerHTML = url;
  document.body.addEventListener('click', () => {
    window.location.replace(url);
  }, true);
});
