# CineVerse - Visual Consistency Guide

## 🎨 Design System

This guide ensures **pixel-perfect consistency** across all collaborators, browsers, and devices.

---

## 🎯 Core Principles

1. **Consistency**: Same components = Same appearance
2. **Predictability**: User knows what to expect
3. **Accessibility**: Clear states and feedback
4. **Performance**: Fast, smooth, responsive

---

## 🖼️ Movie Card Design

### Standard Movie Card

**Dimensions**:
- Width: `auto` (responsive grid)
- Aspect Ratio: `2:3` (poster)
- Border Radius: `10px`
- Background: `#181818`

**Components**:

```
┌─────────────────────┐
│  🎬 Poster Image    │  ← 2:3 aspect ratio
│                     │
│   [AI: 9.2] ⭐ 4   │  ← Badges (top)
│                     │
│  [Hover Overlay]    │  ← Gradient on hover
│  ★★★★☆ [Details]   │  ← Controls (hover)
│                     │
├─────────────────────┤
│ Movie Title         │  ← Footer section
│ [Genre] [Genre] '24 │  ← Tags & year
│ [Industry]          │  ← Industry tag
└─────────────────────┘
```

### States

**1. Loading (Skeleton)**:
```
┌─────────────────────┐
│                     │
│   ████████████      │  ← Shimmer animation
│   ██████            │  ← Gradient pulse
│                     │
├─────────────────────┤
│ ████████            │
│ ████  ████  ████    │
│ ████                │
└─────────────────────┘
```

**2. Error (Fallback)**:
```
┌─────────────────────┐
│                     │
│        🎬           │  ← Film emoji
│    Movie Title      │  ← Gray text
│                     │
├─────────────────────┤
│ Movie Title         │
│ [Genre] [Genre] '24 │
│ [Industry]          │
└─────────────────────┘
```

**3. Hover**:
```
┌─────────────────────┐
│  🎬 Poster (1.05×)  │  ← Slight scale
│                     │
│   [AI: 9.2] ⭐ 4   │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← Gradient overlay
│  ★★★★☆ [Details]   │  ← Rating controls
│  Rate: ★★★★★       │
├─────────────────────┤
│ Movie Title         │  ← Red glow border
│ [Genre] [Genre] '24 │
│ [Industry]          │
└─────────────────────┘
```

---

## 🎭 Color Palette

### Primary Colors

```css
Background:       #141414  /* Main app background */
Card Background:  #181818  /* Movie cards, panels */
Card Hover:       #252525  /* Lighter on hover */
Border:           #1a1a1a  /* Subtle dividers */
```

### Accent Colors

```css
Netflix Red:      #E50914  /* Primary actions */
Red Gradient:     #E50914 → #b30000  /* Buttons, badges */
Red Hover:        #c20710  /* Button hover */
Red Transparent:  rgba(229,9,20,0.12)  /* Backgrounds */
```

### Text Colors

```css
White:            #fff      /* Primary text */
Light Gray:       #ccc      /* Secondary text */
Medium Gray:      #888      /* Tertiary text */
Dark Gray:        #666      /* Muted text */
Very Dark Gray:   #555      /* Disabled text */
Darkest Gray:     #333      /* Placeholder text */
```

### Rating Colors

```css
IMDB Yellow:      #F5C518  /* Star ratings */
AI Score:         #E50914  /* AI badge */
Success:          #4BCBEB  /* Trending indicator */
Award:            #F7B731  /* Top rated */
```

---

## 📐 Spacing & Layout

### Grid System

**Desktop (1024px+)**:
```css
grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
gap: 16px;
```

**Tablet (768px - 1023px)**:
```css
grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
gap: 14px;
```

**Mobile (< 768px)**:
```css
grid-template-columns: repeat(2, 1fr);
gap: 12px;
```

### Padding & Margins

```css
/* Section spacing */
margin-bottom: 24px;  /* Between sections */
padding: 28px 24px;   /* Page content */

/* Card spacing */
padding: 10px;        /* Card footer */
gap: 4px;             /* Genre tags */

/* Component spacing */
gap: 16px;            /* Grid items */
gap: 12px;            /* Buttons, icons */
```

### Border Radius

```css
Large:    20px  /* Chat window, modals */
Medium:   12px  /* Panels, cards */
Small:    8px   /* Buttons */
Tiny:     6px   /* Badges */
Round:    50%   /* Avatar, floating button */
```

---

## ✨ Animations

### Fade In (Standard)

```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}
```

**Usage**: Page load, content reveal

### Stagger Grid

```typescript
transition={{ delay: index * 0.06 }}
```

**Usage**: Movie grids (6% delay per item)

### Hover Scale

