console.log("Initial document.readyState:", document.readyState);

function waitForArticles() {
  const articles = document.querySelectorAll("article");
  if (articles.length > 0) {
    console.log("Articles found:", articles.length);
    processArticles();
    observeMutations(); // Start observing mutations after initial load
  } else {
    console.log("No articles yet, retrying...");
    setTimeout(waitForArticles, 500); // Retry every 500ms
  }
}

// Observe for dynamic changes in the DOM
function observeMutations() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check added nodes for articles
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "ARTICLE") {
          console.log("New or rehydrated article found:", node);
          processArticle(node);
        }
      });
      mutation.removedNodes.forEach((node) => {
        console.log("Removed node:", node);
      });

      // Check if existing articles are re-rendered or modified
      if (
        mutation.type === "attributes" &&
        mutation.target.tagName === "ARTICLE"
      ) {
        console.log(
          "Article attributes changed or rehydrated:",
          mutation.target
        );
        processArticle(mutation.target);
      }
    });
  });

  // Start observing the body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true, // Observe attribute changes (React can modify them)
  });
}

function processArticles() {
  document.querySelectorAll("article").forEach((article) => {
    processArticle(article);
  });
}

function processArticle(article) {
  if (article.getAttribute("data-processed")) return;

  console.log("Processing article:", article);

  if (
    article.querySelector(
      'section > section > div > span[aria-label="Rating 3 out of 5"]'
    )
  ) {
    console.log("Article is 3 out of 5");
    article.classList.add("article-hidden");
    article.classList.add("three-star-reviews");
    article.setAttribute("data-processed", "true");
    console.log("article after change: ", article);
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
        console.log("Reapplying classes to article:", article);
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

waitForArticles();
observeAndReapply();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message received: ", message);
  threeStartReviews = document.getElementsByClassName("three-star-reviews");

  if (message.action === "show3StarRatings") {
    console.log("right action");

    const styleId = "dynamic-hide-css";
    const existingStyle = document.getElementById(styleId);

    console.log("existing style: ", existingStyle);
    if (existingStyle) {
      existingStyle.remove();
      console.log("CSS removed");
      sendResponse({ status: "CSS removed" });
    } else {
      console.log("doesn't exists yet");
      const style = document.createElement("style");
      style.id = styleId;

      style.textContent = `
      div.RatingsHistogram > div[data-testid="ratingBar-3"]
      {
        display: grid !important;
      }
        
      article.three-star-reviews {
          display: grid !important;
      }
      `;
      document.head.appendChild(style);
      console.log("CSS added");

      sendResponse({ status: "CSS added" });
    }
  }
});
