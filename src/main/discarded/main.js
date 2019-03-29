document.addEventListener('DOMContentLoaded', function() {
  const url = new URL(window.location.href);
  console.log(url.searchParams.get('t'));
  console.log(url.searchParams.get('u'));
  document.title = url.searchParams.get('t') + ' - discarded';
  document.addEventListener('focus', function () {
    window.location.href = url.searchParams.get('u');
  }, true);
});

