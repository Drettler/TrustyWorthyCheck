// Get the current tab URL when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const urlElement = document.getElementById('currentUrl');
  const checkButton = document.getElementById('checkButton');
  
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url) {
      const url = new URL(tab.url);
      urlElement.textContent = url.hostname;
      
      // Store the full URL for the check
      checkButton.dataset.url = tab.url;
    } else {
      urlElement.textContent = 'Unable to get URL';
      checkButton.disabled = true;
    }
  } catch (error) {
    urlElement.textContent = 'Unable to get URL';
    checkButton.disabled = true;
  }
});

// Handle check button click
document.getElementById('checkButton').addEventListener('click', () => {
  const url = document.getElementById('checkButton').dataset.url;
  
  if (url) {
    // Open the checker with the URL pre-filled
    // Replace with your actual deployed URL
    const checkerUrl = `https://isthissitesafe.com/?check=${encodeURIComponent(url)}`;
    chrome.tabs.create({ url: checkerUrl });
  }
});
