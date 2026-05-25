# 💐 Wedding Invitation - Isometric Mobile Site

A beautiful, interactive wedding invitation with **isometric top-down view**, seamless SVG graphics, and smooth animations, designed for mobile portrait mode.

## ✨ Features

- **Isometric Design**: Top-down view matching hand-drawn sketch style
- **Layered Architecture**: Each element (grass, river, trees, villages, lotus, boat) in separate layers
- **Seamless Integration**: All SVG elements blend naturally into one cohesive environment
- **Animated River**: Separate river layer with CSS animation for flowing water effect
- **Interactive**: Click lotus flowers to reveal event details
- **Mobile-First**: Optimized for portrait mode on smartphones
- **Easy to Customize**: Swap SVGs, adjust positions, modify river path

## 🎨 Visual Journey

```
Bride's Village (Top-Left) 🏡 👨‍👩‍👧
          ↓
    🌊 Winding River 🌊
          ↓
    Lotus 1: Engagement 🪷
          ↓
    Lotus 2: Mehendi 🪷
          ↓
    Lotus 3: Wedding 🪷
          ↓
Groom's Village (Bottom-Right) 🏡 👨‍👩‍👧
```

## 📂 Layer Structure (Isometric View)

| Layer | Component | Purpose | Z-Index |
|-------|-----------|---------|---------|
| 0 | `GrassBackground` | Green grass/land base | 0 |
| 1 | `RiverPath` | **Animated winding river** (CSS) | 10 |
| 2 | `Trees` | Scattered trees (both sides) | 20 |
| 3 | `Villages` | Houses + stick figure families | 30 |
| 4 | `LotusFlowers` | Clickable milestones | 40 |
| 5 | `Boat` | Bowl boat + bride figure | 50 |
| 6 | `EventModal` | Event details popup | 100 |

## 🎯 Design Principles

1. **Isometric Top-Down View**: River flows vertically, all elements viewed from above
2. **SVG Graphics**: Crisp, scalable vector graphics for all elements
3. **Seamless Blending**: No white backgrounds, natural color scheme
4. **Simple Shapes**: Minimalist design matching sketch aesthetics
5. **Separate River Layer**: Enables independent CSS animation control

## 🚀 Quick Start

The site is ready! View the preview to see the interactive wedding journey.

## 🎯 How It Works

1. **Start**: Bowl-shaped boat with bride at top-left village
2. **Click Lotus**: Tap any lotus to:
   - View event details (date, time, venue)
   - Animate boat to that milestone
3. **Journey**: Boat follows winding river path smoothly
4. **Destination**: Arrives at bottom-right groom's village

## 🔧 Customization

See **[LAYER_STRUCTURE.md](./LAYER_STRUCTURE.md)** for complete guide.

### Quick Customizations

**Modify River Path**:
```tsx
// Edit: src/app/components/RiverPath.tsx
<path d="M 35 0 Q 25 15, 30 30 ..." /> // Change SVG coordinates
```

**Add/Remove Trees**:
```tsx
// Edit: src/app/components/Trees.tsx
const trees = [
  { x: '10%', y: '25%', size: 'medium', type: 'rounded' },
  // Add more trees here
];
```

**Adjust Lotus Positions** (follow river):
```tsx
// Edit: src/app/components/LotusFlowers.tsx
const lotusPositions = [
  { top: '28%', left: '32%', label: 'Engagement' }, // Adjust %
];
```

**Update Boat Path** (match river curve):
```tsx
// Edit: src/app/components/Boat.tsx
const pathCoordinates = [
  { top: '12%', left: '28%', rotate: 15 },
  // Match river bends
];
```

**Change Event Details**:
```tsx
// Edit: src/app/components/EventModal.tsx
const events = [
  {
    title: 'Engagement Ceremony',
    date: 'June 15, 2026',
    time: '6:00 PM - 9:00 PM',
    location: "Bride's Family Garden",
  },
];
```

## 📱 Mobile Features

- ✅ **Portrait Mode**: Optimized for vertical phone screens
- ✅ **Touch Enabled**: All lotus flowers are tappable
- ✅ **Responsive**: Percentage-based positioning scales perfectly
- ✅ **Smooth Animations**: Hardware-accelerated with Motion
- ✅ **SVG Scaling**: Crisp graphics at any resolution

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Motion (Framer Motion)** for smooth animations
- **SVG Graphics** for all visual elements
- **CSS Animations** for river flow

## 📦 Export to Cursor IDE

Standard React project, ready to customize:

```bash
pnpm install
pnpm run dev
```

Copy entire project folder to Cursor and start editing!

## 🎨 Component Details

### 🌿 Grass Background
- Green gradient base layer
- Subtle texture pattern
- Natural grass colors

### 🌊 River Path (Animatable!)
- SVG winding path
- Blue gradient water
- CSS shimmer animation
- **Fully controllable flow speed**

### 🌳 Trees
- 13 SVG trees scattered naturally
- Two styles: rounded & bushy
- Various sizes for depth
- Left and right side placement

### 🏡 Villages
- Simple house SVG (roof + walls)
- Stick figure families (3 people each)
- Pink theme (bride) / Blue theme (groom)
- Small labels for clarity

### 🪷 Lotus Flowers
- SVG lotus with lily pad
- Floating animation
- Click to reveal events
- Positioned along river path

### 🚣 Boat
- Bowl-shaped boat SVG
- Stick figure bride in pink
- Decorative flowers
- Smooth path animation
- Water ripples

### 📅 Event Modal
- Slide-in animation
- Color-coded cards
- Event details (date/time/venue)
- Backdrop blur effect

## 💡 Enhancement Ideas

- Parallax scrolling
- Tree leaves animation
- Flying birds
- Water sound effects
- Day/night cycle
- Weather effects (rain/sun)
- Photo gallery
- RSVP form
- WhatsApp integration
- Google Maps venue link

## 📐 Isometric Tips

All elements maintain consistent top-down perspective:
- River flows straight down
- Trees viewed from above (circular crowns)
- Houses show simple roof angle
- Boat visible from overhead
- Lotus flat on water surface

## 📄 Files Overview

```
src/app/
├── App.tsx                 # Main orchestrator
└── components/
    ├── GrassBackground.tsx # Layer 0: Land
    ├── RiverPath.tsx       # Layer 1: Water (animated)
    ├── Trees.tsx           # Layer 2: Forest
    ├── Villages.tsx        # Layer 3: Homes
    ├── LotusFlowers.tsx    # Layer 4: Milestones
    ├── Boat.tsx            # Layer 5: Journey
    └── EventModal.tsx      # Layer 6: Details
```

---

**Built with isometric design for a seamless mobile wedding invitation!** 🌸🚣‍♀️💐