```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

**Usage**: Buttons, interactive elements

### Skeleton Shimmer

```typescript
animate={{
  background: [
    'linear-gradient(90deg, #1a1a1a 0%, #252525 50%, #1a1a1a 100%)',
    'linear-gradient(90deg, #1a1a1a 100%, #252525 150%, #1a1a1a 200%)',
  ],
}}
transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
```

**Usage**: Loading placeholders

### Pulse (Subtle)

```typescript
animate={{ opacity: [0.3, 0.6, 0.3] }}
transition={{ duration: 1.5, repeat: Infinity }}
```

**Usage**: Loading states, attention

### Typing Indicator

```typescript
animate={{ y: [0, -8, 0] }}
transition={{
  duration: 0.6,
  repeat: Infinity,
  delay: i * 0.15,
  ease: 'easeInOut',
}}
```

**Usage**: Chatbot typing dots

---

## 🏷️ Typography

### Font Sizes

```css
h1:          1.8rem   /* Page titles */
h2:          1.2rem   /* Section headers */
h3:          1.05rem  /* Subsection headers */
body:        0.9rem   /* Standard text */
small:       0.78rem  /* Metadata, captions */
tiny:        0.68rem  /* Tags, labels */
```

### Font Weights

```css
normal:      400
medium:      600
bold:        700
```

### Line Height

```css
tight:       1.2      /* Headings */
normal:      1.5      /* Body text */
relaxed:     1.6      /* Long-form content */
```

---

## 🎨 Component Styles

### Badges

**AI Score Badge**:
```css
background: linear-gradient(135deg, #E50914, #ff4444);
border-radius: 6px;
padding: 3px 8px;
font-size: 0.72rem;
font-weight: 700;
color: #fff;
box-shadow: 0 2px 8px rgba(229,9,20,0.4);
```

**Genre Tag**:
```css
background: rgba(229,9,20,0.12);
border: 1px solid rgba(229,9,20,0.25);
border-radius: 4px;
padding: 1px 6px;
color: #E50914;
font-size: 0.68rem;
```

**Industry Tag**:
```css
background: #1a1a1a;
border: 1px solid #333;
border-radius: 4px;
padding: 2px 8px;
color: #888;
font-size: 0.68rem;
```

### Buttons

**Primary Button**:
```css
background: linear-gradient(135deg, #E50914, #b30000);
border: none;
border-radius: 8px;
padding: 12px 32px;
color: #fff;
font-weight: 600;
box-shadow: 0 4px 16px rgba(229,9,20,0.3);
```

**Secondary Button**:
```css
background: rgba(255,255,255,0.1);
border: 1px solid rgba(255,255,255,0.2);
border-radius: 6px;
padding: 8px 16px;
color: #ccc;
```

**Icon Button**:
```css
background: rgba(255,255,255,0.15);
border-radius: 50%;
width: 40px;
height: 40px;
```

---

## 📦 Shadows

### Card Shadow

```css
/* Default */
box-shadow: 0 0 0 1px rgba(255,255,255,0.05);

/* Hover */
box-shadow: 
  0 0 0 1px rgba(229,9,20,0.4),
  0 8px 32px rgba(229,9,20,0.2);
```

### Modal Shadow

```css
box-shadow: 
  0 24px 60px rgba(0,0,0,0.9),
  0 0 0 1px rgba(255,255,255,0.08);
```

### Button Shadow

```css
box-shadow: 0 4px 16px rgba(229,9,20,0.3);
```

---

## 🎬 Movie Poster Guidelines

### Image Loading Flow

```
1. Show Loading Spinner
   ↓
2. Try Loading Poster
   ↓
   Success? → Fade In Image
   ↓
   Failed?  → Show Fallback
```

### Fallback Hierarchy

**Primary**: TMDB image URL
```
https://image.tmdb.org/t/p/w300/[poster_path]
```

**Secondary**: Placeholder service
```
https://placehold.co/300x450/181818/666666?text=[title]
```

**Tertiary**: Emoji fallback
```
🎬
Movie Title
(Styled with gradient background)
```

---

## 💬 Chatbot Design

### Chat Window

**Desktop**:
- Width: `420px`
- Height: `600px`
- Position: `fixed bottom-6 right-6`

**Mobile**:
- Width: `calc(100vw - 48px)`
- Height: `calc(100vh - 100px)`

### Message Bubbles

**User Message**:
```css
background: linear-gradient(to-r, #E50914, #b30000);
color: #fff;
border-radius: 16px 16px 4px 16px;
padding: 12px 16px;
box-shadow: 0 4px 12px rgba(229,9,20,0.3);
```

**Bot Message**:
```css
background: rgba(255,255,255,0.1);
color: #fff;
border-radius: 16px 16px 16px 4px;
padding: 12px 16px;
```

**Error Message**:
```css
background: rgba(220,38,38,0.3);
color: #fca5a5;
border: 1px solid rgba(220,38,38,0.5);
border-radius: 16px 16px 16px 4px;
padding: 12px 16px;
```

### Suggestion Chips

```css
background: rgba(255,255,255,0.08);
border: 1px solid rgba(255,255,255,0.2);
border-radius: 20px;
padding: 8px 12px;
color: #ccc;
font-size: 0.75rem;
```

---

## 🚦 Loading States

### Full Page Loading

```
┌─────────────────────────────────┐
│                                 │
│          ⚪ Spinner            │
│    Loading real-time data...   │
│                                 │
└─────────────────────────────────┘
```

### Skeleton Loading (Grid)

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ ████ │ │ ████ │ │ ████ │ │ ████ │
│ ████ │ │ ████ │ │ ████ │ │ ████ │
│ ████ │ │ ████ │ │ ████ │ │ ████ │
│ ███  │ │ ███  │ │ ███  │ │ ███  │
└──────┘ └──────┘ └──────┘ └──────┘
```

### Inline Loading (Chatbot)

```
⚪⚪⚪ thinking...
```

---

## ❌ Empty States

### Search Empty

```
┌─────────────────────────────────┐
│                                 │
│          🔍                     │
│    No Results Found             │
│    Try adjusting your search    │
│                                 │
└─────────────────────────────────┘
```

### Category Empty

```
┌─────────────────────────────────┐
│                                 │
│          📈                     │
│    No Content Available         │
│    No movies in this category   │
│                                 │
└─────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────┐
│                                 │
│          🎬                     │
│    Something Went Wrong         │
│    Please try again later       │
│                                 │
│      [Retry] Button             │
│                                 │
└─────────────────────────────────┘
```

---

## ⭐ Rating Display

### Star Rating (Read-only)

```
★★★★☆ 8.5
```

**Colors**:
- Filled: `#F5C518` (IMDB yellow)
- Empty: `#333` (dark gray)

### Star Rating (Interactive)

```
☆☆☆☆☆  (default)
★★★☆☆  (on hover - 3 stars)
★★★★★  (after click - 5 stars)
```

**Behavior**:
- Hover: Preview rating
- Click: Submit rating
- Persist: localStorage

---

## 🎯 Visual Consistency Checklist

When adding new features, ensure:

- [ ] Uses standard color palette
- [ ] Follows spacing guidelines (16px grid)
- [ ] Includes loading state
- [ ] Includes empty state
- [ ] Includes error state
- [ ] Responsive on all screen sizes
- [ ] Animations are smooth (60fps)
- [ ] Text is readable (sufficient contrast)
- [ ] Interactive elements have hover states
- [ ] Touch targets are 44px+ on mobile
- [ ] Uses existing components (no duplicates)
- [ ] Matches existing design patterns

---

## 📱 Mobile-Specific Adjustments

### Touch Targets

**Minimum Size**: `44px × 44px`

**Examples**:
- Buttons: `48px` height
- Icon buttons: `40px` diameter
- Movie cards: `> 160px` width

### Spacing

**Mobile padding**: `16px` (vs `24px` desktop)
**Mobile gap**: `12px` (vs `16px` desktop)

### Font Sizes

**Slightly larger on mobile** for readability:
```css
body:  0.95rem  (vs 0.9rem desktop)
small: 0.8rem   (vs 0.78rem desktop)
```

---

## 🎨 Accessibility

### Color Contrast

**Text on Dark Background**:
- White (#fff) on Dark (#141414): ✅ AAA
- Light Gray (#ccc) on Dark: ✅ AA
- Medium Gray (#888) on Dark: ✅ AA
- Dark Gray (#666) on Dark: ⚠️ Use sparingly

**Text on Light Background**:
- Black on White: ✅ AAA

### Focus States

**All interactive elements must have visible focus**:
```css
&:focus {
  outline: 2px solid #E50914;
  outline-offset: 2px;
}
```

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for carousels

---

## 🎬 Animation Performance

### Best Practices

**✅ DO**:
- Animate `opacity`, `transform` (GPU-accelerated)
- Use `will-change` for known animations
- Limit concurrent animations
- Use `requestAnimationFrame`

**❌ DON'T**:
- Animate `width`, `height`, `top`, `left` (causes reflow)
- Animate during scroll (janky)
- Use too many simultaneous animations
- Forget to remove `will-change` after animation

### Performance Targets

- **60 FPS**: Smooth animations
- **< 100ms**: Instant feedback
- **< 300ms**: Quick transitions
- **< 1s**: Loading states

---

## 🔍 Testing Consistency

### Visual Regression Testing

**Test on**:
- [ ] Chrome (Windows, Mac, Linux)
- [ ] Safari (Mac, iOS)
- [ ] Firefox (Windows, Mac, Linux)
- [ ] Edge (Windows)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Screen Sizes

- [ ] 320px (Small mobile)
- [ ] 375px (Mobile)
- [ ] 768px (Tablet)
- [ ] 1024px (Small desktop)
- [ ] 1440px (Desktop)
- [ ] 1920px (Large desktop)

---

## 🎯 Final Checklist

Before shipping:

- [ ] All movie cards look identical
- [ ] All posters have fallbacks
- [ ] Loading states everywhere
- [ ] Empty states everywhere
- [ ] Error states everywhere
- [ ] Animations are smooth
- [ ] Colors match design system
- [ ] Spacing is consistent
- [ ] Typography is consistent
- [ ] Responsive on all screens
- [ ] Accessible (keyboard, screen readers)
- [ ] No console errors
- [ ] Fast performance (< 3s load)

---

**Remember**: Consistency is key to a professional, polished user experience!

---

**Last Updated**: March 18, 2026
**Version**: 2.0.0
