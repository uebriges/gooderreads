document.getElementById("toggleCSS").addEventListener("click", () => {
  console.log("event listener click");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "show3StarRatings" },
      (response) => {
        console.log("Response from content script:", response);
      }
    );
  });
});
