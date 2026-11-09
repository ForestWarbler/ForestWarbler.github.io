"use strict";

const PAGE = document.body.dataset.page || "academic";
const PAGE_SECTIONS = {
  academic: ["profile", "research", "publications"],
  music: ["music"],
  fun: ["fun"],
};
const CONTENT_SECTIONS = ["site", ...PAGE_SECTIONS[PAGE]];
const LANGUAGE_KEY = "homepage-language";
const THEME_KEY = "homepage-theme";
let content;
let language = "en";
let theme = document.documentElement.dataset.theme === "night" ? "night" : "day";

try {
  if (localStorage.getItem(LANGUAGE_KEY) === "zh") language = "zh";
} catch {
  // Language switching still works if browser storage is unavailable.
}

const element = (id) => document.getElementById(id);
const setText = (id, value) => {
  element(id).textContent = value;
};

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function createLink({ label, url }) {
  const link = createElement("a", "", label);
  const parsed = new URL(url, document.baseURI);
  if (!["https:", "http:", "mailto:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported link protocol: ${parsed.protocol}`);
  }
  link.href = parsed.href;
  return link;
}

function renderParagraphs(id, paragraphs) {
  const container = element(id);
  container.replaceChildren(...paragraphs.map((text) => createElement("p", "", text)));
  container.hidden = paragraphs.length === 0;
}

function renderLinks(container, links) {
  container.replaceChildren(
    ...links.map((link) => {
      const item = createElement("li");
      item.append(createLink(link));
      return item;
    }),
  );
  container.hidden = links.length === 0;
}

function renderTheme() {
  const night = theme === "night";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = night ? "dark" : "light";
  document.querySelector('meta[name="color-scheme"]').content = night ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]').content = night ? "#25243d" : "#ca9358";

  const button = element("theme-toggle");
  const labels = content.site[language].themeButtons[theme];
  button.textContent = labels.text;
  button.setAttribute("aria-label", labels.label);
  button.setAttribute("aria-pressed", String(night));
}

function render() {
  const site = content.site[language];
  const page = site.pages[PAGE];

  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = `${site.brand} · ${page.title}`;
  document.querySelector('meta[name="description"]').content = page.description;
  element("brand").setAttribute("aria-label", site.brand);
  for (const [id, key] of Object.entries({
    "skip-link": "skipLink", footer: "footer", "back-to-top": "backToTop",
  })) {
    setText(id, site[key]);
  }
  element("navigation").setAttribute("aria-label", site.navigationLabel);
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    const pageId = link.dataset.pageLink;
    link.textContent = site.pages[pageId].label;
    if (pageId === PAGE) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const toggle = element("language-toggle");
  toggle.textContent = site.languageButtonText;
  toggle.lang = document.documentElement.lang;
  toggle.setAttribute("aria-label", site.languageButtonLabel);
  renderTheme();

  if (PAGE === "academic") renderAcademic();
  else renderProjectPage();
}

function renderAcademic() {
  const profile = content.profile[language];
  const research = content.research[language];
  const publications = content.publications[language];

  const nameParts = profile.name.match(/^(.+?)\s*([（(].+[）)])$/);
  const nameHeading = element("profile-name");
  nameHeading.replaceChildren(createElement("span", "name-primary", nameParts ? nameParts[1] : profile.name));
  if (nameParts) {
    nameHeading.append(document.createTextNode(" "), createElement("span", "name-secondary", nameParts[2]));
  }
  element("profile-photo").alt = profile.name;
  setText("profile-affiliation", profile.affiliation);
  element("profile-affiliation").hidden = !profile.affiliation;
  renderParagraphs("profile-paragraphs", profile.paragraphs);
  setText("contact-title", profile.contact.title);
  renderParagraphs("contact-details", profile.contact.details);
  renderLinks(element("contact-links"), profile.contact.links);

  for (const [key, section] of Object.entries({ research, publications })) {
    setText(`${key}-title`, section.title);
  }

  renderParagraphs("research-paragraphs", research.paragraphs);
  element("research-interests").replaceChildren(
    ...research.interests.map(({ name, description }) => {
      const item = createElement("li");
      item.append(createElement("strong", "", name));
      if (description) item.append(document.createTextNode(` — ${description}`));
      return item;
    }),
  );
  element("research-interests").hidden = research.interests.length === 0;

  setText("publications-description", publications.description);
  element("publications-description").hidden = !publications.description;
  element("publication-list").replaceChildren(
    ...content.publications.items.map((publication) => {
      const item = createElement("li", "publication");
      const details = createElement("div", "publication-details");
      details.append(createElement("h3", "", publication.title));
      if (publication.authors) {
        details.append(createElement("p", "publication-authors", publication.authors));
      }
      const venueAndYear = [publication.venue, publication.year].filter(Boolean).join(", ");
      if (venueAndYear) {
        details.append(createElement("p", "publication-venue", venueAndYear));
      }
      const links = createElement("ul", "inline-links publication-links");
      links.setAttribute("role", "list");
      renderLinks(links, publication.links);
      details.append(links);
      item.append(details);
      return item;
    }),
  );
}

function renderProjectPage() {
  const page = content[PAGE][language];
  setText("page-title", page.title);
  renderParagraphs("page-paragraphs", page.paragraphs);
  renderLinks(element("page-links"), page.links);
  if (PAGE === "music") {
    setText("album-title", page.album.title);
    setText("album-status", page.album.status);
  }
}

element("language-toggle").addEventListener("click", () => {
  language = language === "zh" ? "en" : "zh";
  render();
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Keep the selected language for this visit when storage is disabled.
  }
});

element("theme-toggle").addEventListener("click", () => {
  theme = theme === "day" ? "night" : "day";
  renderTheme();
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Keep the selected theme for this visit when storage is unavailable.
  }
});

// A page restored by Back/Forward should use the latest site-wide preferences.
window.addEventListener("pageshow", ({ persisted }) => {
  if (!persisted || !content) return;
  try {
    language = localStorage.getItem(LANGUAGE_KEY) === "zh" ? "zh" : "en";
    theme = localStorage.getItem(THEME_KEY) === "night" ? "night" : "day";
  } catch {
    // Keep this page's preferences when storage is unavailable.
  }
  render();
});

async function init() {
  try {
    const sections = await Promise.all(
      CONTENT_SECTIONS.map(async (section) => {
        const response = await fetch(`./content/${section}.json`);
        if (!response.ok) throw new Error(`Could not load ${section}: ${response.status}`);
        const data = await response.json();
        if (!data.zh || !data.en) throw new Error(`Missing language in ${section}.json`);
        return [section, data];
      }),
    );
    content = Object.fromEntries(sections);
    render();
    element("page").hidden = false;
    // Anchor targets are hidden until their content has finished loading.
    if (location.hash) element(location.hash.slice(1))?.scrollIntoView();
  } catch (error) {
    console.error("Homepage content could not be loaded.", error);
    element("load-error").hidden = false;
  } finally {
    element("loading").hidden = true;
  }
}

// Keep links to the former music section working.
if (PAGE === "academic" && location.hash === "#miscellaneous") {
  location.replace("./music.html");
} else {
  init();
}
