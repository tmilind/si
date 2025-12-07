# SourceIntellect Website & Branding Plan

A comprehensive guide for designing website and branding using Claude CLI.

---

## Phase 1: Discovery & Strategy

Before diving into design, complete these foundational steps:

### Brand Identity Questions

Answer these before starting any design work:

1. **What does SourceIntellect do?**
   - Core service/product offering
   - Unique value proposition
   - Key differentiators from competitors

2. **Who is your target audience?**
   - Primary customer profile
   - Industry/sector focus
   - Decision-maker personas

3. **What emotions should your brand evoke?**
   - [ ] Innovative / Cutting-edge
   - [ ] Trustworthy / Reliable
   - [ ] Bold / Disruptive
   - [ ] Sophisticated / Premium
   - [ ] Approachable / Friendly
   - [ ] Technical / Expert
   - [ ] Other: _______________

4. **Visual direction preferences:**
   - Light vs dark theme preference
   - Minimalist vs content-rich
   - Geometric vs organic shapes
   - Formal vs casual tone

### Materials to Gather

- [ ] Existing logos or brand assets (if any)
- [ ] Competitor websites for reference
- [ ] Inspiration websites you admire
- [ ] Website content outline (pages, sections, copy)
- [ ] Photography or imagery assets

---

## Phase 2: Skills to Import

Import these skills into Claude CLI for the project:

### Required Skills

| Skill | Purpose | Path |
|-------|---------|------|
| `frontend-design` | Create distinctive website designs | `/mnt/skills/public/frontend-design` |
| `theme-factory` | Build color/typography design system | `/mnt/skills/examples/theme-factory` |
| `canvas-design` | Create logos and visual assets | `/mnt/skills/examples/canvas-design` |

### Optional Skills

| Skill | Purpose | Path |
|-------|---------|------|
| `brand-guidelines` | Document brand standards | `/mnt/skills/examples/brand-guidelines` |
| `web-artifacts-builder` | Complex React applications | `/mnt/skills/examples/web-artifacts-builder` |
| `skill-creator` | Package reusable brand skill | `/mnt/skills/examples/skill-creator` |
| `pptx` | Brand presentation deck | `/mnt/skills/public/pptx` |
| `docx` | Brand guidelines document | `/mnt/skills/public/docx` |

### How to Import Skills

Copy skill folders to your Claude CLI skills directory, or reference them in your prompts:

```bash
# Reference skill in prompt
claude "Using the frontend-design skill at /mnt/skills/public/frontend-design, create..."

# Or import to your project
cp -r /mnt/skills/examples/theme-factory ./my-skills/
```

---

## Phase 3: Step-by-Step Workflow

### Step 1: Create Design System (Theme)

**Skill:** `theme-factory`

Create a cohesive visual foundation with colors and typography.

#### Prompt Template

```
Using the theme-factory skill, create a custom theme for "SourceIntellect".

Business context:
- Industry: [your industry]
- Target audience: [your audience]
- Brand personality: [e.g., innovative, trustworthy, bold]

Design preferences:
- Tone: [modern/classic/playful/corporate]
- Feel: [warm/cool/neutral]
- Energy: [calm/dynamic/balanced]

Generate a complete design system including:
1. Primary color palette (5-7 colors with hex codes)
2. Typography pairing (heading + body fonts)
3. Accent and semantic colors
4. Usage guidelines
```

#### Expected Output

- Color palette with hex codes
- Font pairing recommendations
- Theme name and description
- Application guidelines

---

### Step 2: Create Logo & Brand Assets

**Skill:** `canvas-design`

Develop visual identity elements.

#### Prompt Template - Logo

```
Using the canvas-design skill, create a logo for SourceIntellect.

About the brand:
- [Brief description of what SourceIntellect does]
- [Key brand attributes: innovative, trustworthy, etc.]

Design direction:
- Style: [wordmark / icon / combination mark / abstract]
- Aesthetic: [geometric / organic / minimal / bold]
- Mood: [describe the feeling you want]

Create 3 distinct logo concepts as PNG files with transparent backgrounds.
Include variations: full color, single color, and reversed (for dark backgrounds).
```

