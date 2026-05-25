# Wedding Invitation - Isometric Layer Structure

This wedding invitation is built with an **isometric top-down view** using a **layered architecture** where each visual element is a separate, independent component. This design makes it easy to:
- Replace individual layers with better graphics
- Control animations independently (especially the river flow)
- Add click interactions to specific elements
- Seamlessly blend all elements into one cohesive environment
- Export to other IDEs (like Cursor) for further customization

**Design Style**: Isometric top-down view matching the hand-drawn sketch, with simple SVG graphics for seamless integration.

---

## Layer Architecture (Z-Index Order)

### Layer 0: Grass Background (`GrassBackground.tsx`)
- **Z-Index**: 0 (bottom layer)
- **Purpose**: Base green grass/land texture
- **Features**: 
  - Gradient green background simulating grass field
  - Subtle texture overlay for natural look
  - Isometric-friendly flat design
- **Customization**: 
  - Adjust colors in the gradient (change hex values)
  - Replace with grass texture image
  - Modify texture pattern density
- **File**: `src/app/components/GrassBackground.tsx`

### Layer 1: River Path (`RiverPath.tsx`) 🌊
- **Z-Index**: 10
- **Purpose**: **Separate animated river layer** for CSS control
- **Features**: 
  - SVG winding path from top to bottom
  - CSS shimmer animation for flowing water effect
  - Blue gradient filling the river
  - River banks with subtle edges
  - **FULLY ANIMATABLE** via CSS
- **Customization**: 
  - Modify SVG path to change river shape
  - Adjust animation in `@keyframes flow-shimmer`
  - Change river color via gradient stops
  - Control flow speed (default 4s)
- **File**: `src/app/components/RiverPath.tsx`

### Layer 2: Trees (`Trees.tsx`)
- **Z-Index**: 20
- **Purpose**: Scattered trees on both sides of river (matching sketch)
- **Elements**:
  - 13 trees total (6 left, 7 right)
  - Two styles: rounded and bushy
  - SVG-based for crisp rendering
  - Varied sizes (small, medium, large)
- **Customization**: 
  - Add/remove trees by editing `trees` array
  - Change positions via `x` and `y` percentages
  - Modify tree SVG shapes
  - Adjust colors to match environment
- **File**: `src/app/components/Trees.tsx`

### Layer 3: Villages (`Villages.tsx`)
- **Z-Index**: 30
- **Purpose**: Shows bride's home (top-left) and groom's home (bottom-right)
- **Elements**:
  - **Simple house SVG** matching sketch style
  - **Stick figure families** (3 people each)
  - Pink theme for bride's side
  - Blue theme for groom's side
  - Small labels for clarity
- **Customization**: 
  - Replace SVG house with custom design
  - Change number of family members
  - Adjust positions (top/left/bottom/right)
  - Modify colors
- **File**: `src/app/components/Villages.tsx`

### Layer 4: Lotus Flowers (`LotusFlowers.tsx`)
- **Z-Index**: 40
- **Purpose**: Three clickable milestone markers along river
- **Features**:
  - **Simple SVG lotus** with lily pad
  - Floating animation (gentle up/down)
  - Click to reveal event details
  - Glow effect when active
  - Positioned along winding river
- **Positions**: Defined in `lotusPositions` array
  - Lotus 1 (28% from top, 32% from left): Engagement
  - Lotus 2 (52% from top, 44% from left): Mehendi
  - Lotus 3 (75% from top, 56% from left): Wedding
- **Customization**: 
  - Change positions to follow river curve
  - Modify lotus SVG design
  - Edit event labels
  - Adjust animation timing
- **File**: `src/app/components/LotusFlowers.tsx`

### Layer 5: Boat (`Boat.tsx`)
- **Z-Index**: 50
- **Purpose**: Animated bowl-shaped boat carrying bride
- **Features**:
  - **Simple SVG bowl boat** matching sketch
  - **Stick figure bride** in pink dress
  - Decorative flowers on boat rim
  - Smooth animated movement along river
  - Water ripples beneath boat
  - Rotates slightly to follow river curve
- **Path**: Defined in `pathCoordinates` array (4 positions)
- **Animation**: 2-second smooth transition
- **Customization**: 
  - Adjust path to match river exactly
  - Change boat SVG design
  - Modify bride figure
  - Alter animation duration/easing
- **File**: `src/app/components/Boat.tsx`

### Layer 6: Event Modal (`EventModal.tsx`)
- **Z-Index**: 100 (top layer)
- **Purpose**: Displays event details when lotus clicked
- **Features**:
  - Animated slide-in entrance
  - Backdrop blur
  - Color-coded by event (pink/orange/red)
  - Date, time, venue, description
  - Close button
- **Events Data**: Array of 3 events
- **Customization**: 
  - Edit event details in `events` array
  - Change colors per event
  - Add more events
- **File**: `src/app/components/EventModal.tsx`

---

## Component Hierarchy

