<div align="center">
    <img src="https://raw.githubusercontent.com/luiscortesdev/sitemd/refs/heads/main/assets/sitemd-logo.svg" alt="SiteMD Logo" width="300" />
    <br />
    <h1>SiteMD</h1>
</div>

<div align="center">
    <a href="https://github.com/luiscortesdev/sitemd/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/luiscortesdev/sitemd/ci.yml?branch=main&style=for-the-badge" alt="CI Status" /></a>
    <a href="https://www.npmjs.com/package/@luiscortesdev/sitemd"><img src="https://img.shields.io/npm/v/@luiscortesdev/sitemd.svg?color=0C4292&style=for-the-badge" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@luiscortesdev/sitemd"><img src="https://img.shields.io/npm/d18m/%40luiscortesdev%2Fsitemd?style=for-the-badge&color=ffbf00" alt="NPM Downloads" /></a>
    <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-black.svg?style=for-the-badge" alt="License: MIT" /></a>
</div>

<br />

SiteMD is a hassle-free static site generator designed to be braindead easy to get started with. It combines the simplicity of Markdown with powerful Nunjucks templating and comes with a modern incremental build development server.

SiteMD is the perfect solution for documentation, personal websites, blogs, and portfolios.

## Key Features
- **Lightning-Fast Dev Server:** File watching with WebSockets for instant live-reloading (<10ms reload times).
- **Incremental Build Cache:** Advanced caching ensures only the pages you edit are rebuilt.
- **Layout Dependency Graph:** Tracks layout inheritance (`{% extends %}`). Editing a base layout instantly updates all dependent pages.
- **Supercharged Markdown:** Native support for GitHub Flavored Markdown and custom HTML attributes (e.g. `# Hello World {.class #id my-data="example"}`) injected directly via custom AST parsers.
- **Collections & Pagination:** Easily group pages by tags or folders and loop or paginate them with zero configuration.
- **Theme System:** Countless beautiful community themes that can be added to your site with the `addtheme` command. Themes are fully encapsulated in the `theme/` folder and act as a springboard for your project.
- **Fully Typed:** Built from the ground up in TypeScript.

## Quick Start
Get a SiteMD project running in under a minute.

**1. Install SiteMD globally (or locally in your project):**
```bash
npm install -g @luiscortesdev/sitemd
```
Or install locally
```bash
npm install @luiscortesdev/sitemd
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

## CLI Commands
SiteMD comes with a powerful, intuitive CLI:
| Command | Description | Options |
| :--- | :--- | ---: |
| `sitemd init` | Initialize a ready-to-use SiteMD project | `-t, --theme <theme>` |
| `sitemd dev` | Starts the local development server with file watching and live reload | `--debug` |
| `sitemd build` | Compiles your SiteMD project into a production-ready site to your output directory | `--debug` |
| `sitemd addtheme <theme>` | Adds the specified theme to your preexisting SiteMD project  | `N/A` |
| `sitemd listfiles` | Lists all of the current files in your content directory  | `N/A` |
| `sitemd help <command>` | Get more information about the specified command | `N/A` |

Add the `--debug` flag to `sitemd dev` and `sitemd build` for detailed build and cache logging.

## Configuration
SiteMD works out of the box with zero configuration, but you can customize it by editing the `sitemd.config.js` file in your project root.
```javascript
// sitemd.config.js

const config = {
    // Paths to project directories from project root
    "contentDir": "content", // Folder for your page content
    "outputDir": ".sitemd/output", // Output folder for dev server pages
    "layoutsDir": "layouts", // Folder for your Nunjucks layouts
    "publicDir": "public", // Folder for your public assets
    "themeDir": "theme", // Folder for your current theme
    "_siteDir": "_site", // Output folder for compiled, production-ready site

    // Site metadata
    "site": {
        "title": "My SiteMD Website",
        "description": "A website built using SiteMD.",
        "url": "http://localhost:3000"
    },

    // Dev server port configuration
    "dev": {
        "port": 3000
    },
    
    // Current SiteMD project theme
    "theme": "default"
}

export default config

