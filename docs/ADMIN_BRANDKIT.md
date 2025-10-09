# KOS Admin Portal Brand Kit

> **Purpose**: This document serves as the definitive design reference for the KOS Admin Portal. Use this guide to maintain visual consistency across all admin features and components.

---

## 🎨 Color Palette

### Primary Colors
```css
Primary Navy:     #27445c (--color-primary)
Gold Accent:      #b2a37a (--color-gold)
Admin Primary:    #25388c (--color-primary-admin)
```

### Status Colors
```css
/* Success/Active */
Emerald-50:  bg-emerald-50 text-emerald-700
Green:       #2cc171 (--color-gold-500)

/* Warning/Featured */
Amber-50:    bg-amber-50 text-amber-700
Amber-500:   bg-amber-500 hover:bg-amber-600

/* Error/Inactive */
Red-50:      bg-red-50 text-red-700
Red-600:     text-red-600 hover:text-red-700

/* Info */
Blue-600:    text-blue-600
Cyan-600:    text-cyan-600
```

### Neutral Palette
```css
/* Backgrounds */
White:       bg-white
Slate-50:    bg-slate-50 (table headers, subtle sections)
Slate-700:   bg-slate-700 (selection toolbar)
Gray-50:     bg-gray-50 (hover states, cards)
Gold/10:     from-gold/10 to-white (gradient hovers)

/* Text */
Gray-900:    text-gray-900 (primary text)
Gray-700:    text-gray-700 (secondary text)
Gray-600:    text-gray-600 (tertiary text)
Gray-500:    text-gray-500 (muted text)
Gray-400:    text-gray-400 (placeholder text)

/* Borders */
Gray-200:    border-gray-200 (standard borders)
Gray-100:    border-gray-100 (subtle borders)
Gray-200/70: border-gray-200/70 (semi-transparent)
```

### Gradient Patterns
```css
/* Primary Gradients */
from-primary to-primary/90
from-primary to-primary/80
from-primary/5 to-white

/* Gold Gradients */
from-gold/10 to-white (hover state)
from-gold to-gold/90 (sidebar background)

/* Status Gradients */
from-gray-50 to-white (cards, activity items)
```

---

## 📝 Typography

### Font Families
```css
Primary:   font-poppins (--font-poppins) - Headers, UI elements, navigation
Body:      font-open-sans (--font-open-sans) - Body text, descriptions
Display:   font-bebas-neue (--font-bebas-neue) - Special headings (if needed)
```

### Font Sizes & Weights
```css
/* Headers */
Page Title:       text-2xl font-bold tracking-tight
Section Header:   text-lg font-bold
Card Header:      text-sm font-bold uppercase tracking-wide
Subsection:       text-sm font-semibold

/* Body Text */
Standard:         text-sm
Small:            text-xs
Metric Value:     text-3xl font-bold

/* Weights */
Bold:             font-bold
Semibold:         font-semibold
Medium:           font-medium
Regular:          font-normal
```

### Text Colors by Context
```css
Primary Text:     text-gray-900
Secondary Text:   text-gray-700 / text-gray-600
Gold Accent:      text-gold
Primary Accent:   text-primary
Muted:            text-gray-500 / text-muted-foreground
```

---

## 🧩 Component Patterns

### Buttons

#### Primary Action Button
```tsx
className="font-semibold text-sm inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white transition-all duration-200 shadow-sm hover:shadow-md"
```

#### Gold Action Button
```tsx
className="gap-2 h-9 bg-gold hover:bg-gold/90 text-white rounded-xl"
```

#### Ghost Button
```tsx
variant="ghost" size="sm" 
className="h-8 w-8 p-0 hover:bg-slate-100"
```

#### Destructive Button
```tsx
className="text-red-600 hover:text-red-700 hover:bg-red-50"
```

### Cards

#### Standard Card Container
```tsx
className="bg-white rounded-3xl shadow-xs border border-gray-200/70"
```

#### Metric Card
```tsx
className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-gold hover:shadow-lg transition-all duration-300"
```

#### Section Card
```tsx
className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm"
```

#### Activity/List Item Card
```tsx
className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-gold/10 hover:to-white transition-all duration-200 border border-gray-100"
```

#### Filter Group Card
```tsx
className="bg-white rounded-lg border border-slate-200 p-3 hover:border-slate-300 transition-colors"
```

