# Mermaid Flowchart Editor

A modern, browser-based flowchart editor built with React and Vite.  
It lets you build diagrams visually and keeps them in sync with Mermaid code.

Anyone can clone and run this project locally – from complete beginners to experienced engineers. This guide walks through everything step‑by‑step.

---

## 1. Prerequisites

You need:

- **Node.js**: version **18 or later** (20+ recommended)
- **npm**: comes with Node.js
- A terminal:
  - Windows: PowerShell or Command Prompt
  - macOS / Linux: any shell (Terminal, zsh, bash, etc.)
- A browser (Chrome, Edge, Firefox, Safari, etc.)

### 1.1. Check if Node.js is installed

In your terminal:

```bash
node -v
npm -v
```

If those commands fail or show very old versions:

- Install Node.js from the official website:  
  `https://nodejs.org`
  - Choose the **LTS** (Recommended) version.

After installing, close and reopen your terminal, then run `node -v` again to confirm.

---

## 2. Getting the code

### Option A – Clone with Git (recommended)

In your terminal, choose a folder where you want the project to live, then:

```bash
git clone <REPO_URL>
cd mermaid-editor
```

Replace `<REPO_URL>` with the URL of this repository (for example from GitHub).

### Option B – Download ZIP

1. Download the ZIP of the repository from your Git hosting service.
2. Extract/unzip it.
3. Open a terminal in the extracted folder (the one that contains `package.json`).

---

## 3. Install dependencies

From the project root (where `package.json` lives), run:

```bash
npm install
```

This will download all required packages listed in `package.json`, including:

- `react`, `react-dom`
- `vite` and the React plugin
- ESLint and related tooling

> If `npm install` fails, read the error message carefully. The most common issues are:
> - Node.js version too old
> - Network / proxy problems

---

## 4. Running the app locally

Once dependencies are installed, start the development server:

```bash
npm run dev
```

You should see output similar to:

```text
  VITE vX.X.X  ready in Xs

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4.1. Open in the browser

1. Open your browser.
2. Go to `http://localhost:5173` (or the URL shown in the terminal).

You should see the Mermaid flowchart editor UI.

### 4.2. Stopping the dev server

- Go back to the terminal where `npm run dev` is running.
- Press `Ctrl + C` to stop it.

---

## 5. Building for production

To create an optimized production build:

```bash
npm run build
```

This creates a `dist` folder with static files you can deploy to any static hosting service.

To preview the production build locally:

```bash
npm run preview
```

Then visit the URL printed in the terminal (usually `http://localhost:4173`).

---

## 6. Code structure (high level)

Key files:

- `src/main.jsx`  
  - React entry point; mounts the app into `index.html`.
- `src/App.jsx`  
  - Main Mermaid editor UI and state management.
- `src/graphUtils.js`  
  - Graph constants and utilities (grid size, node sizing, layout helpers).
- `src/geometryUtils.js`  
  - Geometry helpers (node centers, connection points, bounds, SVG export).
- `src/mermaidUtils.js`  
  - Mermaid code generation and parsing utilities.
- `src/App.css` / `src/index.css`  
  - Styling for the editor.

You do **not** need to touch these files to run the project, but this overview helps when you’re ready to modify or extend the editor.

---

## 7. Basic usage of the editor

Once the app is running:

- **Create nodes**: drag shapes from the left panel onto the canvas.
- **Move nodes**: click a node to select it, then drag to move; hold Shift to select multiple.
- **Connect nodes**: hover a node, drag from its highlighted text area to another node.
- **Edit node text**: double‑click a node’s label, type, then press Enter or click outside.
- **Edit connection labels**: double‑click a connection line to edit its label.
- **Delete**:
  - Use delete buttons on individual nodes/edges, or
  - Select nodes/edges and press the `Delete` key.
- **Pan**:
  - Hold **right mouse button** and drag, **or**
  - Hold **middle mouse button** and drag.
- **Zoom**:
  - Use the mouse wheel to zoom in/out.
- **Mermaid code sync**:
  - The right panel shows Mermaid code generated from your diagram.
  - Edit the code and click **Apply** to rebuild the diagram from code.

---

## 8. Linting (optional, for contributors)

To run ESLint:

```bash
npm run lint
```

Fix any reported issues before committing changes.

---

## 9. Common problems & fixes

- **Port already in use (e.g. 5173)**  
  Another process is using the dev server port.
  - Either stop the other process, or
  - Run Vite on a different port:
    ```bash
    npm run dev -- --port 5174
    ```

- **Blank page / white screen**  
  - Check the browser console (F12 → Console) for errors.
  - Check the terminal where `npm run dev` is running for stack traces.

- **`npm` not recognized / `node` not recognized** (Windows)  
  - Node.js is not installed or not in your PATH.
  - Re‑install Node.js from `https://nodejs.org` and restart your terminal.

---

## 10. Contributing

If you want to extend or change the editor:

1. **Fork** the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/my-change
   ```
3. Run `npm run dev` while you work.
4. Keep code clean and run `npm run lint` before opening a pull request.

---

## 11. Getting help

If you run into setup or runtime issues:

- Copy the **exact** error message from your terminal or browser console.
- Note:
  - Your OS (Windows/macOS/Linux)
  - Your Node.js version (`node -v`)
- Share that information when asking for help (issues, chat, etc.) so problems can be diagnosed quickly.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
