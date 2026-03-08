# SafeHer Theme Guide

## 🎨 Color Palette: Deep Plum + Rose Gold + Blush + Champagne

### Primary Colors
- **Deep Plum** (`#1A0B1E`): Main background - dark berry tone
- **Rich Plum** (`#2D1438`): Surface layers
- **Plum Card** (`#3D1D4A`): Card backgrounds with glass effect
- **Rose Gold** (`#E89BAA`): Primary action color
- **Blush** (`#F5B3C3`): Light accent, highlights
- **Champagne** (`#F5E6D3`): Warm gold accent

### Accent Colors
- **Rose Gold Accent** (`#D4A373`): Warm secondary tone
- **Soft Peach** (`#F2A896`): Warm complement
- **Soft Sage** (`#7FD9B5`): Safe/positive status
- **Rose White** (`#FBF3F0`): Luminous text

### Borders & Glass Effects
- **Soft Pink Border** (`rgba(240, 212, 221, 0.3)`): Card borders
- **Glass Light** (`rgba(245, 227, 235, 0.08)`): Glass effect overlay
- **Shimmer** (`rgba(255, 255, 255, 0.25)`): Glowing overlay

## ✨ Design Elements

### 1. Glowing Ambient Blobs
Decorative animated background elements that add depth and warmth.

**Classes:**
- `.blob-1`: Rose gold blob (top-left)
- `.blob-2`: Blush blob (right side)
- `.blob-3`: Champagne blob (bottom-left)

**Features:**
- Soft blur filter (60px)
- Floating animation (15-20s duration)
- Opacity pulse effect
- Low z-index (background)

### 2. Glass Cards
Frosted glass effect cards with soft pink borders.

**Class:** `.glass-card`

**Features:**
- Semi-transparent background (`rgba(61, 29, 74, 0.5)`)
- Backdrop blur (10px)
- Soft pink border (`rgba(240, 212, 221, 0.3)`)
- Hover effect with enhanced shadow
- Soft shadow: `0 8px 32px rgba(26, 11, 30, 0.3)`

**Usage:**
```jsx
<View style={{
  backgroundColor: "rgba(61, 29, 74, 0.5)",
  borderWidth: 1.5,
  borderColor: "rgba(240, 212, 221, 0.3)",
  borderRadius: 20,
  padding: 20,
}}>
  {/* Content */}
</View>
```

### 3. Shimmer Text Effect
Gradient text with glowing animation.

**Classes:**
- `.shimmer-text`: Normal speed (8s animation)
- `.shimmer-text-fast`: Fast speed (4s animation)

**Features:**
- Rose gold → blush → champagne gradient
- Infinite linear animation
- Works on headings and bold text

**Usage:**
```jsx
<Text style={{ /* Use CSS shimmer-text class for web */ }}>
  Shimmer Text
</Text>
// Web: <h1 className="shimmer-text">Shimmer Text</h1>
```

### 4. Rotating Orbit Ring (SOS Button)
Decorative rotating orbit around the emergency SOS button.

**Class:** `.sos-button-orbit`

**Features:**
- Primary button styling (rose gold)
- Outer rotating border ring
- Glowing pulsing animation
- Orbiting dot with glow
- 3-second rotation cycle
- Active state scaling

**Animations:**
- `orbitRotate`: 3s linear infinite (border ring)
- `orbitPulse`: 2s ease-in-out infinite (glow effect)
- Touch active: scale(0.95)

**Usage (Component):**
```jsx
import OrbitSOSButton from '@/components/theme/OrbitSOSButton';

<OrbitSOSButton 
  onPress={() => setShowModal(true)}
  isActive={someState}
/>
```

**Usage (Styled card):**
```jsx
<TouchableOpacity style={[s.qaCard, s.qaCardDanger]}>
  {/* Content */}
</TouchableOpacity>
```

## 🎭 Complete Color System (globalStyles.js)

