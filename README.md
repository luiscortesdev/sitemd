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

---

## 💻 CLI Commands
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

---

## ⚙️ Configuration
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

## 📄 SiteMD Architecture & Internals
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

