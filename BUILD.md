# Production Build System

This project includes a comprehensive build system for optimizing assets for production deployment.

## 🚀 Quick Start

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Full Deployment

```bash
npm run deploy
```

## 📦 What Gets Optimized

### CSS Files

- **Input**: `reset.css`, `style.css`, `404.css`, `resume.css`
- **Output**: `dist/styles.min.css` (combined & minified)
- **Reduction**: ~60-70% size reduction

### JavaScript Files

- **Input**: `index.js`
- **Output**: `dist/index.min.js` (minified with Terser)
- **Features**: Console.log removal, variable name mangling
- **Reduction**: ~50-60% size reduction

### Server Files

- **Input**: `server.js`
- **Output**: `dist/server.min.js` (minified with Terser)
- **Features**: Console.log removal, variable name mangling
- **Reduction**: ~50-60% size reduction

### HTML Templates

- **Input**: `index.html`, `404.ejs`, `resume.ejs`
- **Output**: Production-optimized templates in `dist/`
- **Features**: Asset path updates, whitespace removal
- **Reduction**: ~30-40% size reduction

## 🛠️ Build Tools Used

- **Terser**: JavaScript minification
- **clean-css**: CSS minification and optimization
- **html-minifier-terser**: HTML minification
- **Node.js**: Build orchestration

## 📁 Output Structure

```
dist/
├── styles.min.css          # Combined & minified CSS
├── index.min.js           # Minified client JS
├── server.min.js          # Minified server JS
├── index.html             # Production HTML
├── 404.ejs               # Production 404 template
├── resume.ejs            # Production resume template
├── package.json           # Production package.json
├── .env                   # Environment variables (if exists)
└── assets/               # Optimized assets
    ├── favicon/
    ├── img/
    └── resume.md
```
