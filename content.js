waitForArticles();
observeAndReapply();

// Listen for messages from the popup and add style tag in
// order to show 3 star ratings and the 3 star rating filter bar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  threeStartReviews = document.getElementsByClassName("three-star-reviews");

  if (message.action === "show3StarRatings") {
    const styleId = "dynamic-hide-css";
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
      sendResponse({ status: "CSS removed" });
    } else {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
      /* Show 3 star rating bar */
      div.RatingsHistogram > div[data-testid="ratingBar-3"] {
        display: grid !important;
        }
        
      /* Show 3 star ratings */
      article.three-star-reviews {
        display: grid !important;
      }
        
      div[aria-label="3 stars"] {
        display: grid !important;
      }`;
      document.head.appendChild(style);
    }
  }
});

// ONLY FOR FIREFOX NECESSARY
// Send message to close popup when page is refreshed
if (typeof browser !== "undefined") {
  window.addEventListener("beforeunload", () => {
    chrome.runtime.sendMessage({ action: "closePopup" }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
      }
    });
  });
}

// Check for hard refresh of the site and set "show3StarReviews"
// extension storage entry to false
const [navEntry] = performance.getEntriesByType("navigation");
if (navEntry.type === "reload") {
  chrome.storage.local.set({ show3StarReviews: false }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error:", chrome.runtime.lastError);
    }
  });
}

// ---- helper functions ----

// Waits for articles to be loaded and processes them.
// If they are not loaded yet this function is started again after 500 ms
// As soon as observeMutations is started, it takes over to process any changes in articles
// from there on
function waitForArticles() {
  const articles = document.querySelectorAll("article");
  if (articles.length > 0) {
    processArticles();
    observeMutations(); // Start observing mutations after initial load
  } else {
    setTimeout(waitForArticles, 500);
  }
}

// Observe for dynamic changes in the DOM (e.g. add or remove nodes)
function observeMutations() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check added nodes for articles
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "ARTICLE") {
          processArticle(node);
        }
      });
      // Check if existing articles are re-rendered or modified (e.g. adding/removing attributes)
      if (
        mutation.type === "attributes" &&
        mutation.target.tagName === "ARTICLE"
      ) {
        processArticle(mutation.target);
      }
    });
  });

  // Start observing the body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true, // Observe attribute changes (React/Next.js can modify them)
  });
}

// Find all article tags and run processArticle
function processArticles() {
  document.querySelectorAll("article").forEach((article) => {
    processArticle(article);
  });
}

// If already processed -> return
// If Rating 3 out of 5 -> add classes and the data-processed attribute
function processArticle(article) {
  if (article.getAttribute("data-processed")) return;

  if (
    article.querySelector(
      'section > section > div > span[aria-label="Rating 3 out of 5"]'
    )
  ) {
    article.classList.add("article-hidden");
    article.classList.add("three-star-reviews");
    article.setAttribute("data-processed", "true");
  }
}

function reapplyClasses() {
  document.querySelectorAll("article").forEach((article) => {
    if (
      article.querySelector(
        'section > section > div > span[aria-label="Rating 3 out of 5"]'
      )
    ) {
      if (!article.classList.contains("article-hidden")) {
        article.classList.add("article-hidden", "three-star-reviews");
      }
    }
  });
}

function observeAndReapply() {
  // Process articles initially
  processArticles();

  // Observe mutations
  observeMutations();

  // Periodically reapply classes
  setInterval(reapplyClasses, 500);
}
