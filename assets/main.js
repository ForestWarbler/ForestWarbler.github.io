"use strict";

const CONTENT_SECTIONS = ["site", "profile", "research", "publications", "miscellaneous"];
const LANGUAGE_KEY = "homepage-language";
let content;
let language = "zh";

try {
  if (localStorage.getItem(LANGUAGE_KEY) === "en") language = "en";
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

function render() {
  const { site, profile, research, publications, miscellaneous } = Object.fromEntries(
    CONTENT_SECTIONS.map((section) => [section, content[section][language]]),
  );

  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = site.title;
  document.querySelector('meta[name="description"]').content = site.description;
  for (const [id, key] of Object.entries({
    brand: "brand", "skip-link": "skipLink", footer: "footer", "back-to-top": "backToTop",
  })) {
    setText(id, site[key]);
  }
  element("navigation").setAttribute("aria-label", site.navigationLabel);

  const toggle = element("language-toggle");
  toggle.textContent = site.languageButtonText;
  toggle.lang = language === "zh" ? "en" : "zh-CN";
  toggle.setAttribute("aria-label", site.languageButtonLabel);

  setText("nav-profile", profile.title);
  setText("profile-name", profile.name);
  setText("profile-affiliation", profile.affiliation);
  element("profile-affiliation").hidden = !profile.affiliation;
  renderParagraphs("profile-paragraphs", profile.paragraphs);
  setText("contact-title", profile.contact.title);
  renderParagraphs("contact-details", profile.contact.details);
  renderLinks(element("contact-links"), profile.contact.links);

  for (const [key, section] of Object.entries({ research, publications, miscellaneous })) {
    setText(`${key}-title`, section.title);
    setText(`nav-${key}`, section.title);
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
    ...publications.items.map((publication) => {
      const item = createElement("li", "publication");
      const details = createElement("div", "publication-details");
      details.append(createElement("h3", "", publication.title));
      if (publication.authors) {
        details.append(createElement("p", "publication-authors", publication.authors));
      }
      if (publication.venue) {
        details.append(createElement("p", "publication-venue", publication.venue));
      }
      const links = createElement("ul", "inline-links publication-links");
      links.setAttribute("role", "list");
      renderLinks(links, publication.links);
      details.append(links);
      item.append(createElement("span", "publication-year", publication.year), details);
      return item;
    }),
  );

  renderParagraphs("miscellaneous-paragraphs", miscellaneous.paragraphs);
  renderLinks(element("miscellaneous-links"), miscellaneous.links);
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

init();
