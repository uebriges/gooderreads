chrome.storage.local.get("show3StarReviews", (result) => {
  console.log("inital value: ", result.show3StarReviews);
  const button = document.querySelector("#toggleCSS");
  console.log("button: ", button);
  if (result.show3StarReviews === undefined) {
    chrome.storage.local.set({ show3StarReviews: false }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError);
      } else {
        console.log("Data saved in storage.");
        button.innerHTML = "Show 3 star ratings";
      }
    });
  } else if (result.show3StarReviews === true) {
    console.log("Switched text to 'hide'");
    button.innerHTML = "Hide 3 star ratings";
  } else {
    console.log("Switched text to 'show'");
    button.innerHTML = "Show 3 star ratings";
  }
});

document.getElementById("toggleCSS").addEventListener("click", (button) => {
  console.log("event listener click");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "show3StarRatings" });
  });

  updateButtonText();
});

function updateButtonText() {
  const button = document.querySelector("#toggleCSS");
  chrome.storage.local.get("show3StarReviews", (result) => {
    if (result.show3StarReviews === false) {
      console.log("not shown yet - going to show");
      button.innerHTML = "Hide 3 star ratings";
      chrome.storage.local.set({ show3StarReviews: true }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError);
        }
      });
    } else {
      console.log("shown already - going to hide");
      button.innerHTML = "Show 3 star ratings";
      chrome.storage.local.set({ show3StarReviews: false }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError);
        }
      });
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