### Dropdowns & Menus

#### Dropdown Container
```tsx
className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border-2 border-gray-100 py-2 z-50"
```

#### Dropdown Item
```tsx
className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gold/10 hover:to-white transition-all rounded-lg mx-2 my-1"
```

#### Dropdown Header
```tsx
className="px-4 py-2 border-b border-gray-100"
<span className="text-xs font-bold text-primary uppercase tracking-wide">
```

### Status Badges

#### Active Status
```tsx
className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"
```

#### Inactive Status
```tsx
className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
```

#### Featured Badge
```tsx
className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700"
```

#### Trend Indicator
```tsx
className={cn(
  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border",
  isPositive 
    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
    : "bg-red-50 text-red-700 border-red-200"
)}
```

---

## 📊 Table Patterns

### Table Container
```tsx
<div className="flex-1 flex flex-col min-h-0">
  <div className="flex-1 overflow-auto">
    <table className="w-full border-collapse">
```

### Table Header
```tsx
className="sticky top-0 z-10 bg-slate-50 px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"
```

### Table Row
```tsx
className="hover:bg-slate-50/50 transition-colors"
```

### Table Cell
```tsx
className="px-6 py-4 whitespace-nowrap"
```

### Selection Toolbar
```tsx
className="flex-shrink-0 bg-slate-700 text-white px-6 py-3 flex items-center justify-between"
```

### Pagination Footer
```tsx
className="flex-shrink-0 border-t border-gray-200 px-6 py-3 bg-white"
```

---

## 🎯 Layout Structure

### Sidebar
```tsx
// Container
className="flex flex-col h-screen transition-all duration-300 ease-in-out bg-gold text-white rounded-tr-3xl rounded-br-3xl w-64"

// Logo Section
className="flex items-center justify-between p-4 h-16"

// Navigation Item (Active)
className="relative isolate flex items-center px-3 py-2.5 text-gold bg-white hover:bg-white px z-20 rounded-tl-3xl rounded-bl-3xl before:content-[''] after:content-[''] before:absolute after:absolute before:right-0 before:-top-8 after:right-0 after:-bottom-8 before:h-8 before:w-8 after:h-8 after:w-8 before:rounded-full after:rounded-full before:shadow-[16px_16px_0_0_white] after:shadow-[16px_-16px_0_0_white]"

// Navigation Item (Inactive)
className="flex items-center px-3 py-2.5 text-white/85 hover:bg-white/10 rounded-tl-3xl rounded-bl-3xl transition-colors"
```

### Header
```tsx
// Container
className="h-16 w-full px-6 sticky top-0 z-40"

// Inner Container
className="h-full bg-white/95 backdrop-blur-xs border border-gray-200 shadow-xs rounded-bl-3xl rounded-br-3xl flex px-4"

// User Profile Button
className="flex items-center gap-2 focus:outline-hidden group p-2 rounded-xl hover:bg-gold/10 transition-all duration-200"
```

### Content Areas

#### Page Container
```tsx
className="h-full flex flex-col overflow-hidden bg-white rounded-3xl shadow-xs border border-gray-200/70"
```

#### Dashboard Grid
```tsx
className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
```

#### Two-Column Layout
```tsx
className="grid grid-cols-1 lg:grid-cols-3 gap-4"
className="lg:col-span-2" // Main content (2/3 width)
```

---

## 🔍 Filter Patterns

### Filter Container
```tsx
className="border-b border-gray-200"
```

### Primary Filters Row
```tsx
className="px-6 py-3 bg-white"
<div className="flex flex-wrap items-center gap-2">
```

### Advanced Filters Section
```tsx
className="px-6 py-3 bg-slate-50/50 border-t border-gray-200"
```

### Search Input
```tsx
<div className="relative flex-1 min-w-[220px] max-w-md">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
  <Input placeholder="Search..." className="pl-9 h-9" />
</div>
```

### Advanced Toggle Button
```tsx
className={`gap-2 h-9 ${showAdvanced ? 'bg-gold/60' : 'bg-gold'}`}
// With count badge:
<span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-slate-500 rounded-full">
  {activeFilterCount}
</span>
```

---

## ⚡ Interactive States

