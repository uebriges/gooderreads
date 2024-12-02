const button = document.querySelector("#toggleCSS");
const buttonCaptionShow = "Show 3 star ratings";
const buttonCaptionHide = "Hide 3 star ratings";
const storageKey3StarReviews = "show3StarReviews";

chrome.storage.local.get(storageKey3StarReviews, (result) => {
  console.log("inital value: ", result.show3StarReviews);
  if (result.show3StarReviews === undefined) {
    setButtonCaption(false, buttonCaptionShow);
  } else if (result.show3StarReviews === true) {
    button.innerHTML = buttonCaptionHide;
  } else {
    button.innerHTML = buttonCaptionShow;
  }
});

document.getElementById("toggleCSS").addEventListener("click", (button) => {
  console.log("event listener click");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "show3StarRatings" });
  });

  updateButtonCaptionOnClick();
});

// ----- helper functions -----

// Check for current storage entry and update button caption
// accordingly
function updateButtonCaptionOnClick() {
  chrome.storage.local.get(storageKey3StarReviews, (result) => {
    if (result.show3StarReviews === false) {
      setButtonCaption(true, buttonCaptionHide);
    } else {
      setButtonCaption(false, buttonCaptionShow);
    }
  });
}

// Set storage entry and set button caption
function setButtonCaption(value, caption) {
  chrome.storage.local.set({ [storageKey3StarReviews]: value }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error:", chrome.runtime.lastError);
    } else {
      button.innerHTML = caption;
    }
  });
}

// Close popup if website is refreshed
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "closePopup") {
    console.log("closing popup");
    window.close();
  }
});
