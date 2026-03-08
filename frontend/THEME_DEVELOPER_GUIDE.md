# SafeHer Theme - Developer Implementation Guide

## Quick Reference: How to Use the Theme

### 1. Import and Use Theme Components

```jsx
// In your screen or component file
import { COLORS, shared } from '../styles/globalStyles';
import { AmbientBlobs, OrbitSOSButton, ShimmerText } from '../components/theme';
```

### 2. Using COLORS Directly

```jsx
// All colors are defined in globalStyles.js
const myStyle = {
  backgroundColor: COLORS.bg,          // Deep plum
  borderColor: COLORS.border,          // Mauve-plum
  color: COLORS.text,                  // Warm white text
};

// Glass effect colors
const glassCard = {
  backgroundColor: "rgba(61, 29, 74, 0.5)",      // Glass background
  borderColor: "rgba(240, 212, 221, 0.3)",       // Soft pink border
};
```

### 3. Applying Glass Effect to Cards

```jsx
// Standard glass card pattern (already applied to all screen cards)
const myCard = StyleSheet.create({
  card: {
    backgroundColor: "rgba(61, 29, 74, 0.5)",
    borderWidth: 1.5,
    borderColor: "rgba(240, 212, 221, 0.3)",
    borderRadius: 20,
    padding: 16,
  }
});

// Danger/Alert card (for SOS button)
const dangerCard = {
  backgroundColor: "rgba(200, 80, 155, 0.08)",
  borderColor: "rgba(233, 155, 170, 0.4)",
};
```

### 4. Adding Ambient Blobs to Your Screen

```jsx
// In your screen component
import { AmbientBlobs } from '../components/theme';

export default function MyScreen() {
  return (
    <View style={s.container}>
      <AmbientBlobs />  {/* Add at top level */}
      {/* Your content */}
    </View>
  );
}

// CSS in your component (if web):
// The blobs will automatically animate via CSS in App.css
```

### 5. Using Shimmer Text

```jsx
// React Native component
import { ShimmerText } from '../components/theme';

<ShimmerText size="lg" speed="normal">
  Important Title
</ShimmerText>

// For web, use CSS class
<h1 className="shimmer-text">Important Title</h1>
<h2 className="shimmer-text-fast">Fast Shimmer Title</h2>
```

### 6. Using Orbit SOS Button

```jsx
// Option A: New component (recommended for full animation)
import { OrbitSOSButton } from '../components/theme';

<OrbitSOSButton 
  onPress={() => setShowModal(true)}
  isActive={sending}
/>

// Option B: Styled TouchableOpacity (already styled in HomeScreen)
<TouchableOpacity 
  style={[s.qaCard, s.qaCardDanger]}
  onPress={onShowModal}
>
  <Ionicons name="alert-circle" size={22} color={COLORS.primary} />
  <Text style={s.qaLabel}>Alert Contacts</Text>
</TouchableOpacity>
```

## Common Use Cases

### Creating a New Glass Card

```jsx
const MyComponent = () => {
  return (
    <View style={{
      backgroundColor: "rgba(61, 29, 74, 0.5)",
      borderWidth: 1.5,
      borderColor: "rgba(240, 212, 221, 0.3)",
      borderRadius: 20,
      padding: 20,
    }}>
      <Text style={{ color: COLORS.text }}>
        Beautiful glass card content
      </Text>
    </View>
  );
};
```

### Creating Text Hierarchy

```jsx
// Title (can use shimmer)
<Text style={{ 
  fontSize: 28, 
  fontWeight: '700', 
  color: COLORS.text 
}}>
  Main Title
</Text>

// Subtitle (secondary color)
<Text style={{ 
  fontSize: 16, 
  color: COLORS.textMuted 
}}>
  Subtitle or description
</Text>

// Dimmed/tertiary text
<Text style={{ 
  fontSize: 12, 
  color: COLORS.textDim 
}}>
  Small, less important text
</Text>
```

### Creating Buttons with Warm Accents

```jsx
// Primary button (already defined in shared.btnPrimary)
<TouchableOpacity style={shared.btnPrimary}>
  <Text style={shared.btnPrimaryText}>Primary Action</Text>
</TouchableOpacity>

// Secondary button (already defined in shared.btnSecondary)
<TouchableOpacity style={shared.btnSecondary}>
  <Text style={shared.btnSecondaryText}>Secondary Action</Text>
</TouchableOpacity>

// Custom button with theme colors
<TouchableOpacity style={{
  backgroundColor: COLORS.primary,
  borderRadius: 16,
  paddingVertical: 16,
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.45,
  shadowRadius: 16,
}}>
  <Text style={{ color: COLORS.white, fontWeight: '700' }}>
    Action Button
  </Text>
</TouchableOpacity>
```

### Status Indicators

```jsx
// Safe status
<View style={{
  backgroundColor: "rgba(127, 217, 181, 0.15)",
  borderRadius: 100,
  padding: 8,
}}>
  <Text style={{ color: COLORS.safe }}>SAFE</Text>
</View>

// Medium risk
<View style={{
  backgroundColor: "rgba(230, 197, 168, 0.15)",
  borderRadius: 100,
  padding: 8,
}}>
  <Text style={{ color: COLORS.medium }}>MEDIUM</Text>
</View>

// High risk
<View style={{
  backgroundColor: "rgba(242, 168, 150, 0.15)",
  borderRadius: 100,
  padding: 8,
}}>
  <Text style={{ color: COLORS.high }}>HIGH</Text>
</View>

// Critical
<View style={{
  backgroundColor: "rgba(232, 69, 58, 0.15)",
  borderRadius: 100,
  padding: 8,
}}>
  <Text style={{ color: COLORS.critical }}>CRITICAL</Text>
</View>
```

### Form Elements

