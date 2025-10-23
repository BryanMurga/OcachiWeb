// URLs ya limpias (terminan en "/")
const POSTS = [
  "https://www.instagram.com/p/DQHhI3djbgb/",
  "https://www.instagram.com/p/DQFAhkpE_C9/",
  "https://www.instagram.com/p/DQE8U6QAdJi/",
  "https://www.instagram.com/p/DQCfTwlk74x/",
  "https://www.instagram.com/p/DP_yu7SAXaY/",
  "https://www.instagram.com/p/DP9N9s0jXEt/",
];

const feed = document.getElementById("ig-feed");

function renderEmbeds(urls) {
  feed.innerHTML = "";
  urls.slice(0, 6).forEach((url) => {
    const card = document.createElement("article");
    card.className = "ig__card";
    card.innerHTML = `
      <blockquote class="instagram-media"
                  data-instgrm-permalink="${url}"
                  data-instgrm-version="14"
                  style="background:#151515; border:0; margin:0; padding:0;">
      </blockquote>
    `;
    feed.appendChild(card);
  });

  // Render con script oficial
  const tryProcess = () => {
    if (window.instgrm && window.instgrm.Embeds)
      window.instgrm.Embeds.process();
    else setTimeout(tryProcess, 150);
  };
  tryProcess();
}

renderEmbeds(POSTS);