```

## Theme System
SiteMD comes with a built-in theme system designed to help you launch sites quickly without locking you out of your own code. 

Run `sitemd addtheme <theme-name>` to install a pre-built theme into a dedicated `theme/` folder in your project. Additionally, you can initialize projects with a theme using `sitemd init --theme <theme-name>`.

### Theme Fallback Architecture
SiteMD uses a **Layout Fallback Resolution** system. It allows you to easily override theme files without destroying the base theme or having to wrangle with the file system.

For example, when you specify `layout: default` in your Markdown, the framework searches in this exact order:
1. `layouts/default.njk` (User overrides)
2. `theme/layouts/default.njk` (Base theme fallback)

A similar process happens with the `public/` folder and `theme/public` folder:
1. `theme/public` folder is copied
2. `public/` folder is copied and overrides

This means you can use an installed theme straight out of the box and easily override any part of it. SiteMD always prioritizes your content while keeping the rest of the theme intact!

## Architecture & Internals
SiteMD follows a clean separation of concerns in your static site. **Data** lives in Markdown; **UI** lives in Nunjucks. These two concerns should never
become too intertwined.

### 1. Frontmatter & Markdown Build Pipeline
Every `.md` file in your `content/` folder is parsed. Frontmatter data is extracted, and the Markdown content is compiled into HTML using a custom `remark/rehype` pipeline, allowing you to easily add classes and IDs to Markdown.
```markdown
# My Title {.text-xl #hero}
```
Becomes: `<h1 class="text-xl" id="hero">My Title</h1>`

#### Finally, the Frontmatter data, the compiled HTML, and the collections data are passed to the Nunjucks rendering engine to generate the final, static HTML page.

### 2. Incremental Caching & The Layout Graph
To achieve lightning-fast rebuilds, SiteMD creates a content hash for every page and layout. When a file is saved, SiteMD compares these hashes to determine exactly which pages need to be rebuilt, skipping the rest.

However, template inheritance makes caching tricky. When a Markdown file specifies a layout, SiteMD locates it in your `layouts/` directory. If that layout (`{% extends %}`) another layout, SiteMD maps the entire ancestry tree into a **Layout Dependency Graph**. If a base layout changes, the framework cascades the invalidation and rebuilds all child pages that depend on it.

### 3. Collections Dependency Tracking
Pages belonging to collections (like `blog` or `tags`) are also cached. If a collection changes (e.g., a new post is added), SiteMD automatically rebuilds any pages that paginate or loop through that collection.

To make this hyper-efficient, pages that loop through collections simply declare their dependencies in their Frontmatter data:

```markdown
---
usesCollections: ["posts"]
---
```

### 4. Dev Server & File System Concurrency
Watching a file system for changes is incredibly chaotic. After a user runs `sitemd dev`, SiteMD utilizes [**Chokidar**](https://github.com/paulmillr/chokidar) to monitor the project directory.

In an effort to prevent infinite build loops, crashes during rapid file modifications, and inconsistent rebuilds on slower machines, SiteMD implements an industry standard event-handling architecture.
* **Debouncing:** Rapid file-system events are debounced to group mass-file changes into a single rebuild.
* **Queued Mutex Locks:** If a file changes *while* the framework is actively building, the event isn't dropped. Instead, it is queued and triggers a secondary build immediately after the first one completes. This ensures zero race conditions, consistency across different hardware, and deterministic outputs.
* **Websockets:** Once the rebuild safely completes, a Websocket payload is sent to the browser to instantly trigger a live-reload.

## Testing
SiteMD is tested using Vitest and JSDOM to ensure file-system stability, cache integrity, functional core features, and accurate HTML generation.

To run the framework's internal test suite locally:

```bash
npm install
npm run test
```

## Contributing

SiteMD is an open-source project, and contributions are highly appreciated!

There are two main ways to contribute to SiteMD:

### The Core Framework
Help us make SiteMD faster, feature-rich, and more robust. We are always looking for help with:
* Enhancing the AST Markdown parsing pipeline.
* Optimizing the caching and layout dependency graph.
* Adding new CLI features and DX improvements.
* Writing and maintaining the Vitest integration tests.
* Catching hard to find bugs

### Community Themes
SiteMD themes are simply HTML/CSS and Nunjucks templates encapsulated in a folder, making it incredibly easy to get started. But building visually pleasing and easy-to-use themes is much harder than it seems.
You can help us by creating a beautiful blog, portfolio, or documentation theme, and submitting a pull request to get it added to the official `sitemd addtheme` CLI registry.

### Getting Started:
1. **Fork** the repository and clone it locally.
2. **Install dependencies:** `npm install`
3. **Create a branch:** `git checkout -b feature/my-awesome-feature` or `theme/my-new-theme`
4. **Make your changes** and ensure all tests pass by running `npm run test`.
5. **Commit & Push:** `git commit -m 'feat: Add some feature'` and `git push origin feature/my-awesome-feature`
6. Open a **Pull Request**!

*If you are planning a massive architectural change, please open an [**Issue**](https://github.com/luiscortesdev/sitemd/issues) first.*

We are currently in the process of creating both a `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` for the repository.
