# Night walk art and animation

The approved visual concept is implemented as independent painted scenery layers and a hand-shaped animated character, not as a moving screenshot. Production publishing uses the GitHub main branch connected to Cloudflare Pages.

## Assets

All raster art was created with the built-in image-generation tool, then encoded as WebP (alpha preserved). The game loads the art once and uses Phaser's GPU renderer where available, with its cached-image canvas renderer as fallback.

- `public/art/night/forest.webp`: distant painted sky and forest, 1672 × 941.
- `public/art/night/buildings.webp`: transparent 2 × 2 architectural atlas, 1448 × 1086. These are fictional interpretations, not reconstructions of the named schools.
- `public/art/night/tree.webp`: transparent leafy foreground tree, 1254 × 1254.
- `public/art/night/room.webp`: journal/workroom illustration, 1448 × 1086.

The boy's body, limbs, hair and eyes are original filled shapes in `src/scripts/night-art.ts`. Walk poses are baked into a texture atlas once on load. His step phase follows distance travelled; eye blinks and idle breathing use a pausable scene clock. The ground, mist and dim window overlays are also baked once.

## Generation directions

All assets used the user-approved concept as a reference: a full child silhouette with luminous eyes, dense leafy trees, solid weathered architecture, and a muted Van Gogh-inspired midnight sky.

### Forest

Create the background layer for the approved 2D side-scroller. Preserve its dark oil-painted midnight atmosphere, subdued charcoal-indigo swirling Van Gogh sky, scattered tiny ivory stars, and dense leafy trees. Remove the boy and building completely, replacing the building with distant soft dark forest and open hazy space at ground level. Remove the large foreground trunk and nearest foreground branches. Retain lush middle-distance trees at both sides, sky across the upper half, quiet clearing and dark soft foliage across the lower half. Wide 16:9 composition. Horizontal ground around 84% down; lower 16% fades to pure black. No people, buildings, near foreground objects, text, or interface. Uneven broad dry-brush strokes, matte charcoal pigment, restrained shapes, handmade painted theatre scenery, faint silver-blue mist behind the future black character. Do not brighten.

### Architecture

Transparent 2D game architectural sprite atlas. Four complete isolated buildings in a strict 2 × 2 grid with equal cells, overall 4:3 sheet. Each centered with a base near 88% of its cell, transparent padding, no overlap. No text, labels, boy, sky, trees, panels or dividers. Front-facing elevations with slight depth on the right. Top left: modest two-level plaster village school with slate roof and central gabled entrance. Top right: larger brick school with square clock tower and two wings. Bottom left: broad three-storey stone academy with central pediment and arched ground-floor windows. Bottom right: newer flat-roof concrete university block with broad central stairs and tall central window. Fictional evocative buildings. Match the reference's midnight charcoal, slate and ivory; solid walls, real mass, recessed windows, chipped plaster, uneven dry-brush texture and sparse silver moonlight. No wireframes, white outlines, skeletal structure or glossy CGI. Narrow textured footings and ivy integrated at each base; full alpha around every sprite.

### Tree

One complete isolated mature leafy tree with broad irregular dense crown, thick curved trunk and flared roots; no ground. Entire tree within a square canvas with padding. Match the matte midnight oil-painted charcoal texture. Near-black foliage masses, sparse gray leaf edges, substantial bark, lush living canopy. Simplified overlapping leafy masses and imperfect soft edges, restrained tiny detail. Trunk splits halfway into branches concealed inside full foliage. No bare/dead tree, bright outline, glow, boy, building, sky, label or background shadow. Genuine alpha transparency around leaves.

### Room

A quiet empty room with an old substantial wooden desk beneath a tall rectangular window. Open notebook, closed small laptop and plain cup on the desk. Subdued Van Gogh-inspired charcoal-indigo night sky and leafy trees outside. Solid hand-painted worn plaster and dark wood, sparse ivory moonlight on notebook and tabletop; no lamp or person. Most room pure black. Desk and window center-right, generous black negative space, all four image edges fade into pure black. Landscape 4:3. Matte dark oil and broad imperfect dry-brush strokes; no excessive fine detail, text, labels, UI or wireframes.

## Interaction

- Hold Left/Right or A/D, scroll, hold the onscreen arrows, or select a memory.
- The entire interface fades out during movement and returns after 0.6 seconds at rest.
- Escape, Tab, or tapping the scene stops automatic travel and restores controls.
- Sound requires a deliberate opt-in. The soundscape is synthesized wind, footfalls, sparse distant tones and quiet creaking.
- Reduced-motion users jump directly to selected chapters, with ambient movement disabled.
- Motion can be paused. No external game engine download is required beyond the home page's bundled Phaser code.
