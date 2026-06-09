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
- ⚡**Lightning-Fast Dev Server:** File watching with WebSockets for instant live-reloading (<10ms reload times).
- 🧠**Incremental Build Cache:** Advanced caching ensures only the pages you edit are rebuilt.
- 🔗**Layout Dependency Graph:** Tracks layout inheritance (`{% extends %}`). Editing a base layout instantly updates all dependent pages.
- 💪**Supercharged Markdown:** Native support for GitHub Flavored Markdown and custom HTML attributes (`# Hello World {.class #id my-data="example"}`) injected directly via custom AST parsers.
- 📖**Collections & Pagination:** Easily group pages by tags or folders and paginte them with zero configuration.
- 🎨**Theme System:** Countless beautiful community themes that can be added to your site with the `addtheme` command.
- 🛠️**Fully Typed:** Built from the group up in TypeScript.

---

## 🚀 Quick Start
Get a SiteMD project running in under a minute.

**1. Install SiteMD globally (or locally in your project):**
```bash
npm install -g sitemd
```
Or install locally
```bash
npm install sitemd
```

**2. Initialize a folder and Node.js project:**
```bash
mkdir my-blog && cd my-blog
npm init -y
```

**3. Initialize your SiteMD project:**
```bash
sitemd init
```
You can even initialize your project with a community theme!
```bash
sitemd init --theme minimal
```

**4. Start the Dev Server:**
```bash
sitemd dev
```
Your SiteMD project is now running at `http://localhost:3000` with live-reloading enabled!