#### Prompt Template - Hero Graphics

```
Using the canvas-design skill, create a hero graphic for SourceIntellect's website.

Apply this design system:
- Primary color: [hex]
- Secondary color: [hex]
- Accent color: [hex]

The graphic should:
- Convey [key message/emotion]
- Work as a website hero background
- Be abstract/illustrative (not stock photo style)

Output as PNG, 1920x1080 pixels.
```

#### Expected Outputs

- [ ] Primary logo (PNG, SVG)
- [ ] Logo variations (dark mode, single color)
- [ ] Favicon (16x16, 32x32, 192x192)
- [ ] Social media profile images
- [ ] Hero graphics/illustrations
- [ ] Pattern or texture assets

---

### Step 3: Document Brand Guidelines

**Skills:** `brand-guidelines`, `docx`

Create comprehensive brand documentation.

#### Prompt Template

```
Create a brand guidelines document for SourceIntellect.

Include these brand assets:
- Logo: [describe or reference file]
- Colors: [list hex codes]
- Fonts: [list font names]

Document should include:
1. Brand overview and mission
2. Logo usage (sizing, spacing, don'ts)
3. Color palette with use cases
4. Typography hierarchy
5. Imagery style guidelines
6. Voice and tone principles

Output as a professional .docx file.
```

---

### Step 4: Design Website Pages

**Skill:** `frontend-design`

Create distinctive, production-ready web pages.

#### Prompt Template - Homepage

```
Using the frontend-design skill, create a landing page for SourceIntellect.

Brand system:
- Primary: [hex]
- Secondary: [hex]
- Accent: [hex]
- Heading font: [font name]
- Body font: [font name]

Page sections:
1. Hero - [tagline/headline]
2. Value proposition - [3-4 key benefits]
3. Features/Services - [list features]
4. Social proof - [testimonials or logos]
5. CTA - [primary action]
6. Footer - [links and contact]

Design requirements:
- Distinctive and memorable (avoid generic AI aesthetics)
- [Light/Dark] theme
- Mobile-responsive
- Smooth animations and micro-interactions

Output as a single HTML file with embedded CSS/JS.
```

#### Prompt Template - About Page

```
Using the frontend-design skill, create an About page for SourceIntellect.

Apply the same brand system as the homepage.

Content sections:
1. Hero with company mission
2. Our story / How we started
3. Team section (placeholder for [X] team members)
4. Values or principles
5. CTA to contact or services

Maintain visual consistency with the homepage design language.
```

#### Prompt Template - Services/Products Page

```
Using the frontend-design skill, create a Services page for SourceIntellect.

Services to feature:
1. [Service 1] - [brief description]
2. [Service 2] - [brief description]
3. [Service 3] - [brief description]

Include:
- Service cards with icons
- Detailed service sections
- Pricing or packages (if applicable)
- FAQ section
- CTA for each service

Apply the established brand system.
```

#### Prompt Template - Contact Page

```
Using the frontend-design skill, create a Contact page for SourceIntellect.

Include:
- Contact form (name, email, message, service interest)
- Company contact information
- Office location with map placeholder
- Social media links
- Business hours (if applicable)

Form should have validation and a polished submission state.
```

---

### Step 5: Build Complex Components (Optional)

**Skill:** `web-artifacts-builder`

For multi-component React applications.

#### When to Use

- Interactive dashboards
- Multi-page SPAs with routing
- Complex state management
- shadcn/ui component library

#### Prompt Template

```
Using the web-artifacts-builder skill, create a [describe component/app].

Requirements:
- [Functional requirements]
- [Technical requirements]

Apply SourceIntellect brand:
- Colors: [hex codes]
- Fonts: [font names]

Use shadcn/ui components for: [buttons, forms, cards, etc.]

Bundle as a single HTML file for artifact display.
```

---

### Step 6: Create Reusable Brand Skill

