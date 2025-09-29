# Three.js 3D Editor

A lightweight Three.js-powered scene editor that runs in the browser. It provides scene management, transform gizmos, material editing, asset import/export, lighting controls, undo/redo, screenshot capture, and configurable layout panels.

## Features

- **Interactive viewport** with orbit navigation, transform gizmos, grid and axis helpers.
- **Scene hierarchy** panel for selecting objects, including imported assets.
- **Property inspector** to edit transforms, visibility, and names.
- **Material editor** for MeshStandardMaterial color, emissive, metalness, and roughness with live preview.
- **Lighting controls** to tune ambient, directional, and point lights and toggle helpers.
- **Asset import/export** supporting GLTF/GLB, OBJ, and FBX plus JSON scene serialization.
- **Screenshot capture** of the active viewport.
- **Undo/redo** history for object edits.
- **Layout settings** to toggle left/right panels for responsive workflows.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

   > If your environment blocks scoped npm packages, configure an alternative registry first:
   >
   > ```bash
   > npm config set registry https://registry.npmmirror.com
   > ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

## Keyboard & usage tips

- Use the toolbar to add primitives, lights, and cameras.
- Switch transform modes (Move/Rotate/Scale) to manipulate selected objects.
- Click objects in the viewport or the hierarchy to select them.
- Use the layout panel to hide or show supporting UI panes for smaller screens.

## License

MIT
