# Minecraft Web V14.6 — Optimization Foundation

V14.6 changes the engine from whole-column rendering toward a Minecraft/Sodium-style visibility and scheduling model while preserving the V14.5 Java-first client systems.

## Implemented in V14.6

### 16×16×16 render sections
A loaded 16×96 chunk column is rendered as six vertical 16³ sections. Empty sections do not create a Three.js mesh. This allows caves, mountains, underground terrain and high/low terrain to be culled independently instead of treating the entire column as visible.

### Directional section visibility
Each rebuilt section scans its non-opaque cells and flood-fills connected open regions. For every connected region it records which of the six section boundaries can see through to which other boundaries. The camera section is the root of a breadth-first traversal. Traversal cannot continue through solid, disconnected sections.

Frustum testing remains a second gate. A section has to be reachable through the section graph and inside the camera frustum before its mesh is submitted.

### Dynamic-object occlusion
Mobs, drops and ordinary particles inherit section visibility. Mobs that survive that coarse test can receive a budgeted voxel line-of-sight test. A short visibility grace period prevents flicker as an entity crosses a portal boundary.

### Prioritized chunk work
Chunk attach/rebuild/load jobs are sorted by distance and camera direction instead of relying on dirty-set insertion order. Nearby dirty terrain and chunks in front of the player win over distant/behind-camera work.

### Simulation hot paths
- hostile target and sensor scans are frequency-tiered by distance;
- far Bedrock entity animations update less frequently;
- passive Java animal AI keeps its existing low-frequency thinking;
- a 16-block spatial entity hash is rebuilt at 5 Hz for local queries;
- repeated `highestSolidY` scans use an invalidated height cache.

### Particle batching
The original break particles created one Three.js Mesh per particle. V14.6 replaces the common burst path with one `InstancedMesh`, preserving movement/gravity while reducing draw-call overhead.

### iPhone performance governor
The mobile governor watches sustained FPS rather than reacting to one bad frame. It can:
- reduce DPR gradually;
- reduce particle density;
- hold chunk build/load work to one job;
- temporarily reduce view distance only during severe sustained slowdown;
- restore quality slowly after sustained recovery;
- prune old in-memory asset blobs while keeping browser Cache Storage usable.

Debug commands: `sections`, `occlusion`, `spatial`, `perf`.

## Deliberately not faked in V14.6

Three optimizations need deeper renderer changes and are therefore listed as the next implementation rather than being falsely reported as complete:

1. **Greedy rectangle meshing.** The current terrain atlas clamps each block face into an atlas tile. Merging several blocks into one quad without a repeat-aware atlas shader would stretch one texture over the whole rectangle. The next mesher needs tile-local UV attributes or an array-texture path first.
2. **True Web Worker meshing.** V14.6 prioritizes and bounds rebuild work, but geometry generation still occurs on the main thread. A worker version needs transferable chunk/border snapshots plus generation IDs so stale jobs can be cancelled safely.
3. **Terrain BatchedMesh/render regions.** Section splitting changes the draw-call tradeoff. We should profile the new visible-section count before grouping material-compatible sections into larger dynamic batches.

These are the V14.7 targets after V14.6 is measured on the iPhone 11.