**Skill:** `skill-creator`

Package everything for consistent future use.

#### Prompt Template

```
Using the skill-creator skill, create a custom skill called "sourceintellect-brand".

The skill should include:

assets/
- logo.png (primary logo)
- logo-dark.png (dark mode variant)
- favicon.ico
- og-image.png (social sharing)

references/
- brand-guidelines.md (colors, fonts, usage rules)
- copy-guidelines.md (voice, tone, messaging)

SKILL.md should:
- Describe when to use this skill
- Reference the brand colors: [list hex codes]
- Reference the fonts: [list fonts]
- Include code snippets for applying brand styles

Package as a .skill file for distribution.
```

#### Expected Skill Structure

```
sourceintellect-brand/
├── SKILL.md
├── assets/
│   ├── logo.png
│   ├── logo-dark.png
│   ├── logo-icon.png
│   ├── favicon.ico
│   └── fonts/
│       ├── heading-font.woff2
│       └── body-font.woff2
├── references/
│   ├── brand-guidelines.md
│   ├── color-system.md
│   └── typography.md
└── templates/
    ├── page-template.html
    └── component-template.jsx
```

---

## Phase 4: Deliverables Checklist

Track your progress:

### Brand Identity

- [ ] Brand strategy document
- [ ] Color palette (hex codes)
- [ ] Typography system
- [ ] Custom theme created

### Logo & Assets

- [ ] Primary logo (PNG + SVG)
- [ ] Logo dark variant
- [ ] Logo icon only
- [ ] Favicon set
- [ ] Social media images
- [ ] Hero graphics

### Documentation

- [ ] Brand guidelines document
- [ ] Style guide
- [ ] Component library docs

### Website Pages

- [ ] Homepage
- [ ] About page
- [ ] Services/Products page
- [ ] Contact page
- [ ] Blog/Resources page (if needed)
- [ ] 404 page

### Technical

- [ ] Responsive design verified
- [ ] Performance optimized
- [ ] Accessibility checked
- [ ] Cross-browser tested

### Packaged Assets

- [ ] Reusable brand skill (.skill file)
- [ ] Design system exports
- [ ] Source files organized

---

## Quick Reference: Claude CLI Commands

### Theme Creation

```bash
claude "Using theme-factory, create a 'Tech Innovation' theme for SourceIntellect 
with deep blue primary, electric accent, and modern sans-serif typography."
```

### Logo Generation

```bash
claude "Using canvas-design, create a minimal geometric logo for SourceIntellect. 
The logo should convey intelligence and innovation. Output 3 concepts as PNG."
```

### Homepage Design

```bash
claude "Using frontend-design, create a dark-themed landing page for SourceIntellect. 
Colors: #0A1628 (bg), #3B82F6 (primary), #10B981 (accent). 
Include: hero, features grid, testimonials, CTA. Make it distinctive and memorable."
```

### Brand Guidelines Doc

```bash
claude "Using the docx skill, create a brand guidelines document for SourceIntellect 
with our logo, colors (#0A1628, #3B82F6, #10B981), and Inter/Poppins fonts."
```

### Package Brand Skill

```bash
claude "Using skill-creator, package the SourceIntellect brand assets and guidelines 
into a reusable .skill file."
```

---

## Tips for Best Results

1. **Be specific about aesthetics** - "Bold geometric minimal" is better than "nice looking"

2. **Provide context** - Industry, audience, and competitors help Claude make informed choices

3. **Iterate** - First outputs are starting points; refine with follow-up prompts

4. **Reference previous outputs** - "Apply the same style as the homepage" maintains consistency

5. **Ask for variations** - "Create 3 different approaches" gives you options

6. **Specify what to avoid** - "No purple gradients, no generic stock photo style"

---

## Next Steps

1. Complete the Discovery & Strategy section above
2. Import required skills to Claude CLI
3. Start with Step 1 (Design System)
4. Work through each step sequentially
5. Package final assets into reusable brand skill

---

*Generated for SourceIntellect branding project*