### Hover Transitions
```css
/* Standard */
transition-all duration-200
transition-colors

/* Extended */
transition-all duration-300

/* Transform */
group-hover:scale-105 transition-transform duration-300
```

### Hover Effects - Buttons
```css
hover:bg-gold/10
hover:bg-slate-100
hover:bg-red-50
hover:shadow-md
hover:border-gold
```

### Hover Effects - Cards/Links
```css
hover:from-gold/10 hover:to-white
hover:bg-gradient-to-r hover:from-gold/10 hover:to-white
hover:border-slate-300
```

### Focus States
```css
focus:outline-hidden
focus:ring-2 focus:ring-gold
focus:border-gold
```

### Loading States
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
```

---

## 🎨 Border Radius Standards

```css
/* Ultra Rounded (Containers, Cards) */
rounded-3xl    // 24px - Main page containers, large cards

/* Very Rounded (Cards, Sections) */
rounded-2xl    // 16px - Section cards, dropdowns

/* Rounded (Buttons, Small Cards) */
rounded-xl     // 12px - Buttons, inputs, small cards, badges

/* Medium Rounded (Inputs, Elements) */
rounded-lg     // 8px - Filter cards, small elements

/* Small Rounded (Badges, Icons) */
rounded-md     // 6px - Minimal rounding
rounded-full   // Pills, badges, avatars
```

---

## 🌟 Shadow Standards

```css
shadow-xs      // Minimal shadow for subtle elevation
shadow-sm      // Small shadow for buttons, icons
shadow-md      // Medium shadow for hover states
shadow-lg      // Large shadow for popovers, hover cards
shadow-xl      // Extra large for dropdowns, modals
```

---

## 🖼️ Icon Patterns

### Icon Library
```tsx
import { IconName } from "lucide-react"
```

### Icon Sizes
```tsx
h-3 w-3        // Tiny (12px) - Small UI elements
h-3.5 w-3.5    // Extra Small (14px) - Buttons, filters
h-4 w-4        // Small (16px) - Standard buttons, dropdowns
h-5 w-5        // Medium (20px) - Navigation, larger buttons
h-6 w-6        // Large (24px) - Metric cards
h-8 w-8        // Extra Large (32px) - Empty states
h-12 w-12      // Huge (48px) - Empty state illustrations
```

### Icon Containers

#### Primary Icon Container
```tsx
className="w-12 h-12 bg-gradient-to-br from-primary to-primary/90 rounded-xl flex items-center justify-center text-white shadow-sm"
```

#### Small Icon Container
```tsx
className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
<Icon className="w-4 h-4 text-white" />
```

#### Activity Icon Container
```tsx
className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-gray-100 shadow-sm"
```

### Icon Color Patterns
```tsx
// Quick Actions
text-cyan-600 hover:text-cyan-700      // Boats
text-orange-600 hover:text-orange-700  // Users
text-blue-600 hover:text-blue-700      // Quotes
text-pink-600 hover:text-pink-700      // Blog
text-green-600 hover:text-green-700    // Events

// Activity Types
text-blue-600      // Bookings
text-emerald-600   // Users
text-purple-600    // Completions
text-amber-600     // Inquiries
```

---

## 📏 Spacing Standards

### Padding
```css
/* Page Level */
p-6              // Standard page padding
px-6 py-3        // Filter sections, compact areas
px-6 py-4        // Card headers
p-5              // Card content

/* Component Level */
px-4 py-2        // Buttons, dropdowns
px-3 py-2.5      // Navigation items, smaller buttons
px-2 py-0.5      // Badges
```

### Gaps
```css
gap-1           // Minimal (4px) - Tight icon groups
gap-1.5         // 6px - Button icon spacing
gap-2           // 8px - Standard icon-text spacing
gap-3           // 12px - Card content spacing
gap-4           // 16px - Grid/layout spacing
gap-6           // 24px - Major section spacing
```

---

## 📱 Responsive Patterns

### Grid Breakpoints
```tsx
// Metrics/Cards
grid-cols-1 sm:grid-cols-2 xl:grid-cols-4

// Content Layouts
grid-cols-1 lg:grid-cols-3
lg:col-span-2

