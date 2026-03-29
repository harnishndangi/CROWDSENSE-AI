# JSON-UI Style Guide — Editorial Brutalism
> Derived from visual analysis of CAF Construction design system
> Theme: Editorial Brutalism | Version: 1.0.0

---

## Table of Contents

1. [Design Philosophy
](#1-design-philosophy)
2. [Color Palette
](#2-color-palette)
3. [Typography
](#3-typography)
4. [Spacing & Layout
](#4-spacing--layout)
5. [Grid System
](#5-grid-system)
6. [Border & Stroke System
](#6-border--stroke-system)
7. [Component Definitions
](#7-component-definitions)
   - 7.1 Navigation
   - 7.2 Hero Section
   - 7.3 Section Labels
   - 7.4 Headings
   - 7.5 Buttons & CTAs
   - 7.6 Service Cards
   - 7.7 Project Cards
   - 7.8 Stats / Metric Blocks
   - 7.9 Image Blocks
   - 7.10 Footer
8. [Interactive States
](#8-interactive-states)
9. [Motion & Animation
](#9-motion--animation)
10. [Responsive Breakpoints
](#10-responsive-breakpoints)
11. [Iconography
](#11-iconography)
12. [Accessibility
](#12-accessibility)
13. [Full Composite Token Map
](#13-full-composite-token-map)

---

## 1. Design Philosophy

Editorial Brutalism is the collision of **print editorial design** and **digital brutalist aesthetics**. It is unapologetic, raw, and bold. Every decision serves legibility, hierarchy, and visual weight — never decoration.

### Core Principles

```json
{
    "philosophy": {
        "name": "Editorial Brutalism",
        "principles": [
            {
                "id": "raw-typography",
                "rule": "Type is architecture. Oversized, heavy, unapologetic. Headlines must dominate the viewport."
            },
            {
                "id": "restricted-palette",
                "rule": "Three colors maximum: near-black, pure white, and ONE punch accent (yellow/amber). No gradients. No shadows."
            },
            {
                "id": "exposed-structure",
                "rule": "Borders, dividers, and grid lines are visible. The skeleton shows. Nothing is hidden."
            },
            {
                "id": "industrial-imagery",
                "rule": "Photography is full-bleed, high-contrast, and contextually raw. Never decorative stock imagery."
            },
            {
                "id": "utilitarian-components",
                "rule": "Buttons look like buttons. Inputs look like inputs. Zero ambiguity."
            },
            {
                "id": "editorial-layout",
                "rule": "Asymmetric compositions. Overlapping layers. Intentional whitespace. Sections alternate black and white."
            },
            {
                "id": "label-hierarchy",
                "rule": "Every section has a small-caps overline label before its heading. Always. No exceptions."
            },
            {
                "id": "monospace-metadata",
                "rule": "Use monospace or condensed fonts for small metadata, labels, phone numbers, and tags."
            }
        ]
    }
}
```

---

## 2. Color Palette

### 2.1 Core Color Tokens

```json
{
    "colors": {
        "black": {
            "pure": "#0A0A0A",
            "rich": "#111111",
            "soft": "#1A1A1A",
            "token": "--color-black"
        },
        "white": {
            "pure": "#FFFFFF",
            "off": "#F7F7F5",
            "warm": "#F2F0EC",
            "token": "--color-white"
        },
        "accent": {
            "yellow": {
                "primary": "#F5C518",
                "bright": "#FFD12A",
                "dark": "#D4A800",
                "token": "--color-accent"
            }
        },
        "neutral": {
            "100": "#F5F5F5",
            "200": "#E8E8E8",
            "300": "#CCCCCC",
            "400": "#999999",
            "500": "#666666",
            "600": "#444444",
            "700": "#2A2A2A",
            "800": "#1A1A1A",
            "token-prefix": "--color-neutral-"
        }
    }
}
```

### 2.2 Semantic Color Roles

```json
{
    "semantic": {
        "background": {
            "page": {
                "value": "#FFFFFF",
                "token": "--bg-page"
            },
            "section-alt": {
                "value": "#0A0A0A",
                "token": "--bg-section-alt"
            },
            "card-light": {
                "value": "#F7F7F5",
                "token": "--bg-card-light"
            },
            "card-dark": {
                "value": "#111111",
                "token": "--bg-card-dark"
            },
            "card-accent": {
                "value": "#F5C518",
                "token": "--bg-card-accent"
            },
            "nav": {
                "value": "#0A0A0A",
                "token": "--bg-nav"
            },
            "overlay": {
                "value": "rgba(10,10,10,0.72)",
                "token": "--bg-overlay"
            }
        },
        "text": {
            "primary": {
                "value": "#0A0A0A",
                "token": "--text-primary"
            },
            "secondary": {
                "value": "#444444",
                "token": "--text-secondary"
            },
            "muted": {
                "value": "#777777",
                "token": "--text-muted"
            },
            "on-dark": {
                "value": "#FFFFFF",
                "token": "--text-on-dark"
            },
            "on-accent": {
                "value": "#0A0A0A",
                "token": "--text-on-accent"
            },
            "label": {
                "value": "#999999",
                "token": "--text-label"
            }
        },
        "border": {
            "default": {
                "value": "#0A0A0A",
                "token": "--border-default"
            },
            "light": {
                "value": "#E8E8E8",
                "token": "--border-light"
            },
            "on-dark": {
                "value": "#333333",
                "token": "--border-on-dark"
            },
            "accent": {
                "value": "#F5C518",
                "token": "--border-accent"
            }
        },
        "interactive": {
            "cta-bg": {
                "value": "#F5C518",
                "token": "--cta-bg"
            },
            "cta-text": {
                "value": "#0A0A0A",
                "token": "--cta-text"
            },
            "cta-hover-bg": {
                "value": "#0A0A0A",
                "token": "--cta-hover-bg"
            },
            "cta-hover-text": {
                "value": "#FFFFFF",
                "token": "--cta-hover-text"
            },
            "link": {
                "value": "#0A0A0A",
                "token": "--link"
            },
            "link-hover": {
                "value": "#F5C518",
                "token": "--link-hover"
            }
        }
    }
}
```

### 2.3 Color Usage Rules

```json
{
    "color-rules": [
        "Never use more than 3 colors per section: black, white, and accent yellow",
        "Alternate section backgrounds: white section → black section → white section",
        "Accent yellow is ONLY used for: primary CTA buttons, active nav state, and card-accent variant",
        "Photography sits on black backgrounds when overlaid with text",
        "Never use drop shadows — use solid offset borders for depth instead",
        "No gradients of any kind anywhere in the system",
        "Service card variants: [border-only on white], [filled black], [filled accent-yellow]"
    ]
}
```

---

## 3. Typography

### 3.1 Font Stack

```json
{
    "fonts": {
        "display": {
            "family": "\"Bebas Neue\", \"Anton\", \"Impact\", sans-serif",
            "token": "--font-display",
            "usage": "Hero headlines, section titles, large numerals",
            "fallback-characteristic": "Tall, condensed, ultra-heavy"
        },
        "heading": {
            "family": "\"Barlow\", \"DM Sans\", \"Helvetica Neue\", sans-serif",
            "weight-range": "600–800",
            "token": "--font-heading",
            "usage": "H2, H3, card titles, nav links"
        },
        "body": {
            "family": "\"Barlow\", \"Inter\", \"Helvetica Neue\", sans-serif",
            "weight-range": "400–500",
            "token": "--font-body",
            "usage": "Paragraph text, descriptions, card body"
        },
        "mono": {
            "family": "\"JetBrains Mono\", \"IBM Plex Mono\", \"Courier New\", monospace",
            "token": "--font-mono",
            "usage": "Phone numbers, labels, section overlines, metadata tags"
        },
        "condensed": {
            "family": "\"Barlow Condensed\", \"Roboto Condensed\", sans-serif",
            "weight-range": "500–700",
            "token": "--font-condensed",
            "usage": "Navigation items, button text, stat labels"
        }
    }
}
```

### 3.2 Type Scale

```json
{
    "type-scale": {
        "display-hero": {
            "token": "--text-display-hero",
            "size": "clamp(56px, 8vw, 120px)",
            "line-height": "0.92",
            "letter-spacing": "-0.02em",
            "weight": "900",
            "font": "var(--font-display)",
            "transform": "none",
            "usage": "Hero headline — e.g. 'Building Dreams Into Reality'"
        },
        "display-xl": {
            "token": "--text-display-xl",
            "size": "clamp(40px, 5vw, 80px)",
            "line-height": "1.0",
            "letter-spacing": "-0.015em",
            "weight": "800",
            "font": "var(--font-heading)",
            "usage": "Section titles — e.g. 'Take A Look At Our Latest Projects'"
        },
        "display-lg": {
            "token": "--text-display-lg",
            "size": "clamp(32px, 4vw, 56px)",
            "line-height": "1.05",
            "letter-spacing": "-0.01em",
            "weight": "700",
            "font": "var(--font-heading)",
            "usage": "Sub-section headings, About headlines"
        },
        "heading-md": {
            "token": "--text-heading-md",
            "size": "clamp(20px, 2.5vw, 28px)",
            "line-height": "1.2",
            "letter-spacing": "-0.005em",
            "weight": "700",
            "font": "var(--font-heading)",
            "usage": "Card titles, project names"
        },
        "heading-sm": {
            "token": "--text-heading-sm",
            "size": "18px",
            "line-height": "1.3",
            "letter-spacing": "0",
            "weight": "600",
            "font": "var(--font-heading)",
            "usage": "Service card titles, small section headings"
        },
        "body-lg": {
            "token": "--text-body-lg",
            "size": "16px",
            "line-height": "1.6",
            "letter-spacing": "0.01em",
            "weight": "400",
            "font": "var(--font-body)",
            "usage": "About section body text, card descriptions"
        },
        "body-md": {
            "token": "--text-body-md",
            "size": "14px",
            "line-height": "1.5",
            "letter-spacing": "0.01em",
            "weight": "400",
            "font": "var(--font-body)",
            "usage": "Card body copy, supporting text"
        },
        "body-sm": {
            "token": "--text-body-sm",
            "size": "12px",
            "line-height": "1.5",
            "letter-spacing": "0.02em",
            "weight": "400",
            "font": "var(--font-body)",
            "usage": "Fine print, footer text"
        },
        "label-overline": {
            "token": "--text-label-overline",
            "size": "11px",
            "line-height": "1.4",
            "letter-spacing": "0.18em",
            "weight": "600",
            "font": "var(--font-condensed)",
            "transform": "uppercase",
            "usage": "Section label chips — e.g. '— OUR SERVICE', '— ABOUT US'"
        },
        "stat-number": {
            "token": "--text-stat-number",
            "size": "clamp(36px, 4vw, 56px)",
            "line-height": "1.0",
            "letter-spacing": "-0.02em",
            "weight": "800",
            "font": "var(--font-heading)",
            "usage": "400+, 11+, 90+, 100% stat blocks"
        },
        "stat-label": {
            "token": "--text-stat-label",
            "size": "12px",
            "line-height": "1.4",
            "letter-spacing": "0.04em",
            "weight": "500",
            "font": "var(--font-condensed)",
            "transform": "none",
            "usage": "Stat descriptors — 'Successful project', 'Years of experience'"
        },
        "nav-link": {
            "token": "--text-nav-link",
            "size": "14px",
            "line-height": "1",
            "letter-spacing": "0.04em",
            "weight": "500",
            "font": "var(--font-condensed)",
            "usage": "Navigation items"
        },
        "button": {
            "token": "--text-button",
            "size": "13px",
            "line-height": "1",
            "letter-spacing": "0.06em",
            "weight": "700",
            "font": "var(--font-condensed)",
            "transform": "uppercase",
            "usage": "CTA and action buttons"
        },
        "meta": {
            "token": "--text-meta",
            "size": "12px",
            "line-height": "1.4",
            "letter-spacing": "0.08em",
            "weight": "400",
            "font": "var(--font-mono)",
            "usage": "Phone numbers, dates, metadata"
        }
    }
}
```

---

## 4. Spacing & Layout

### 4.1 Base Spacing Scale

```json
{
    "spacing": {
        "base-unit": "8px",
        "scale": {
            "0": {
                "value": "0px",
                "token": "--space-0"
            },
            "1": {
                "value": "4px",
                "token": "--space-1"
            },
            "2": {
                "value": "8px",
                "token": "--space-2"
            },
            "3": {
                "value": "12px",
                "token": "--space-3"
            },
            "4": {
                "value": "16px",
                "token": "--space-4"
            },
            "5": {
                "value": "20px",
                "token": "--space-5"
            },
            "6": {
                "value": "24px",
                "token": "--space-6"
            },
            "8": {
                "value": "32px",
                "token": "--space-8"
            },
            "10": {
                "value": "40px",
                "token": "--space-10"
            },
            "12": {
                "value": "48px",
                "token": "--space-12"
            },
            "16": {
                "value": "64px",
                "token": "--space-16"
            },
            "20": {
                "value": "80px",
                "token": "--space-20"
            },
            "24": {
                "value": "96px",
                "token": "--space-24"
            },
            "32": {
                "value": "128px",
                "token": "--space-32"
            },
            "40": {
                "value": "160px",
                "token": "--space-40"
            }
        }
    }
}
```

### 4.2 Semantic Spacing Roles

```json
{
    "spacing-roles": {
        "section-padding-y": {
            "value": "clamp(64px, 8vw, 128px)",
            "token": "--section-padding-y"
        },
        "section-padding-x": {
            "value": "clamp(24px, 6vw, 96px)",
            "token": "--section-padding-x"
        },
        "container-max-width": {
            "value": "1280px",
            "token": "--container-max"
        },
        "container-padding": {
            "value": "clamp(20px, 5vw, 80px)",
            "token": "--container-padding"
        },
        "card-padding": {
            "value": "24px",
            "token": "--card-padding"
        },
        "card-gap": {
            "value": "2px",
            "token": "--card-gap"
        },
        "nav-height": {
            "value": "72px",
            "token": "--nav-height"
        },
        "hero-min-height": {
            "value": "90vh",
            "token": "--hero-min-height"
        },
        "overline-gap": {
            "value": "16px",
            "token": "--overline-gap"
        },
        "heading-body-gap": {
            "value": "24px",
            "token": "--heading-body-gap"
        }
    }
}
```

---

## 5. Grid System

```json
{
    "grid": {
        "columns": 12,
        "gutter": "2px",
        "margin": "var(--container-padding)",
        "note": "Gutter is deliberately tight (2px) to create the dense, newspaper-grid feel",
        "breakpoints": {
            "mobile": {
                "columns": 4,
                "gutter": "0px"
            },
            "tablet": {
                "columns": 8,
                "gutter": "2px"
            },
            "desktop": {
                "columns": 12,
                "gutter": "2px"
            }
        },
        "named-layouts": {
            "hero": {
                "description": "Full bleed, image fills right 60%, text overlays left 50%",
                "type": "overlap",
                "image-col": "span 12",
                "text-col": "col 1 / span 7"
            },
            "services-3col": {
                "description": "Three service cards equal width, no gutter — tight grid",
                "col-span": 4
            },
            "projects-3col": {
                "description": "Three project cards in dark section",
                "col-span": 4,
                "row-gap": "2px"
            },
            "about-split": {
                "description": "Left: heading text, Right: image + stats",
                "left-col": "span 5",
                "right-col": "span 7"
            },
            "stats-4col": {
                "description": "Four equal stat blocks",
                "col-span": 3
            }
        }
    }
}
```

---

## 6. Border & Stroke System

```json
{
    "borders": {
        "widths": {
            "hairline": {
                "value": "1px",
                "token": "--border-hairline"
            },
            "default": {
                "value": "2px",
                "token": "--border-default-width"
            },
            "thick": {
                "value": "3px",
                "token": "--border-thick"
            },
            "heavy": {
                "value": "4px",
                "token": "--border-heavy"
            }
        },
        "radius": {
            "none": {
                "value": "0px",
                "token": "--radius-none"
            },
            "sm": {
                "value": "2px",
                "token": "--radius-sm"
            },
            "pill": {
                "value": "999px",
                "token": "--radius-pill"
            },
            "note": "Editorial Brutalism uses 0 radius by default. Pill radius is reserved ONLY for CTA arrow buttons."
        },
        "styles": {
            "card-default": "1px solid var(--border-default)",
            "card-dark": "1px solid var(--border-on-dark)",
            "divider-light": "1px solid var(--border-light)",
            "divider-dark": "1px solid #2A2A2A",
            "section-label": "none — use horizontal line element instead",
            "cta-button": "2px solid var(--color-black)",
            "overline-rule": "2px solid var(--color-black)"
        },
        "shadow-policy": "FORBIDDEN. No box-shadow or drop-shadow anywhere in the system. Use solid-color offset borders for emphasis instead.",
        "offset-border": {
            "description": "Brutalist depth effect using outline offset instead of shadow",
            "css": "outline: 2px solid var(--color-black); outline-offset: 4px;"
        }
    }
}
```

---

## 7. Component Definitions

### 7.1 Navigation

```json
{
    "component": "navigation",
    "variant": "fixed-top-brutalist",
    "tokens": {
        "height": "var(--nav-height)",
        "bg": "var(--bg-nav)",
        "border-bottom": "none",
        "padding-x": "var(--container-padding)"
    },
    "logo": {
        "style": "bold-wordmark",
        "font": "var(--font-display)",
        "size": "28px",
        "color": "var(--text-on-dark)",
        "note": "Logo uses a custom blocky wordmark — uppercase, no border"
    },
    "nav-links": {
        "font": "var(--text-nav-link)",
        "color": "var(--text-on-dark)",
        "hover-color": "var(--color-accent)",
        "gap": "32px",
        "items": [
            "Home",
            "About",
            "Work",
            "News",
            "Contact"
        ]
    },
    "cta-button": {
        "text": "Phone number",
        "font": "var(--text-meta)",
        "bg": "var(--bg-card-accent)",
        "color": "var(--text-on-accent)",
        "padding": "10px 16px",
        "radius": "0px",
        "border": "none"
    },
    "layout": "flex — logo left, links center, cta right"
}
```

### 7.2 Hero Section

```json
{
    "component": "hero",
    "variant": "full-bleed-overlap",
    "tokens": {
        "bg": "var(--bg-section-alt)",
        "min-height": "var(--hero-min-height)",
        "padding-x": "var(--container-padding)",
        "padding-top": "calc(var(--nav-height) + 48px)"
    },
    "image": {
        "position": "absolute right 0, bottom 0",
        "width": "65%",
        "height": "100%",
        "object-fit": "cover",
        "blend-mode": "normal",
        "note": "Product/vehicle image sits on dark bg with no container — appears to float"
    },
    "headline": {
        "text-example": "Building Dreams\nInto Reality",
        "font": "var(--text-display-hero)",
        "color": "var(--text-on-dark)",
        "max-width": "600px",
        "position": "relative z-index:2",
        "word-break": "normal — let it wrap naturally",
        "margin-bottom": "40px"
    },
    "cta-button": {
        "variant": "arrow-pill-accent",
        "icon": "↗ diagonal arrow",
        "shape": "circle / pill",
        "bg": "var(--bg-card-accent)",
        "color": "var(--text-on-accent)",
        "size": "64px × 64px",
        "font-size": "24px",
        "radius": "var(--radius-pill)",
        "hover-bg": "var(--color-white)",
        "hover-color": "var(--color-black)"
    },
    "background-texture": {
        "type": "solid dark",
        "value": "var(--bg-section-alt)",
        "note": "No grain, no gradient — pure black bg with product image"
    }
}
```

### 7.3 Section Labels (Overlines)

```json
{
    "component": "section-label",
    "description": "Appears above every section heading. Pattern: em-dash + space + label text",
    "structure": {
        "rule": {
            "type": "horizontal line",
            "width": "24px",
            "border": "2px solid var(--border-default)",
            "display": "inline-block",
            "vertical-align": "middle",
            "margin-right": "8px"
        },
        "text": {
            "content-example": "OUR SERVICE",
            "font": "var(--text-label-overline)",
            "color": "var(--text-label)",
            "display": "inline"
        }
    },
    "margin-bottom": "16px",
    "examples": [
        "— OUR SERVICE",
        "— ABOUT US",
        "— RECENT WORK"
    ]
}
```

### 7.4 Section Headings

```json
{
    "component": "section-heading",
    "variants": {
        "light-bg": {
            "font": "var(--text-display-xl)",
            "color": "var(--text-primary)",
            "max-width": "640px",
            "margin-bottom": "var(--space-16)"
        },
        "dark-bg": {
            "font": "var(--text-display-xl)",
            "color": "var(--text-on-dark)",
            "max-width": "640px",
            "margin-bottom": "var(--space-16)"
        }
    },
    "divider-rule": {
        "display": "block",
        "width": "100%",
        "border-top": "1px solid var(--border-light)",
        "margin-top": "var(--space-8)",
        "margin-bottom": "var(--space-16)"
    }
}
```

### 7.5 Buttons & CTAs

```json
{
    "component": "button",
    "variants": {
        "primary": {
            "text": "GET A QUOTE",
            "font": "var(--text-button)",
            "bg": "var(--color-black)",
            "color": "var(--text-on-dark)",
            "padding": "14px 24px",
            "radius": "0px",
            "border": "2px solid var(--color-black)",
            "hover-bg": "var(--color-accent)",
            "hover-color": "var(--color-black)",
            "hover-border": "2px solid var(--color-accent)",
            "transition": "background 0.2s ease, color 0.2s ease"
        },
        "ghost": {
            "text": "LEARN MORE",
            "font": "var(--text-button)",
            "bg": "transparent",
            "color": "var(--text-primary)",
            "padding": "14px 24px",
            "radius": "0px",
            "border": "2px solid var(--color-black)",
            "hover-bg": "var(--color-black)",
            "hover-color": "var(--text-on-dark)"
        },
        "accent": {
            "text": "GET A QUOTE →",
            "font": "var(--text-button)",
            "bg": "var(--color-accent)",
            "color": "var(--text-on-accent)",
            "padding": "12px 20px",
            "radius": "0px",
            "border": "none",
            "icon": "→",
            "icon-position": "right",
            "hover-bg": "var(--color-black)",
            "hover-color": "var(--text-on-dark)"
        },
        "arrow-circle": {
            "description": "Hero CTA — round yellow button with diagonal arrow",
            "bg": "var(--color-accent)",
            "color": "var(--text-on-accent)",
            "width": "64px",
            "height": "64px",
            "radius": "50%",
            "icon": "↗",
            "font-size": "24px",
            "border": "none",
            "hover-bg": "var(--color-white)",
            "hover-color": "var(--color-black)",
            "hover-transform": "rotate(45deg)",
            "transition": "transform 0.25s ease, background 0.2s ease"
        }
    }
}
```

### 7.6 Service Cards

```json
{
    "component": "service-card",
    "grid": "3-column tight grid, 2px gap",
    "variants": {
        "outlined": {
            "description": "White card with black border — default",
            "bg": "var(--bg-page)",
            "border": "1px solid var(--border-default)",
            "color": "var(--text-primary)",
            "padding": "32px 24px",
            "radius": "0px"
        },
        "filled-dark": {
            "description": "Black filled card — mid card in 3-col layout",
            "bg": "var(--bg-card-dark)",
            "border": "none",
            "color": "var(--text-on-dark)",
            "padding": "32px 24px",
            "radius": "0px"
        },
        "filled-accent": {
            "description": "Yellow accent card — emphasis card, last in group",
            "bg": "var(--bg-card-accent)",
            "border": "none",
            "color": "var(--text-on-accent)",
            "padding": "32px 24px",
            "radius": "0px"
        }
    },
    "icon": {
        "style": "outlined mono icon — 2px stroke, geometric",
        "size": "40px",
        "margin-bottom": "24px",
        "color": "inherit"
    },
    "title": {
        "font": "var(--text-heading-sm)",
        "color": "inherit",
        "margin-bottom": "12px"
    },
    "body": {
        "font": "var(--text-body-md)",
        "color": "inherit",
        "opacity": "0.75"
    }
}
```

### 7.7 Project Cards

```json
{
    "component": "project-card",
    "section-bg": "var(--bg-section-alt)",
    "grid": "3-column, 2px gap, 2 rows",
    "card": {
        "bg": "var(--bg-card-dark)",
        "border": "1px solid var(--border-on-dark)",
        "radius": "0px",
        "overflow": "hidden"
    },
    "image": {
        "width": "100%",
        "aspect-ratio": "4/3",
        "object-fit": "cover",
        "filter": "none",
        "hover-filter": "brightness(1.1)"
    },
    "content": {
        "padding": "20px 20px 16px"
    },
    "title": {
        "font": "var(--text-heading-sm)",
        "color": "var(--text-on-dark)",
        "margin-bottom": "8px"
    },
    "description": {
        "font": "var(--text-body-sm)",
        "color": "var(--text-muted)",
        "line-clamp": 2
    },
    "cta": {
        "variant": "accent",
        "text": "Get A Quote →",
        "margin-top": "16px"
    }
}
```

### 7.8 Stats / Metric Blocks

```json
{
    "component": "stats-block",
    "layout": "4-column horizontal row",
    "divider": "1px solid var(--border-light) between each stat",
    "section-bg": "var(--bg-page)",
    "stat": {
        "number": {
            "font": "var(--text-stat-number)",
            "color": "var(--text-primary)",
            "suffix-style": "same size, same weight — e.g. '400+'"
        },
        "label": {
            "font": "var(--text-stat-label)",
            "color": "var(--text-muted)",
            "margin-top": "6px"
        }
    },
    "examples": [
        {
            "number": "400+",
            "label": "Successful project"
        },
        {
            "number": "11+",
            "label": "Years of experience"
        },
        {
            "number": "90+",
            "label": "Happy clients"
        },
        {
            "number": "100%",
            "label": "Client satisfaction"
        }
    ]
}
```

### 7.9 Image Blocks (About Section)

```json
{
    "component": "image-block",
    "variants": {
        "full-bleed-section": {
            "width": "100%",
            "max-height": "480px",
            "object-fit": "cover",
            "radius": "0px",
            "border": "none",
            "margin-bottom": "var(--space-8)"
        }
    },
    "caption": {
        "font": "var(--text-body-sm)",
        "color": "var(--text-muted)",
        "display": "none by default"
    }
}
```

### 7.10 Footer

```json
{
    "component": "footer",
    "bg": "var(--bg-section-alt)",
    "color": "var(--text-on-dark)",
    "padding": "64px var(--container-padding) 32px",
    "border-top": "1px solid var(--border-on-dark)",
    "columns": {
        "brand": {
            "logo": "wordmark",
            "tagline": "short brand descriptor",
            "col-span": 3
        },
        "links": {
            "font": "var(--text-body-sm)",
            "color": "var(--text-on-dark)",
            "gap": "12px",
            "col-span": 2
        },
        "contact": {
            "font": "var(--text-meta)",
            "color": "var(--text-muted)",
            "col-span": 3
        }
    },
    "bottom-bar": {
        "border-top": "1px solid var(--border-on-dark)",
        "padding-top": "24px",
        "font": "var(--text-body-sm)",
        "color": "var(--text-muted)",
        "layout": "flex space-between"
    }
}
```

---

## 8. Interactive States

```json
{
    "interactive-states": {
        "hover": {
            "cards": "border-color transitions to accent yellow; image scale 1.03",
            "buttons": "bg/color inversion or accent fill — 0.2s ease",
            "nav-links": "color: var(--color-accent)",
            "project-cards": "image brightness +10%",
            "transition-default": "all 0.2s ease"
        },
        "focus": {
            "outline": "2px solid var(--color-accent)",
            "outline-offset": "3px",
            "note": "Always visible — never removed. Accessibility first."
        },
        "active": {
            "button": "scale(0.97) — subtle press",
            "transition": "transform 0.1s ease"
        },
        "disabled": {
            "opacity": "0.4",
            "cursor": "not-allowed",
            "pointer-events": "none"
        },
        "loading": {
            "style": "border-shimmer animation on skeleton blocks",
            "color-from": "var(--neutral-200)",
            "color-to": "var(--neutral-100)",
            "duration": "1.4s infinite"
        }
    }
}
```

---

## 9. Motion & Animation

```json
{
    "motion": {
        "philosophy": "Functional motion only. No decorative animations. Every movement serves hierarchy or feedback.",
        "duration": {
            "instant": "100ms",
            "fast": "200ms",
            "base": "300ms",
            "slow": "500ms",
            "page": "600ms"
        },
        "easing": {
            "default": "cubic-bezier(0.25, 0, 0.1, 1)",
            "enter": "cubic-bezier(0, 0, 0.2, 1)",
            "exit": "cubic-bezier(0.4, 0, 1, 1)",
            "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)"
        },
        "patterns": {
            "section-enter": {
                "type": "translate + fade",
                "from": "translateY(32px) opacity(0)",
                "to": "translateY(0) opacity(1)",
                "trigger": "IntersectionObserver — threshold 0.15",
                "duration": "500ms",
                "stagger": "80ms per child element"
            },
            "hero-headline": {
                "type": "clip reveal",
                "from": "clip-path: inset(0 100% 0 0)",
                "to": "clip-path: inset(0 0% 0 0)",
                "duration": "700ms",
                "easing": "var(--easing-enter)"
            },
            "counter-roll": {
                "description": "Stat numbers count up on scroll entry",
                "type": "JS counter animation",
                "duration": "1200ms",
                "easing": "easeOutQuart"
            },
            "card-hover": {
                "image-scale": "transform: scale(1.04)",
                "duration": "400ms",
                "easing": "var(--easing-default)"
            },
            "button-arrow-rotate": {
                "description": "Arrow icon in CTA buttons rotates 45° on hover",
                "transform": "rotate(45deg)",
                "duration": "250ms"
            }
        },
        "prefers-reduced-motion": {
            "rule": "All animations wrapped in @media (prefers-reduced-motion: no-preference)",
            "fallback": "Instant opacity-only transitions"
        }
    }
}
```

---

## 10. Responsive Breakpoints

```json
{
    "breakpoints": {
        "xs": {
            "min": "0px",
            "max": "479px",
            "token": "--bp-xs",
            "label": "Mobile S"
        },
        "sm": {
            "min": "480px",
            "max": "767px",
            "token": "--bp-sm",
            "label": "Mobile L"
        },
        "md": {
            "min": "768px",
            "max": "1023px",
            "token": "--bp-md",
            "label": "Tablet"
        },
        "lg": {
            "min": "1024px",
            "max": "1279px",
            "token": "--bp-lg",
            "label": "Desktop S"
        },
        "xl": {
            "min": "1280px",
            "max": "1535px",
            "token": "--bp-xl",
            "label": "Desktop L"
        },
        "2xl": {
            "min": "1536px",
            "max": "∞",
            "token": "--bp-2xl",
            "label": "Wide"
        }
    },
    "responsive-rules": {
        "hero": {
            "mobile": "Stack vertically. Image above. Text below with smaller display font.",
            "tablet": "Side by side with overlap removed.",
            "desktop": "Full overlap composition as designed."
        },
        "services-grid": {
            "mobile": "1 column",
            "tablet": "2 columns",
            "desktop": "3 columns"
        },
        "projects-grid": {
            "mobile": "1 column",
            "tablet": "2 columns",
            "desktop": "3 columns"
        },
        "stats-row": {
            "mobile": "2×2 grid",
            "tablet": "4 columns inline",
            "desktop": "4 columns inline"
        },
        "nav": {
            "mobile": "Hamburger menu — links hidden, logo + hamburger icon visible",
            "tablet": "Condensed links",
            "desktop": "Full horizontal nav"
        },
        "typography-scaling": "All display sizes use clamp() — fluid between mobile and desktop"
    }
}
```

---

## 11. Iconography

```json
{
    "iconography": {
        "style": "Outlined geometric — 2px stroke, no fill, 90° corners preferred",
        "size-sm": "20px",
        "size-md": "32px",
        "size-lg": "48px",
        "color": "currentColor — inherits from parent",
        "library": "Custom SVG preferred. Lucide or Phosphor as fallback (outlined variant only)",
        "service-icons": {
            "new-construction": "Brick wall grid icon",
            "commercial-construction": "Bar chart / building icon",
            "renovation-remodeling": "Cube / box 3D icon"
        },
        "ui-icons": {
            "arrow-diagonal": "↗ — used in hero CTA circle",
            "arrow-right": "→ — used in card CTAs",
            "hamburger": "≡ — mobile nav",
            "close": "× — modal / drawer close"
        },
        "forbidden": [
            "Filled solid icons",
            "Rounded or bubbly icon styles",
            "Emoji as icons",
            "Colorful multi-tone icons"
        ]
    }
}
```

---

## 12. Accessibility

```json
{
    "accessibility": {
        "wcag-target": "AA minimum, AAA for body text",
        "contrast-ratios": {
            "black-on-white": "21:1 ✅",
            "black-on-yellow": "8.59:1 ✅",
            "white-on-black": "21:1 ✅",
            "grey-on-white": "check --text-muted (#777) = 4.48:1 ✅",
            "warning": "Never put muted grey text on off-white backgrounds without contrast check"
        },
        "focus-visible": {
            "style": "2px solid var(--color-accent)",
            "offset": "3px",
            "rule": "NEVER use outline: none without a custom visible replacement"
        },
        "motion": "Respect prefers-reduced-motion — wrap all animations",
        "alt-text": "All construction/project images require descriptive alt text",
        "semantic-html": [
            "Use <nav> for navigation",
            "Use <main> for primary content",
            "Use <section> with aria-label for each named section",
            "Use <h1>→<h6> in strict document order — no skipping levels",
            "Use <button> for interactive actions, <a> for navigation"
        ],
        "color-independence": "Never convey meaning through color alone — pair with text or icon"
    }
}
```

---

## 13. Full Composite Token Map

```json
{
    "tokens": {
        "color": {
            "--color-black": "#0A0A0A",
            "--color-white": "#FFFFFF",
            "--color-accent": "#F5C518",
            "--color-accent-dark": "#D4A800",
            "--color-neutral-100": "#F5F5F5",
            "--color-neutral-200": "#E8E8E8",
            "--color-neutral-300": "#CCCCCC",
            "--color-neutral-400": "#999999",
            "--color-neutral-500": "#666666",
            "--color-neutral-600": "#444444",
            "--color-neutral-700": "#2A2A2A",
            "--color-neutral-800": "#1A1A1A",
            "--bg-page": "#FFFFFF",
            "--bg-section-alt": "#0A0A0A",
            "--bg-card-light": "#F7F7F5",
            "--bg-card-dark": "#111111",
            "--bg-card-accent": "#F5C518",
            "--bg-nav": "#0A0A0A",
            "--bg-overlay": "rgba(10,10,10,0.72)",
            "--text-primary": "#0A0A0A",
            "--text-secondary": "#444444",
            "--text-muted": "#777777",
            "--text-on-dark": "#FFFFFF",
            "--text-on-accent": "#0A0A0A",
            "--text-label": "#999999",
            "--border-default": "#0A0A0A",
            "--border-light": "#E8E8E8",
            "--border-on-dark": "#333333",
            "--border-accent": "#F5C518",
            "--cta-bg": "#F5C518",
            "--cta-text": "#0A0A0A",
            "--cta-hover-bg": "#0A0A0A",
            "--cta-hover-text": "#FFFFFF"
        },
        "font": {
            "--font-display": "'Bebas Neue', 'Anton', Impact, sans-serif",
            "--font-heading": "'Barlow', 'DM Sans', 'Helvetica Neue', sans-serif",
            "--font-body": "'Barlow', 'Helvetica Neue', sans-serif",
            "--font-mono": "'JetBrains Mono', 'IBM Plex Mono', monospace",
            "--font-condensed": "'Barlow Condensed', 'Roboto Condensed', sans-serif"
        },
        "spacing": {
            "--space-1": "4px",
            "--space-2": "8px",
            "--space-3": "12px",
            "--space-4": "16px",
            "--space-5": "20px",
            "--space-6": "24px",
            "--space-8": "32px",
            "--space-10": "40px",
            "--space-12": "48px",
            "--space-16": "64px",
            "--space-20": "80px",
            "--space-24": "96px",
            "--space-32": "128px",
            "--space-40": "160px",
            "--section-padding-y": "clamp(64px, 8vw, 128px)",
            "--section-padding-x": "clamp(24px, 6vw, 96px)",
            "--container-max": "1280px",
            "--container-padding": "clamp(20px, 5vw, 80px)",
            "--card-padding": "24px",
            "--card-gap": "2px",
            "--nav-height": "72px",
            "--hero-min-height": "90vh",
            "--overline-gap": "16px",
            "--heading-body-gap": "24px"
        },
        "border": {
            "--border-hairline": "1px",
            "--border-default-width": "2px",
            "--border-thick": "3px",
            "--border-heavy": "4px",
            "--radius-none": "0px",
            "--radius-sm": "2px",
            "--radius-pill": "999px"
        },
        "motion": {
            "--duration-instant": "100ms",
            "--duration-fast": "200ms",
            "--duration-base": "300ms",
            "--duration-slow": "500ms",
            "--duration-page": "600ms",
            "--ease-default": "cubic-bezier(0.25, 0, 0.1, 1)",
            "--ease-enter": "cubic-bezier(0, 0, 0.2, 1)",
            "--ease-exit": "cubic-bezier(0.4, 0, 1, 1)",
            "--ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)"
        }
    }
}
```

---

## Quick Reference — Do's and Don'ts

```json
{
    "dos": [
        "Use oversized, heavy headlines that dominate the section",
        "Alternate section backgrounds: white ↔ black",
        "Use accent yellow ONLY for primary CTAs and emphasis",
        "Keep border radius at 0 everywhere except arrow CTA pill buttons",
        "Add section overline labels before every heading",
        "Use 2px tight gaps between grid cards — no whitespace between cards",
        "Use full-bleed photography with no border or container",
        "Use monospace font for phone numbers, metadata, and labels",
        "Keep the entire color system to 3 colors: black, white, yellow"
    ],
    "donts": [
        "NEVER use gradients of any kind",
        "NEVER use box-shadow or drop-shadow",
        "NEVER use more than one accent color",
        "NEVER round card corners",
        "NEVER use decorative stock photography",
        "NEVER use more than 2 font families in a single section",
        "NEVER use light grey text on off-white backgrounds",
        "NEVER add more than one CTA style per section",
        "NEVER use centered text for body copy — always left-aligned"
    ]
}
```

---

*JSON-UI Style Guide — Editorial Brutalism v1.0.0*
*Derived from CAF Construction visual identity analysis*
*Last updated: 2026*