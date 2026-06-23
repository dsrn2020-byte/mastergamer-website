const gamesGrid = document.querySelector("#gamesGrid");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#siteNav");
const contactForm = document.querySelector(".contact-form");
const canvas = document.querySelector("#arcadeCanvas");
const ctx = canvas?.getContext("2d");

function normaliseAction(value) {
  if (!value || value === "#") return null;
  if (value === "coming-soon") return { comingSoon: true };
  if (typeof value === "object" && value.url) return value;
  return { url: value };
}

function linkTargetAttributes(url) {
  return /^https?:/i.test(url) || /\.mp4$/i.test(url) ? ' target="_blank" rel="noopener"' : "";
}

function createActionLink(value, label, className = "") {
  const action = normaliseAction(value);
  if (!action) return "";

  if (action.comingSoon) {
    return `<span class="button button-disabled ${className}" aria-disabled="true">Coming Soon</span>`;
  }

  const linkLabel = action.label || label;
  return `<a class="button ${className}" href="${action.url}"${linkTargetAttributes(action.url)}>${linkLabel}</a>`;
}

function createGameActionLinks(game, options = {}) {
  const links = game.links || {};
  const actions = [
    createActionLink(links.appStore, "App Store"),
    createActionLink(links.googlePlay, "Google Play"),
    createActionLink(links.playOnline, "Play Online"),
    createActionLink(links.trailer, "Watch Trailer"),
  ];

  if (options.includeLearnMore && game.detailPage) {
    actions.push(`<a class="button button-secondary" href="${game.detailPage}">Learn More</a>`);
  }

  if (options.includeBackLink) {
    actions.push(`<a class="button button-secondary" href="index.html#games">Back to Library</a>`);
  }

  return actions.filter(Boolean).join("");
}

function createPlatformButtons(game) {
  const links = game.links || {};
  const platforms = [
    { key: "ios", label: "IOS", value: links.appStore },
    { key: "android", label: "ANDROID", value: links.googlePlay },
    { key: "web", label: "WEB", value: links.playOnline },
  ];

  return platforms
    .map((platform) => {
      const action = normaliseAction(platform.value);
      if (!action) return "";

      const url = action.comingSoon ? "index.html#play" : action.url;
      return `<a class="platform-button platform-${platform.key}" href="${url}"${linkTargetAttributes(url)}>${platform.label}</a>`;
    })
    .filter(Boolean)
    .join("");
}

function createGameCard(game, index) {
  const card = document.createElement("article");
  card.className = "game-card";
  card.style.setProperty("--accent", game.accent);
  const platforms = createPlatformButtons(game);
  const icon = createIconMarkup(game, "game-icon");
  const description = formatDescription(game.description);
  const banner = game.media?.banner
    ? `<img class="game-banner" src="${game.media.banner}" alt="${game.title} promotional banner" loading="lazy" />`
    : "";
  const features = game.features?.length
    ? `<ul class="feature-list">${game.features.map((feature) => `<li>${feature}</li>`).join("")}</ul>`
    : "";
  const actionLinks = createGameActionLinks(game, { includeLearnMore: true });

  card.innerHTML = `
    <button class="game-toggle" type="button" aria-expanded="false" aria-controls="game-panel-${index}">
      ${icon}
      <span class="game-meta">
        <strong>${game.title}</strong>
        ${game.subtitle ? `<em>${game.subtitle}</em>` : ""}
        <span>${game.summary}</span>
      </span>
      <span class="expand-symbol" aria-hidden="true"></span>
    </button>
    <div class="game-details" id="game-panel-${index}">
      ${banner}
      <div class="platform-badges" aria-label="Available platforms">${platforms}</div>
      ${description}
      ${features}
      <div class="game-links">
        ${actionLinks}
      </div>
    </div>
  `;

  const toggle = card.querySelector(".game-toggle");
  const details = card.querySelector(".game-details");

  toggle.addEventListener("click", () => {
    const isOpen = card.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    details.style.maxHeight = isOpen ? `${details.scrollHeight}px` : "0px";
  });

  return card;
}

function createIconMarkup(game, className) {
  if (game.media?.icon) {
    return `<span class="${className}" aria-hidden="true"><img src="${game.media.icon}" alt="" /></span>`;
  }

  return `<span class="${className}" aria-hidden="true">${game.initials}</span>`;
}

