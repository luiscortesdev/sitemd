<div align="center">
    <img src="./assets/sitemd-logo.svg" alt="SiteMD Logo" width="300" />
    <br />
    <br />
    <h1 style="border-bottom: none; margin-bottom: 0px;">SiteMD</h1>
    <p><strong>An easy-to-use, lightning-fast static site generator.</strong></p>
</div>

<br />

---

<br />

SiteMD is a hassle-free static site generator designed to be braindead easy to get started with. It combines the simplicity of Markdown with powerful Nunjucks templating, packaged with a modern incremental build development server.

It's the perfect solution for documentation, personal websites, blogs, and portfolios.

## 🗝️ Key Features
- ⚡**Lightning Fast Dev Server:** File watching with WebSockets for instant live-reloading (<10ms reload times).
- 🧠**Incremental Build Cache:** Advanced caching ensures only the pages you edit are rebuilt.
- 🔗**Layout Dependency Graph:** Tracks layout inheritance (`{% extends %}`). Editing a base layout instantly updates all dependent pages.
- 💪**Supercharged Markdown:** Native support for GitHub Flavored Markdown and custom HTML attributes (`# Hello World {.class #id my-data="example"}`) injected directly via custom AST parsers.
- 📖**Collections & Pagination:** Easily group pages by tags or folders and paginte them with zero configuration.
- 🛠️**Fully Typed:** Built from the group up in TypeScript.