(() => {
  // Function to extract a tweet ID from a post element
  function extractPostId(post) {
    const link = post.querySelector('a[href*="/status/"]');
    if (link) {
      const match = link.href.match(/\/status\/(\d+)/);
      return match ? match[1] : null;
    }

    const timeElement = post.querySelector('time');
    if (timeElement) {
      const parentLink = timeElement.closest('a[href*="/status/"]');
      if (parentLink) {
        const match = parentLink.href.match(/\/status\/(\d+)/);
        return match ? match[1] : null;
      }
    }

    return null;
  }

  // Function to process posts and hide visual duplicates
  function processPosts() {
    const idsInCurrentBatch = new Set(); // ← Reset per batch!
    const postElements = document.querySelectorAll('div[data-testid="cellInnerDiv"] article[role="article"]');
    console.log(`Found ${postElements.length} posts`);

    postElements.forEach((post, index) => {
      const postId = extractPostId(post);

      if (!postId) {
        console.warn(`Post ${index} has no valid ID, skipping`);
        return;
      }

      console.log(`Post ${index}: ID = ${postId}, Display = ${post.style.display || "default"}`);

      if (idsInCurrentBatch.has(postId)) {
        console.log(`Hiding duplicate post in current batch: ${postId}`);
        post.style.display = 'none';
      } else {
        console.log(`Showing new post: ${postId}`);
        post.style.display = ''; // Explicitly show
        idsInCurrentBatch.add(postId);
      }
    });
  }

  // Initial run
  console.log("Starting post processing");
  processPosts();

  // Debounced MutationObserver
  let mutationTimer = null;
  const observer = new MutationObserver(() => {
    console.log("DOM changed, scheduling re-check");
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(() => {
      console.log("Re-checking posts");
      processPosts();
    }, 100);
  });

  // Target node for DOM watching
  const targetNode = document.querySelector('main[role="main"]') || document.body;
  console.log("Observing target node:", targetNode);
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });
})();
