# Ascribe

Ascribe is a desktop-first Bible study application built with React, TypeScript, and Tauri. It is designed to make scripture reading, searching, audio playback, and study workflows feel smooth and focused in a native app experience.

## Overview

Ascribe brings together several core study tools in one place:

- Read scripture in multiple translations
- Search across books, chapters, and verses
- Navigate quickly through chapters and sections
- Use built-in audio playback controls for listening while reading
- Browse modules, settings, and help information from a unified interface
- Prepare printable Bible content for study and reference

The project is being shaped around the goals documented in [docs/requirements.md](docs/requirements.md), including a richer Bible reading experience, more advanced search behavior, and future support for notes, highlights, and sync workflows.

## Current Focus

The current app already includes a strong foundation for:

- Bible page navigation and chapter selection
- Multiple Bible versions and parallel reading support
- Search-driven reading flow
- Audio player controls and playback settings
- Settings, modules, and information pages
- Printing workflows for scripture content

Planned enhancements include deeper note/highlight editing, improved inspectors, richer search syntax, and more advanced desktop-friendly workflows, and mobile support.

## Screenshots

Here are a few examples of the current interface:

![Bible reading view](docs/screenshots/Screenshot%202026-07-04%20193126.png)

![Search and navigation experience](docs/screenshots/Screenshot%202026-07-04%20193207.png)

![Audio and reading controls](docs/screenshots/Screenshot%202026-07-04%20193246.png)

![Additional reading view](docs/screenshots/Screenshot%202026-07-04%20193319.png)

![More of the app interface](docs/screenshots/Screenshot%202026-07-04%20193336.png)

## Development

### Prerequisites

- Node.js 20+
- npm
- Rust toolchain for Tauri

### Getting started

```bash
npm install
npm run tauri dev
```

### Build for production

```bash
npm run build
npm run tauri build
```

## Project structure

- [src](src) – React app and UI components
- [src-tauri](src-tauri) – Tauri backend and Rust commands
- [docs](docs) – requirements, ideas, and planning notes