```jsx
// Form label (match existing style)
<Text style={shared.formLabel}>
  Field Label
</Text>

// Form input (match existing style)
<TextInput
  style={shared.formInput}
  placeholder="Enter text..."
  placeholderTextColor={COLORS.textDim}
/>

// Section title (match existing style)
<Text style={shared.sectionTitle}>
  SECTION TITLE
</Text>
```

## Animation Timing Reference

For consistency across animations:

```javascript
// Slow, gentle (background elements)
duration: 15000,     // 15 seconds
easing: 'ease-in-out'

// Medium (interactive elements)
duration: 3000,      // 3 seconds
easing: 'linear'

// Fast (emphasis/feedback)
duration: 2000,      // 2 seconds
easing: 'ease-in-out'

// Text/shimmer animations
duration: 8000,      // 8 seconds (normal)
duration: 4000,      // 4 seconds (fast)
easing: 'linear'
```

## Opacity & Transparency Guidelines

For consistent glass effect across the app:

```javascript
// Backgrounds
backgroundColor: "rgba(61, 29, 74, 0.5)"     // 50% opacity
backgroundColor: "rgba(61, 29, 74, 0.4)"     // 40% opacity (lighter)
backgroundColor: "rgba(45, 20, 56, 0.6)"     // 60% opacity (darker)

// Borders
borderColor: "rgba(240, 212, 221, 0.4)"      // 40% opacity (bright)
borderColor: "rgba(240, 212, 221, 0.3)"      // 30% opacity (standard)
borderColor: "rgba(240, 212, 221, 0.2)"      // 20% opacity (subtle)

// Overlays
backgroundColor: "rgba(26, 11, 30, 0.92)"    // 92% opacity (strong overlay)
backgroundColor: "rgba(61, 29, 74, 0.85)"    // 85% opacity

// Status/accent backgrounds
backgroundColor: "rgba(200, 80, 155, 0.15)"  // 15% opacity (very light)
backgroundColor: "rgba(200, 80, 155, 0.08)"  // 8% opacity (extra light)
```

## Shadow & Elevation Guidelines

For depth and dimension:

```javascript
// Subtle shadows (cards, small elements)
shadowColor: COLORS.primary,
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.2,
shadowRadius: 8,
elevation: 3,

// Medium shadows (interactive elements)
shadowColor: COLORS.primary,
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.3,
shadowRadius: 16,
elevation: 8,

// Strong shadows (buttons, prominent elements)
shadowColor: COLORS.primary,
shadowOffset: { width: 0, height: 12 },
shadowOpacity: 0.45,
shadowRadius: 20,
elevation: 12,

// Glow effect (SOS button, alerts)
shadowColor: COLORS.primary,
shadowOffset: { width: 0, height: 0 },
shadowOpacity: 0.6,
shadowRadius: 20,
elevation: 12,
```

## Border Radius Consistency

Maintain visual hierarchy with border radius:

```javascript
// Extra large (backgrounds, hero sections)
borderRadius: 28
borderRadius: 30

// Large (cards, major containers)
borderRadius: 20
borderRadius: 22

// Medium (form elements, buttons)
borderRadius: 14
borderRadius: 16

// Small (icons, badges)
borderRadius: 8
borderRadius: 12

// Pills/badges
borderRadius: 100  // fully rounded
```

## Responsive Sizing

For mobile and tablets:

```javascript
// Calculate sizes based on screen width
const { width: W } = Dimensions.get('window');

// Two-column grid
width: (W - 52) / 2,   // Accounts for margins (20+20 + gap 12)

// Padding scales
paddingHorizontal: 20,  // Standard horizontal padding
paddingVertical: 16,    // Standard button padding
gap: 12,               // Standard gap between elements
marginBottom: 20,      // Standard spacing between sections
```

## Testing Your Theme Implementation

### Checklist

- [ ] All cards have glass background + soft pink border
- [ ] Text colors match hierarchy (text, textMuted, textDim)
- [ ] Buttons use rose gold primary color
- [ ] Status indicators use correct colors (safe, medium, high, critical)
- [ ] Shadows are subtle and warm-toned
- [ ] No harsh borders or colors (everything is warm)
- [ ] Animations are smooth (no janky transitions)
- [ ] Text is readable over glass backgrounds
- [ ] Hover/active states are visually distinct
- [ ] Mobile layout looks good on small screens

## Troubleshooting

### Glass Effect Not Working
- Ensure `borderColor` uses the soft pink: `rgba(240, 212, 221, 0.x)`
- Check that `backgroundColor` has proper opacity: `rgba(61, 29, 74, 0.5)`
- Verify backdrop effect is visible (may not show in all browsers/devices)

### Text Not Readable
- Use `#FBF3F0` for primary text
- Use `#D4A9AC` for secondary/muted text
- Ensure sufficient contrast over backgrounds
- Test with accessibility tools

### Colors Look Wrong
- Double-check hex values in COLORS object
- Verify you're using the new theme file (globalStyles.js)
- Clear app cache and rebuild
- Check if using old color values by mistake

### Animations Are Choppy
- Use `transform` and `opacity` properties (GPU accelerated)
- Avoid animating `width`, `height`, `backgroundColor`
- Reduce animation duration if too slow
- Check device performance

## Theme Versioning

Current Version: **1.0**
Release Date: **March 4, 2026**

### Version 1.0 Features
- Deep plum + rose gold + blush + champagne palette
- Glass card styling with soft pink borders
- Ambient blob animations
- Shimmer text effects
- Rotating orbit ring for SOS button
- Updated all screen components

## Support & Feedback

For theme questions or improvements, refer to:
- `THEME_GUIDE.md` - Comprehensive documentation
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `THEME_PALETTE.html` - Visual reference (open in browser)

---

Happy theming! 🌸✨
