# Web Video Editor Demo

## Summary

A browser-based video editor prototype for arranging media on a timeline, previewing compositions, adjusting project and clip settings, and exporting rendered video.

Key technologies include React, TypeScript, Vite, Remotion, Zustand, Tailwind CSS, Vitest, and Storybook.

## Features

- Timeline editing for video composition.
- Remotion-powered preview and browser rendering.
- File and folder asset management.
- Project and clip settings panels.
- Client-side video export.

## Build Instructions

Clone with submodules:

```sh
git clone --recurse-submodules <repo-url>
```

If already cloned, initialize submodules:

```sh
git submodule update --init --recursive
```

Install dependencies:

```sh
npm install
```

Build the production app:

```sh
npm run build
```

## Running Tests

Run all tests:

```sh
npm test
```

Run unit tests only:

```sh
npm run test:unit
```

Run Storybook tests:

```sh
npm run test:storybook
```

## Running the Project

Start the development server:

```sh
npm run dev
```

Preview a production build:

```sh
npm run preview
```

Start Storybook:

```sh
npm run storybook
```

## AI Usage

AI tools were used to assist with development, code review, debugging, and documentation. All code was reviewed by a human.
