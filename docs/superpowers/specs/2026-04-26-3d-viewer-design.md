# 3D Viewer — Design Spec

**Date:** 2026-04-26  
**Stack:** Vite + React 18, Tailwind CSS v3, Supabase  
**Rendering:** Three.js via @react-three/fiber + @react-three/drei

---

## Goal

Build a reusable 3D web viewer that loads architectural GLB/GLTF models with guided room navigation, animated camera transitions, and floating room hotspots. Integrated in two places: landing page (demo model) and client portal (per-client model). Managed by the team via a minimal admin panel.

---

## Architecture

Four independent layers:

| Layer | Responsibility |
|---|---|
| `Viewer3D` component | Rendering, camera, hotspots, room nav UI |
| Supabase Storage | Stores GLB/GLTF files (bucket `models`) |
| Supabase DB table `models` | Metadata, room configs, assignments |
| Admin panel `/admin` | Upload, position capture, assignment |

---

## Database

### Table: `models`

```sql
id          uuid primary key default gen_random_uuid()
name        text not null
glb_url     text not null          -- Supabase Storage public URL
rooms       jsonb default '[]'     -- array of RoomConfig
order_id    uuid references orders(id) nullable
is_demo     boolean default false
created_at  timestamptz default now()
```

### RoomConfig (jsonb schema)

```json
{
  "name": "Living Room",
  "area_m2": 28,
  "camera_position": [x, y, z],
  "camera_target": [x, y, z]
}
```

### RLS policies

- Public: `SELECT` where `is_demo = true` OR `order_id` matches authenticated user's order
- Admin only: `INSERT`, `UPDATE`, `DELETE` (checked via `auth.jwt() -> user_metadata ->> 'is_admin' = 'true'`)

---

## Supabase Storage

- Bucket: `models` — public read, admin-only write
- File path: `models/{model_id}.glb`
- No size limit enforced for now (GLB files expected <50MB per apartment)

---

## Viewer3D Component

### File structure

```
src/components/ui/viewer3d/
  Viewer3D.jsx          ← main exported component
  CameraController.jsx  ← orbit controls + animated transitions
  Hotspots.jsx          ← 3D-anchored room labels (screen space)
  RoomNav.jsx           ← bottom button bar overlay
  useViewer.js          ← state: activeRoom, mode, isLoading
```

### Props

```js
Viewer3D.propTypes = {
  glbUrl: string.isRequired,
  rooms: arrayOf({
    name: string,
    area_m2: number,
    camera_position: [number, number, number],
    camera_target: [number, number, number],
  }),
  height: number,              // default 500 (desktop), 320 (mobile)
  showHotspots: bool,          // default true
  accentColor: string,         // default '#03A63C'
  editorMode: bool,            // default false — shows "Capture position" button
  onSavePosition: func,        // called with { camera_position, camera_target }
}
```

### Behavior

- **Loading**: `<Suspense>` wrapper with dark shimmer skeleton while GLB loads via `useGLTF`
- **Orbit mode** (default): free navigation via `OrbitControls` (drei)
- **Tour mode**: clicking a room button triggers animated camera transition — interpolates `position` and `target` over 800ms with `easeInOut` using framer-motion's `animate`
- **Hotspots**: `<Html occlude>` from drei — follows 3D position, auto-hides when behind geometry
- **Editor mode**: adds a "Capture position" button overlay; on click fires `onSavePosition` with current camera state

### Camera transitions

Framer-motion drives the lerp on each frame via `useFrame` (r3f). Transition duration: 800ms, easing: `easeInOut`. Active room button highlighted with accent color.

---

## Admin Panel

### Protection

Route `/admin` wrapped in `AdminRoute` component — checks `user.user_metadata.is_admin === true`. Set manually in Supabase dashboard for team members.

### Routes

```
/admin                  ← list of all models + "Add model" button
/admin/models/new       ← 3-step wizard
/admin/models/:id       ← edit existing model
```

### 3-step wizard

**Step 1 — Upload**
- Fields: project name, GLB/GLTF file picker
- On submit: upload to Storage → create `models` row with `rooms: []`
- Redirect to Step 2 with the new model id

**Step 2 — Define rooms**
- Split layout: Viewer3D (editorMode) on left, room list panel on right
- Workflow: navigate viewer → "Capture position" → modal asks for room name + m² → saves to local state → user clicks "Save all rooms" → PATCH `models.rooms`
- Each room in list: delete button + "Re-capture" button

**Step 3 — Assign**
- Toggle `is_demo` (replaces any existing demo model — only one at a time)
- Dropdown: link to an existing order (`order_id`)
- "Publish" button → PATCH model → redirect to `/admin`

---

## Landing Page Integration

**Component:** `Viewer3DSection` added to `App.jsx` after the `Services` section.

- Only renders when `mode === 'preview'`
- On mount: fetches `models` where `is_demo = true`, limit 1
- If no demo model: section hidden entirely (no error state shown)
- Loading state: dark shimmer skeleton matching section height
- Style: `background: '#07070F'`, `font-display` title, accent `#03A63C`
- Section title: "Explore the space" (or similar — TBD at implementation)

---

## Client Portal Integration

**File:** `src/pages/OrderWorkspace.jsx`

- New tab "3D Tour" added to the workspace tab bar
- On tab open: fetches `models` where `order_id = orderId`
- If no model assigned: shows message "Your 3D tour will be available soon"
- Viewer height: 500px desktop, 320px mobile
- Accent color: matches the order workspace's existing accent

---

## Dependencies to add

```json
"@react-three/fiber": "^8.x",
"@react-three/drei": "^9.x",
"three": "^0.165.x"
```

Drei's `Html` component handles hotspot screen-space anchoring. `useGLTF` handles GLB loading with caching.

---

## Out of scope

- Progressive/streaming asset loading (revisit if models exceed 50MB)
- Mobile-specific touch gestures beyond OrbitControls defaults
- Multi-model carousel on landing page (future addition)
- Full admin CMS (orders management, client management, etc.)
