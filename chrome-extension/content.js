// Signal to the website that the extension is installed
if (window.location.hostname.includes('trustworthycheck')) {
  document.documentElement.setAttribute('data-twc-extension', 'true');
}