function formatDescription(description) {
  return description
    .split("\n\n")
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

function formatDisplayDate(value) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getSortedNews() {
  if (typeof MASTERGAMER_NEWS === "undefined") return [];

  return [...MASTERGAMER_NEWS].sort(
    (first, second) => new Date(second.date) - new Date(first.date),
  );
}

function createNewsCard(article) {
  const card = document.createElement("article");
  card.className = "news-card";
  card.innerHTML = `
    <a class="news-image-link" href="${article.url}" aria-label="Read ${article.title}">
      <img src="${article.image}" alt="${article.title}" loading="lazy" />
    </a>
    <div class="news-card-copy">
      <time datetime="${article.date}">${formatDisplayDate(article.date)}</time>
      <h3>${article.title}</h3>
      <p>${article.summary}</p>
      <a class="button button-secondary" href="${article.url}">Read More</a>
    </div>
  `;

  return card;
}

function renderNewsCards(selector, limit) {
  const grid = document.querySelector(selector);
  if (!grid) return;

  const articles = getSortedNews().slice(0, limit || undefined);
  articles.forEach((article) => grid.appendChild(createNewsCard(article)));
}

function renderGames() {
  if (!gamesGrid || typeof MASTERGAMER_GAMES === "undefined") return;
  const groups = [
    {
      title: "Featured Games",
      games: MASTERGAMER_GAMES.filter((game) => game.featured),
    },
    {
      title: "Classic Games / Archive Games",
      games: MASTERGAMER_GAMES.filter((game) => !game.featured),
    },
  ];

  let cardIndex = 0;
  groups.forEach((group) => {
    if (!group.games.length) return;
    const heading = document.createElement("h3");
    heading.className = "games-category-heading";
    heading.textContent = group.title;
    gamesGrid.appendChild(heading);

    group.games.forEach((game) => {
      gamesGrid.appendChild(createGameCard(game, cardIndex));
      cardIndex += 1;
    });
  });
}

function renderFeaturedGames() {
  const featuredGrid = document.querySelector("#featuredGames");
  if (!featuredGrid || typeof MASTERGAMER_GAMES === "undefined") return;

  getFeaturedGames().forEach((game) => {
    const item = document.createElement("article");
    item.className = "featured-game";
    item.style.setProperty("--accent", game.accent);
    item.innerHTML = `
      ${createIconMarkup(game, "game-icon")}
      <div>
        <h3>${game.title}</h3>
        <p>${game.summary}</p>
      </div>
    `;
    featuredGrid.appendChild(item);
  });
}

function getFeaturedGames() {
  const featuredOrder = [
    "Sevens",
    "TinyFall",
    "HumDing",
    "Chicken Flapper: Haunted Forest",
  ];

  return featuredOrder
    .map((title) => MASTERGAMER_GAMES.find((game) => game.title === title))
    .filter(Boolean);
}

function renderHeroFeaturedGames() {
  const heroGrid = document.querySelector("#heroFeaturedGames");
  if (!heroGrid || typeof MASTERGAMER_GAMES === "undefined") return;

  getFeaturedGames().forEach((game) => {
    const card = document.createElement("article");
    card.className = "hero-game-card";
    card.style.setProperty("--accent", game.accent);
    const displayTitle = game.title.replace(":", "");
    const learnMoreHref = game.detailPage || "#games";
    const playAction = createActionLink(game.links?.playOnline, "Play", "button-primary");

    card.innerHTML = `
      ${createIconMarkup(game, "game-icon hero-game-icon")}
      <div class="hero-game-copy">
        <h3>${displayTitle}</h3>
        ${game.subtitle ? `<strong>${game.subtitle}</strong>` : ""}
        <p>${game.summary}</p>
      </div>
      <div class="hero-game-actions">
        ${playAction || `<a class="button button-primary" href="${learnMoreHref}">View Game</a>`}
        <a class="button button-secondary" href="${learnMoreHref}">Learn More</a>
      </div>
    `;

    heroGrid.appendChild(card);
  });
}

function renderDetailPageActions() {
  if (typeof MASTERGAMER_GAMES === "undefined") return;

  const actions = document.querySelector(".game-detail-hero .hero-actions");
  if (!actions) return;

  const pageName = window.location.pathname.split("/").pop() || "index.html";
  const game = MASTERGAMER_GAMES.find((item) => item.detailPage === pageName);
  if (!game) return;

  const platformButtons = createPlatformButtons(game);
  let detailPlatforms = document.querySelector(".game-detail-copy .platform-badges");
  if (platformButtons) {
    if (!detailPlatforms) {
      detailPlatforms = document.createElement("div");
      detailPlatforms.className = "platform-badges platform-badges-detail";
      detailPlatforms.setAttribute("aria-label", "Available platforms");
      actions.before(detailPlatforms);
    }
    detailPlatforms.innerHTML = platformButtons;
  } else {
    detailPlatforms?.remove();
  }

  actions.innerHTML = createGameActionLinks(game, { includeBackLink: true });
}

function setupScreenshotCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector(".screenshot-track");
  const slides = [...carousel.querySelectorAll(".screenshot-slide")];
  const dots = [...carousel.querySelectorAll(".carousel-dot")];
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  let activeIndex = 0;

  function updateCarousel(index) {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", dotIndex === activeIndex ? "true" : "false");
    });
  }

  previous?.addEventListener("click", () => updateCarousel(activeIndex - 1));
  next?.addEventListener("click", () => updateCarousel(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => updateCarousel(index)));
  updateCarousel(0);
}

function setupNavigation() {
  if (!navToggle || !siteNav) return;
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupContactForm() {
  if (!contactForm) return;

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const body = [
      `Name: ${formData.get("name") || ""}`,
      `Email: ${formData.get("email") || ""}`,
      `Message: ${formData.get("message") || ""}`,
    ].join("\n\n");

    window.location.href = `mailto:info@mastergamer.com.au?subject=${encodeURIComponent("Mastergamer Website Enquiry")}&body=${encodeURIComponent(body)}`;
  });
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawArcadeGrid(time = 0) {
  if (!canvas || !ctx) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(43, 220, 255, 0.055)";
  ctx.lineWidth = 1;

  for (let x = 0; x < width + 120; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x + Math.sin(time / 1600) * 10, 0);
    ctx.lineTo(x - 80 + Math.sin(time / 1700) * 10, height);
    ctx.stroke();
  }

  for (let i = 0; i < 20; i += 1) {
    const x = (i * 173 + time / 28) % width;
    const y = 80 + ((i * 97) % Math.max(140, height * 0.7));
    ctx.fillStyle = i % 2 === 0 ? "rgba(155, 92, 255, 0.28)" : "rgba(43, 220, 255, 0.24)";
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawArcadeGrid);
}

renderGames();
renderFeaturedGames();
renderHeroFeaturedGames();
renderDetailPageActions();
renderNewsCards("#latestNewsGrid", 3);
renderNewsCards("#newsPageGrid");
setupNavigation();
setupScreenshotCarousel();
setupContactForm();
resizeCanvas();
drawArcadeGrid();

window.addEventListener("resize", resizeCanvas);
