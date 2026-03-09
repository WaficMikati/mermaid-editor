<div align="center">

# 🧩 Mermaid Flowchart Editor

A modern, browser-based flowchart editor built with React and Vite.
Build diagrams visually and keep them in sync with Mermaid code.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Developed by](https://img.shields.io/badge/Developed%20by-Wafic%20Mikati-blue?style=flat)](https://github.com/waficmikati)

</div>

---

## ✨ Features

- **Visual drag‑and‑drop** — create and arrange flowchart nodes on an infinite canvas
- **Live Mermaid sync** — every change updates the Mermaid code panel in real time; edit code to rebuild the diagram
- **Rich interactions** — connect nodes, edit labels inline, multi‑select, pan, and zoom
- **SVG export** — generate clean SVG output from your diagrams
- **Zero backend** — runs entirely in the browser as a static site

---

## 📋 Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | 18+ (20+ recommended) |
| **npm** | Bundled with Node.js |
| **Browser** | Any modern browser (Chrome, Edge, Firefox, Safari) |

Verify your installation:

```bash
node -v
npm -v
```

> Don't have Node.js? Download the **LTS** version from [nodejs.org](https://nodejs.org).

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <REPO_URL>
cd mermaid-editor

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser and you're ready to go.

---

## 🏗️ Production Build

```bash
# Create an optimized build
npm run build

# Preview locally
npm run preview
```

The `dist/` folder contains static files ready for deployment to any hosting service.

---

## 🗂️ Project Structure

```
src/
├── main.jsx            # React entry point
├── App.jsx             # Main editor UI and state management
├── graphUtils.js       # Graph constants, node sizing, layout helpers
├── geometryUtils.js    # Node centers, connection points, SVG export
├── mermaidUtils.js     # Mermaid code generation and parsing
├── App.css             # Editor styles
└── index.css           # Global styles
```

---

## 🎮 Usage Guide

| Action | How |
|--------|-----|
| **Create node** | Drag a shape from the left panel onto the canvas |
| **Move node** | Click to select, then drag; hold <kbd>Shift</kbd> to multi‑select |
| **Connect nodes** | Hover a node and drag from its highlighted text area to another node |
| **Edit label** | Double‑click a node or connection label |
| **Delete** | Use the delete button, or select and press <kbd>Delete</kbd> |
| **Pan** | Right‑click drag **or** middle‑click drag |
| **Zoom** | Mouse wheel |
| **Sync from code** | Edit the Mermaid code in the right panel and click **Apply** |

---

## 🧹 Linting

```bash
npm run lint
```

Fix any reported issues before committing changes.

---

## 🐛 Troubleshooting

<details>
<summary><strong>Port already in use</strong></summary>

Stop the other process or run on a different port:

```bash
npm run dev -- --port 5174
```
</details>

<details>
<summary><strong>Blank / white screen</strong></summary>

- Check the browser console (<kbd>F12</kbd> → Console) for errors.
- Check the terminal running the dev server for stack traces.
</details>

<details>
<summary><strong><code>npm</code> or <code>node</code> not recognized (Windows)</strong></summary>

Re‑install Node.js from [nodejs.org](https://nodejs.org) and restart your terminal.
</details>

---

## 🤝 Contributing

1. **Fork** the repository
2. Create a feature branch — `git checkout -b feature/my-change`
3. Develop with `npm run dev`
4. Lint before opening a PR — `npm run lint`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by <strong>Wafic Mikati</strong></sub>
</div>