```javascript
COLORS = {
  // Backgrounds
  bg:        "#1A0B1E",      // Deep plum
  surface:   "#2D1438",      // Rich plum
  card:      "#3D1D4A",      // Plum card
  cardLight: "#4D2560",      // Light plum
  border:    "#9D5A9A",      // Mauve-plum

  // Primary (Rose Gold)
  primary:       "#E89BAA",
  primaryDark:   "#D67B8F",
  primaryLight:  "#F5B3C3",
  primaryGlow:   "#FFB3CA",

  // Warm Accents
  roseGold:      "#D4A373",
  blush:         "#F5B3C3",
  champagne:     "#F5E6D3",
  gold:          "#E6C5A8",
  silver:        "#F0D4DD",

  // Text
  text:      "#FBF3F0",
  textMuted: "#D4A9AC",
  textDim:   "#9B7078",

  // Glass Effects
  glassLight: "rgba(245, 227, 235, 0.08)",
  glassMid:   "rgba(217, 154, 170, 0.06)",
  shimmer:    "rgba(255, 255, 255, 0.25)",

  // Overlays
  overlay:      "rgba(26, 11, 30, 0.92)",
  overlayLight: "rgba(61, 29, 74, 0.85)",
}
```

## 🎨 Component Styling Guide

### Glass Cards (Standard)
```jsx
backgroundColor: "rgba(61, 29, 74, 0.5)"
borderWidth: 1.5
borderColor: "rgba(240, 212, 221, 0.3)"
borderRadius: 20
padding: 20
```

### Danger/Alert Cards (SOS Button)
```jsx
backgroundColor: "rgba(200, 80, 155, 0.08)"
borderColor: "rgba(233, 155, 170, 0.4)"
```

### Icon Wrappers
```jsx
backgroundColor: "rgba(77, 37, 96, 0.7)"
borderRadius: 12
```

### Text
- **Primary text**: `#FBF3F0` (warm white)
- **Secondary text**: `#D4A9AC` (muted rose)
- **Dimmed text**: `#9B7078` (dimmed plum)

## 🌟 Animation Timings

- **Blob animations**: 15-20s (slow, gentle)
- **Shimmer text**: 8s normal, 4s fast
- **Orbit ring**: 3s continuous rotation
- **Pulse/glow**: 2s ease-in-out

## 📱 Responsive Design

All components scale appropriately:
- Use relative sizing (flex, percentages)
- Glass card padding adapts to screen size
- Text sizes follow COLORS hierarchy
- Blobs position absolutely for background depth

## ♿ Accessibility

- Sufficient contrast ratios maintained
- Shimmer text not primary content
- Ambient blobs are decorative (not focused)
- Links and buttons maintain WCAG AA standards

## 🔧 Implementation Checklist

- [x] Update globalStyles.js with new color palette
- [x] Update App.css with glass effects and animations
- [x] Update index.css with deep plum theme
- [x] Update HomeScreen card styling
- [x] Update LandingScreen rings and badges
- [x] Update MapScreen components
- [x] Update LoginScreen dividers
- [x] Update ContactsScreen cards
- [x] Update SettingsScreen groups
- [x] Update EscalationModal styling
- [x] Create AmbientBlobs component
- [x] Create OrbitSOSButton component
- [x] Create ShimmerText component
- [x] Add CSS animations to App.css

## 🎯 Next Steps

1. Import and use AmbientBlobs in App.js for background
2. Consider using OrbitSOSButton in HomeScreen's quick actions
3. Apply shimmer-text CSS class to important headings
4. Test theme across all screen sizes
5. Verify color contrast ratios for accessibility
6. Gather feedback on warmth and femininity of palette

## 📝 Notes

The theme emphasizes:
- **Warmth**: Rose gold, blush, champagne (no stark colors)
- **Femininity**: Soft curves, glowing effects, gentle animations
- **Safety**: Deep backgrounds with bright accents for emergency features
- **Luxury**: Glass effects, subtle shimmer, ambient depth
- **Motion**: Gentle, non-jarring animations at appropriate speeds

---

*Theme designed for SafeHer - AI Safety Intelligence Platform*
*Deep Plum + Rose Gold + Blush + Champagne color scheme*
