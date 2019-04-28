document.addEventListener('DOMContentLoaded', function() {
  const urlObj = new URL(window.location.href);
  const title = urlObj.searchParams.get('t');
  const url = urlObj.searchParams.get('u');

  document.title =  title + ' - discarded';
  document.getElementById('t').innerHTML = title;
  document.getElementById('u').innerHTML = url;
  document.body.addEventListener('click', function () {
    window.location.replace(url);
  }, true);
});