// Filters
grid-cols-1 lg:grid-cols-3 gap-3        // Major filters
grid-cols-2 lg:grid-cols-4 gap-2        // Minor filters
```

### Flex Patterns
```tsx
flex flex-col sm:flex-row              // Stack on mobile, row on desktop
flex flex-wrap items-center gap-2      // Wrapping toolbar
```

### Text Wrapping
```tsx
whitespace-nowrap      // Table cells, single-line content
truncate               // Overflow text with ellipsis
```

---

## 🎭 Empty States

### Pattern
```tsx
<div className="flex-1 flex items-center justify-center p-8">
  <div className="text-center">
    <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
    <p className="text-sm text-gray-500">Try adjusting your filters or add a new item.</p>
  </div>
</div>
```

---

## 🔄 Loading States

### Spinner
```tsx
<div className="flex-1 flex items-center justify-center">
  <div className="text-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
    <p className="text-sm text-gray-500 mt-2">Loading...</p>
  </div>
</div>
```

### Inline Spinner
```tsx
<div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
```

---

## ✅ Best Practices

### Do's
- ✅ Use `rounded-3xl` for main page containers
- ✅ Use `rounded-2xl` for section cards
- ✅ Use `rounded-xl` for buttons and interactive elements
- ✅ Apply gradient hovers: `hover:from-gold/10 hover:to-white`
- ✅ Use `shadow-xs` for subtle elevation
- ✅ Use `border-2 border-gray-100` for prominent borders
- ✅ Use `transition-all duration-200` for smooth interactions
- ✅ Apply `text-primary` for brand accent text
- ✅ Use `font-poppins` for UI elements
- ✅ Use consistent icon sizes: h-4 w-4 (buttons), h-5 w-5 (nav)
- ✅ Apply proper spacing: `gap-2` for compact, `gap-4` for comfortable

### Don'ts
- ❌ Don't mix sharp corners with rounded elements
- ❌ Don't use inconsistent shadow depths
- ❌ Don't apply arbitrary colors outside the palette
- ❌ Don't use inconsistent border widths
- ❌ Don't skip hover states on interactive elements
- ❌ Don't use text smaller than `text-xs`
- ❌ Don't forget loading and empty states
- ❌ Don't use transitions longer than 300ms
- ❌ Don't mix font families within components
- ❌ Don't use naked icons without containers in key areas

---

## 🎨 Quick Reference: Common Patterns

### Primary Button
```tsx
<button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white transition-all duration-200 shadow-sm hover:shadow-md">
  <Icon className="h-4 w-4" />
  <span className="font-semibold text-sm">Action</span>
</button>
```

### Section Card
```tsx
<div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm">
  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-white">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-sm font-bold text-primary">Section Title</h3>
    </div>
  </div>
  <div className="p-5">
    {/* Content */}
  </div>
</div>
```

### Status Badge
```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
  Active
</span>
```

### Metric Card
```tsx
<div className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-gold hover:shadow-lg transition-all duration-300">
  <div className="flex items-start justify-between mb-4">
    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/90 rounded-xl flex items-center justify-center text-white shadow-sm">
      <Icon className="h-6 w-6" />
    </div>
  </div>
  <div>
    <div className="text-sm font-semibold text-gray-600 mb-2">Metric Label</div>
    <div className="text-3xl font-bold text-primary mb-1">$12,345</div>
    <div className="text-xs text-gold font-medium">This month</div>
  </div>
</div>
```

---

## 📝 Notes for AI Agents

When building new admin features:

1. **Always start with the page container**: `bg-white rounded-3xl shadow-xs border border-gray-200/70`
2. **Use consistent card patterns**: Section cards get `rounded-2xl`, interactive elements get `rounded-xl`
3. **Apply the gold gradient hover**: Most interactive items use `hover:from-gold/10 hover:to-white`
4. **Include proper states**: Loading, empty, error, and success states are mandatory
5. **Follow the icon pattern**: Icons in primary areas should be containerized with proper backgrounds
6. **Maintain spacing rhythm**: Use `gap-2` for compact, `gap-4` for comfortable, `gap-6` for sections
7. **Use Lucide React icons**: Consistent with the rest of the app
8. **Apply transitions**: All interactive elements need `transition-all duration-200` or `transition-colors`
9. **Border hierarchy**: Main containers use `border-2`, subtle elements use `border` (1px)
10. **Typography consistency**: Headers are `font-bold`, labels are `font-semibold`, body is `font-medium`

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Maintained By**: KOS Development Team

