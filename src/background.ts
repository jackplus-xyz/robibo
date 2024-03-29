export {}

// When the user clicks on the extension icon, open the options page
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage()
})
