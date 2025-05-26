(async () => {
  const browser = window.browser || (typeof chrome !== "undefined" ? chrome : null);
  if (!browser) {
    console.error("Browser object is undefined. Extension APIs are not available.");
    return;
  }

  if (!localStorage.storage || !browser.storage || !browser.storage.local)
  {
    console.error("browser.storage.local is undefined. Check permissions in manifest.json.");
    return;
  }

  let LoadedTweets;
  try
  {
    const data = await localStorage.getItem("Tweets");
    LoadedTweets = new Set(data.LoadedTweets || []);

    console.log("Successfully fetched LoadedTweets from localstorage:", Array.from(LoadedTweets));

  } catch (error)
  {
    console.error("Error fetching localstorage: error: ", error);
    seenPosts = new Set();
  }

  async function SaveLoadedTweets() {
    try
    {
      await localStorage.setItem("Tweets", { LoadedTweets: Array.from(LoadedTweets) });
      console.log("Successfully Saved LoadedTweets:", Array.from(LoadedTweets));

    } catch (error)
    {
      console.error("Error saving to localstorage: error: ", error);
    }
  }

    // Function to process posts and hide duplicates
  function processPosts() {
    const posts = document.querySelectorAll('article[role="article"]');
    console.log(`Found ${posts.length} posts`);

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

      if (LoadedTweets.has(postId)) {
        console.log(`Hiding duplicate post ${postId}`);
        post.style.display = "none";
      } else {
        console.log(`Adding new post ${postId}`);
        LoadedTweets.add(postId);
        SaveLoadedTweets();
      }
    });
  }

  // Initial processing of posts
  console.log("Starting post processing");
  processPosts();

  // Observe DOM changes for dynamically loaded posts
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