```
App.tsx
├── GrassBackground.tsx    (Layer 0 - Base land)
├── RiverPath.tsx          (Layer 1 - Animated water)
├── Trees.tsx              (Layer 2 - Environment)
├── Villages.tsx           (Layer 3 - Source/Target)
├── LotusFlowers.tsx       (Layer 4 - Interactive milestones)
├── Boat.tsx               (Layer 5 - Animated journey)
└── EventModal.tsx         (Layer 6 - Details popup)
```

---

## State Management

**Main App State** (`App.tsx`):
- `selectedLotus`: Which lotus was clicked (0, 1, 2, or null)
- `boatPosition`: Current boat position (0-3)

**Flow**:
1. User clicks lotus → `handleLotusClick(index)`
2. Sets `selectedLotus` to show modal
3. Sets `boatPosition` to animate boat
4. Modal displays event details
5. User closes → `handleCloseModal()`

---

## Seamless Integration Tips

All elements are designed to blend seamlessly:

1. **SVG Graphics**: All elements (houses, trees, lotus, boat, people) use SVG for crisp, scalable rendering
2. **Consistent Colors**: Green grass base, blue river, brown trees, matching the natural environment
3. **Simple Shapes**: Minimalist design matching hand-drawn sketch style
4. **Proper Layering**: Z-index ensures correct depth perception
5. **Transparency**: No white backgrounds on individual elements

---

## River Animation Control

The river is in its own layer (`RiverPath.tsx`) for easy CSS animation:

```css
@keyframes flow-shimmer {
  0%, 100% {
    filter: brightness(1) contrast(1);
  }
  50% {
    filter: brightness(1.1) contrast(1.05);
  }
}

.river-water {
  animation: flow-shimmer 4s ease-in-out infinite;
}
```

**To modify**:
- Change duration (4s → faster/slower)
- Adjust brightness/contrast values
- Add transform for directional flow
- Change gradient colors

---

## Customization Guide

### Change River Path Shape
Edit `src/app/components/RiverPath.tsx`, modify the SVG path:
```tsx
<path
  d="M 35 0 Q 25 15, 30 30 T 40 60 ..." // Edit coordinates
  className="river-water"
/>
```

### Add More Trees
Edit `src/app/components/Trees.tsx`:
```tsx
const trees = [
  { x: '15%', y: '30%', size: 'medium', type: 'rounded' },
  // Add more...
];
```

### Change Lotus Positions
Edit `src/app/components/LotusFlowers.tsx`:
```tsx
const lotusPositions = [
  { top: '28%', left: '32%', label: 'Engagement' }, // Adjust %
  // ...
];
```

### Adjust Boat Path
Edit `src/app/components/Boat.tsx`:
```tsx
const pathCoordinates = [
  { top: '12%', left: '28%', rotate: 15 }, // Match river curve
  // ...
];
```

### Update Event Details
Edit `src/app/components/EventModal.tsx`:
```tsx
const events = [
  {
    title: 'Your Event',
    date: 'June 15, 2026',
    time: '6:00 PM',
    location: 'Venue',
    description: 'Details...',
    color: 'pink',
  },
];
```

---

## Mobile Optimization (Portrait Mode)

✅ **Full mobile ready**:
- Portrait orientation optimized
- Touch-enabled lotus clicks
- Responsive percentage positioning
- SVG scaling for all screen sizes
- Smooth animations on mobile devices
- Optimized performance

---

## Isometric View Characteristics

The design follows isometric top-down projection:
- River flows vertically (top to bottom)
- Trees viewed from above
- Houses shown with simple roof angle
- Boat visible from overhead
- Lotus flowers flat on water surface
- All elements maintain consistent perspective

---

## Future Enhancements

1. Add parallax scrolling effect
2. Animate tree leaves swaying
3. Add birds flying across
4. Sound effects (water flowing, birds)
5. Day/night cycle
6. Weather effects (rain, sunshine)
7. More interactive elements
8. Photo gallery integration
9. RSVP form
10. Guest book

---

## Export to Cursor IDE

This is a standard React + TypeScript project. To export:

1. Copy entire project folder
2. Open in Cursor IDE
3. Run:
```bash
pnpm install
pnpm run dev
```

All components are self-contained and easy to modify!

---

## File Structure

```
src/
├── app/
│   ├── App.tsx                 # Main app
│   └── components/
│       ├── GrassBackground.tsx # Layer 0: Base
│       ├── RiverPath.tsx       # Layer 1: Animated river
│       ├── Trees.tsx           # Layer 2: Environment
│       ├── Villages.tsx        # Layer 3: Homes
│       ├── LotusFlowers.tsx    # Layer 4: Milestones
│       ├── Boat.tsx            # Layer 5: Journey
│       ├── EventModal.tsx      # Layer 6: Details
│       └── ImageWithFallback.tsx # Utility
└── styles/
    └── theme.css               # Global styles
```

---

**Built with isometric top-down view for seamless mobile wedding invitation experience!** 🌸🚣‍♀️💐
