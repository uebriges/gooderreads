initButtonText();

document.getElementById("toggleCSS").addEventListener("click", (button) => {
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

  updateButtonText();
});

function initButtonText() {
  const button = document.querySelector("#toggleCSS");
  button.innerText = "Show 3 star ratings";
  button.classList.remove("shown");
  button.classList.add("hidden");
}

function updateButtonText() {
  const button = document.querySelector("#toggleCSS");
  if (button.classList.contains("hidden")) {
    button.innerText = "Hide 3 star ratings";
    button.classList.remove("hidden");
    button.classList.add("shown");
  } else {
    button.innerText = "Show 3 star ratings";
    button.classList.remove("shown");
    button.classList.add("hidden");
  }
}

// Close popup if website is refreshed
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "closePopup") {
    window.close();
  }
});
