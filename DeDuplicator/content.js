// Run this once at the start
processPosts();

let mutationTimer = null;

const observer = new MutationObserver(() => {
  clearTimeout(mutationTimer);
  mutationTimer = setTimeout(() => {
    console.log("DOM changed, re-checking");
    processPosts();
  }, 100);
});

observer.observe(document.body, { childList: true, subtree: true });

function processPosts() {
  const postElements = document.querySelectorAll('article[role="article"]');
  if (postElements.length === 0) return;

  console.log(`Found ${postElements.length} posts`);

  // Track post IDs seen in THIS batch only
  const idsInCurrentBatch = new Set();

  postElements.forEach((post, index) => {
    let postId = null;

    // Try to find link with /status/ and extract ID
    const link = post.querySelector('a[href*="/status/"]');
    if (link) {
      const match = link.href.match(/\/status\/(\d+)/);
      postId = match ? match[1] : null;
    }

    // Fallback: check if time element is inside a link with /status/
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

    if (!postId) {
      console.warn(`Could not find post ID for post ${index}`);
      return;
    }

    console.log(`Post ${index}: ID = ${postId}`);

    if (idsInCurrentBatch.has(postId)) {
      // Duplicate in current batch - hide it
      post.style.display = 'none';
      console.log(`Hid duplicate post in current batch: ${postId}`);
    } else {
      // Show post and remember its ID
      post.style.display = '';
      idsInCurrentBatch.add(postId);
    }
  });
}
