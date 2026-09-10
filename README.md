# OpenCut

**OpenCut is a free, professional, browser-based video editor designed to make powerful video editing accessible to everyone.**

OpenCut combines a modern editing workflow with a clean, fast interface inspired by professional non-linear editors. It is designed for creators, students, developers, filmmakers, and anyone who wants to edit videos without being locked behind expensive subscriptions or forced watermarks.

## Features

* Professional multi-track timeline
* Video, audio, and image editing
* Trim, split, cut, move, and delete clips
* Drag-and-drop media import
* Video preview and playback controls
* Text and title tools
* Audio controls
* Transitions and visual effects
* Video properties and transformations
* Captions and subtitles
* Undo and redo
* Keyboard shortcuts
* Project saving and autosave
* Project dashboard
* Media organization
* Multiple video and audio tracks
* Professional export workflow
* Dark, modern editing workspace
* Responsive interface
* Local-first project storage where supported

## Why OpenCut?

Professional video editing software can be expensive, complicated, or restricted by subscriptions and watermarks.

OpenCut aims to provide a different approach:

**Professional editing should be accessible.**

The project focuses on creating a powerful editing experience while keeping the core product free and privacy-conscious.

## Technology

OpenCut is built with modern web technologies, including:

* React
* TypeScript
* Vite
* Tailwind CSS
* IndexedDB
* Web APIs
* Web Workers
* WebCodecs where supported
* FFmpeg WebAssembly where required

The architecture is designed to support a progressively more powerful browser-based editing engine.

## Privacy

OpenCut is designed with a local-first approach.

Whenever possible, media processing and project data should remain on the user's device instead of requiring large media uploads to a remote server.

Authentication and cloud features, when available, are separated from the core editing workflow.

## Getting Started

Clone the repository:

```bash
git clone https://github.com/sowjithanumola/OpenCut.git
cd OpenCut
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Project Structure

```text
OpenCut/
├── src/
│   ├── components/
│   ├── editor/
│   ├── timeline/
│   ├── media/
│   ├── audio/
│   ├── effects/
│   ├── transitions/
│   ├── captions/
│   ├── projects/
│   ├── auth/
│   ├── hooks/
│   ├── lib/
│   └── App.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The exact structure may evolve as the editor architecture develops.

## Development Principles

OpenCut follows several important principles:

1. **Real functionality over visual demos**
2. **Performance over unnecessary effects**
3. **Privacy by default**
4. **Accessible professional workflows**
5. **Clean and maintainable code**
6. **Graceful browser fallbacks**
7. **No unnecessary subscriptions**
8. **No forced watermarks**

## Browser Compatibility

OpenCut uses modern browser capabilities for video processing.

Performance and available features can vary depending on the browser and device. Features such as WebCodecs may provide better performance on supported browsers, while alternative processing methods can be used when necessary.

For the best experience, use a modern Chromium-based browser such as Chrome or Edge.

## Roadmap

Planned improvements include:

* Advanced timeline editing
* More professional transitions
* Expanded effects library
* Advanced color correction
* Better audio editing
* Improved caption tools
* Faster rendering
* More export options
* Cloud project synchronization
* Collaboration features
* Plugin and extension architecture
* Advanced keyboard workflows
* Improved media management

## Contributing

Contributions are welcome.

You can contribute by:

* Reporting bugs
* Suggesting features
* Improving documentation
* Improving performance
* Fixing issues
* Adding tests
* Improving the editor
* Creating new effects or transitions

Before submitting a major change, consider opening an issue to discuss the proposed implementation.

## License

MIT
## Vision

OpenCut is more than a browser video editor.

The goal is to build a powerful, accessible editing platform that brings professional video-editing workflows to the web without unnecessarily restricting creators.

**OpenCut — Professional video editing, made accessible.**
## 🔗 Links

[![Portfolio](https://img.shields.io/badge/Portfolio-000?style=for-the-badge&logo=vercel&logoColor=white)](https://sowjith.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sowjithanumola)
[![Threads](https://img.shields.io/badge/Threads-000000?style=for-the-badge&logo=threads&logoColor=white)](https://www.threads.com/@i.am.sowjith)
[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://www.reddit.com/user/i-am-sowjith/)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/i.am.sowjith/)
