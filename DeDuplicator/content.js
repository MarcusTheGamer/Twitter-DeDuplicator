(async () => {
  // Ensure browser object is available
  const browser = window.browser || (typeof chrome !== "undefined" ? chrome : null);
  if (!browser) {
    console.error("Browser object is undefined. Extension APIs are not available.");
    return;
  }

  // Check if storage API is available
  if (!browser.storage || !browser.storage.local) {
    console.error("browser.storage.local is undefined. Check permissions in manifest.json.");
    return;
  }

  // Initialize storage for seen posts
  let seenPosts;
  try {
    const data = await browser.storage.local.get("seenPosts");
    seenPosts = new Set(data.seenPosts || []);
    console.log("Loaded seenPosts:", Array.from(seenPosts));
  } catch (error) {
    console.error("Error accessing storage:", error);
    seenPosts = new Set();
  }

  // Function to save seen posts to storage
  async function saveSeenPosts() {
    try {
      await browser.storage.local.set({ seenPosts: Array.from(seenPosts) });
      console.log("Saved seenPosts:", Array.from(seenPosts));
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  }

function processPosts() {
  const posts = document.querySelectorAll('article[role="article"]');
  console.log(`Found ${posts.length} posts`);

  const newPostIds = new Set();

  posts.forEach((post, index) => {
    let postId = null;

    const link = post.querySelector('a[href*="/status/"]');
    if (link) {
      const match = link.href.match(/\/status\/(\d+)/);
      postId = match ? match[1] : null;
    }

    if (!postId) {
      const timeElement = post.querySelector('time');
      if (timeElement) {
        const parentLink = timeElement.closest('a[href*="/status/"]');
        if (parentLink) {
          const match = parentLink.href.match(/\/status\/(\d+)/);
          postId = match ? match[1] : null;
        }
      }
    }

    console.log(`Post ${index}: ID = ${postId || "not found"}`);
    if (!postId) {
      console.warn(`Post ${index}: No valid ID found, skipping`);
      return;
    }

    if (seenPosts.has(postId)) {
      console.log(`Hiding duplicate post ${postId}`);
      post.style.display = "none";
    } else {
      newPostIds.add(postId);
    }
  });

  // Add all newly seen posts to the seenPosts set
  if (newPostIds.size > 0) {
    for (const id of newPostIds) {
      seenPosts.add(id);
    }
    saveSeenPosts();
  }
}

  // Start of the actual code that runs the functions and gets everything going

  // Initial processing of posts
  console.log("Starting post processing");
  processPosts();

  // Look for changes in the DOM (Basically the HTML) to detect if new posts have loaded, 
  // due to Twitter loading posts depending on the height of the page and where the user is on said page
  const observer = new MutationObserver((mutations) => {
    console.log("DOM changed, reprocessing posts");
    mutations.forEach(() => processPosts());
  });

  const targetNode = document.querySelector('main[role="main"]') || document.body;
  console.log("Observing target node:", targetNode);
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });
})();