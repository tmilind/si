# SourceIntellect Theme: Cipher

A sophisticated, light-themed design system with clean neutrals and deep teal accent — calm, precise, and technically sophisticated.

## Color Palette

### Primary Colors
- **Ink**: `#1c1c1c` - Primary text, headers, strong emphasis
- **Graphite**: `#52525b` - Secondary text, body copy
- **Stone**: `#71717a` - Muted text, captions

### Neutral Base
- **Mist**: `#fafafa` - Primary background
- **Cloud**: `#ffffff` - Cards, elevated surfaces
- **Fog**: `#e4e4e7` - Borders, dividers, subtle backgrounds

### Accent Color
- **Teal**: `#0d9488` - Primary accent
- **Teal Light**: `#f0fdfa` - Accent backgrounds, highlights
- **Teal Dark**: `#0f766e` - Hover states, emphasis

## Typography

### Fonts
- **Headers**: Space Grotesk (Bold 600-700)
- **Body Text**: Inter (Regular 400, Medium 500)
- **Mono/Code**: JetBrains Mono

### Scale
- H1: 48px / Bold
- H2: 36px / Bold
- H3: 24px / Semibold
- H4: 20px / Semibold
- Body: 16px / Regular
- Small: 14px / Regular
- Caption: 12px / Medium

### Line Heights
- Headers: 1.2
- Body: 1.6
- UI elements: 1.4

## Design Tokens

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

### Shadows
- Subtle: `0 1px 2px rgba(28, 28, 28, 0.04)`
- Default: `0 4px 12px rgba(28, 28, 28, 0.08)`
- Elevated: `0 8px 24px rgba(28, 28, 28, 0.12)`

## Usage Guidelines

### Color Application
- **Backgrounds**: Use Mist (#fafafa) as primary, Cloud (#ffffff) for cards
- **Text**: Ink (#1c1c1c) for headers, Graphite (#52525b) for body
- **Accent**: Use Teal sparingly — CTAs, key highlights, interactive elements
- **Ratio**: ~90% neutrals, ~10% accent color

### Typography Rules
- Space Grotesk for headlines creates geometric, technical feel
- Inter for body ensures excellent readability
- Limit to 2 font weights per page for cleanliness

### Visual Style
- Generous white space (let elements breathe)
- Subtle geometric patterns if needed (not decorative)
- Clean lines, no gradients unless very subtle
- Icons: outline style, 1.5-2px stroke

## Semantic Colors

- **Success**: `#22c55e` (green)
- **Warning**: `#eab308` (amber)
- **Error**: `#ef4444` (red)
- **Info**: `#3b82f6` (blue)

## Best Used For

Tech company websites, SaaS landing pages, AI/ML product showcases, startup pitches, professional services, consulting firms.

---

## CSS Variables

```css
:root {
  /* Primary */
  --color-ink: #1c1c1c;
  --color-graphite: #52525b;
  --color-stone: #71717a;

  /* Neutral */
  --color-mist: #fafafa;
  --color-cloud: #ffffff;
  --color-fog: #e4e4e7;

  /* Accent */
  --color-teal: #0d9488;
  --color-teal-light: #f0fdfa;
  --color-teal-dark: #0f766e;

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Typography */
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-subtle: 0 1px 2px rgba(28, 28, 28, 0.04);
  --shadow-default: 0 4px 12px rgba(28, 28, 28, 0.08);
  --shadow-elevated: 0 8px 24px rgba(28, 28, 28, 0.12);
}
```

## Tailwind Config (if using)

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: '#1c1c1c',
        graphite: '#52525b',
        stone: '#71717a',
        mist: '#fafafa',
        cloud: '#ffffff',
        fog: '#e4e4e7',
        teal: {
          DEFAULT: '#0d9488',
          light: '#f0fdfa',
          dark: '#0f766e',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```
