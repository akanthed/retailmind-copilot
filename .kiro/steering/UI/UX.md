---
inclusion: always
---

# UI/UX Design System

RetailMind AI follows a premium SaaS aesthetic with a calm, confident, and intelligent design language. The design system emphasizes clarity, accessibility, and delightful micro-interactions.

## Design Philosophy

- Premium feel with subtle animations and smooth transitions
- Deep teal primary (#2D9B8E) with sage green accents
- Soft shadows and glass-morphism effects
- Generous whitespace and breathing room
- Mobile-first responsive design

## Color System

Use HSL color tokens defined in `src/index.css`:

- Primary: Deep teal (`hsl(173 58% 39%)`) for CTAs and key actions
- Secondary: Sage green (`hsl(160 30% 94%)`) for supporting elements
- Success: Green (`hsl(152 60% 42%)`)
- Warning: Amber (`hsl(38 92% 50%)`)
- Destructive: Red (`hsl(0 72% 51%)`)
- Muted: Subtle gray-teal for secondary text

## Typography

- Font: Inter (Google Fonts)
- Headings: font-semibold, tracking-tight
- Body: text-sm or text-base
- Muted text: text-muted-foreground
- Use gradient-text class for hero headings

## Component Patterns

### Cards

Use `premium-card` class for elevated surfaces:
```tsx
<div className="premium-card rounded-2xl p-6">
  {/* Content */}
</div>
```

- Always use rounded-2xl (16px) for cards
- Include hover states with hover-lift class
- Use glass-card for overlay/modal surfaces

### Buttons

Follow shadcn/ui button variants:
- `default`: Primary actions (teal background)
- `outline`: Secondary actions
- `ghost`: Tertiary/icon actions
- `destructive`: Delete/remove actions

All buttons include:
- active:scale-95 for press feedback
- Smooth transitions (200ms)
- Hover lift effect (-1px translateY)

### Forms & Inputs

- Use `premium-input` class for text inputs
- Always include labels with proper htmlFor
- Show validation errors below inputs
- Use HelpTooltip for contextual help
- Disable submit buttons during loading

### Loading States

Use LoadingSpinner components:
- `LoadingPage`: Full-page loading
- `LoadingInline`: Section/card loading
- `LoadingSpinner`: Custom placement

Include inspirational quotes for longer waits.

### Empty States

- Use friendly illustrations or icons
- Provide clear next action with Button
- Keep messaging encouraging and actionable

## Layout Conventions

### Page Structure

```tsx
<AppLayout>
  <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
    {/* Page content */}
  </div>
</AppLayout>
```

- AppLayout includes sidebar and bottom nav
- Max width: 5xl (80rem) for readability
- Responsive padding: p-6 mobile, p-10 desktop

### Grid Layouts

- Use grid for equal-width cards
- Common: `grid grid-cols-1 md:grid-cols-2 gap-4`
- Stats: `grid grid-cols-2 md:grid-cols-4 gap-4`

### Spacing

- Section gaps: mb-8 (2rem)
- Card gaps: gap-4 (1rem)
- Element gaps: gap-2 or gap-3
- Generous padding: p-6 for cards

## Animation Guidelines

### Entry Animations

Use staggered fade-ins for page elements:
```tsx
<div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
```

Available animations:
- `animate-fade-in`: Opacity + slight Y movement
- `animate-slide-in-right`: From right
- `animate-slide-in-bottom`: From bottom
- `animate-scale-in`: Scale up effect

### Interaction Animations

- Buttons: active:scale-95
- Cards: hover:-translate-y-0.5
- All transitions: 200ms duration
- Use transition-smooth or transition-bounce

### Loading Animations

- `animate-spin`: For spinners
- `animate-pulse-soft`: Subtle pulsing
- `animate-shimmer`: Skeleton loaders

### Feedback Animations

- `success-pulse`: Green pulse on success
- `error-pulse`: Red pulse on error
- `animate-shake`: Shake on validation error
- `animate-bounce-in`: Success confirmations

## Accessibility Requirements

### Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Include `<main>` with id="main-content"
- Use `<nav>`, `<article>`, `<section>` appropriately
- Always include SkipToContent component

### ARIA Labels

- Add aria-label to icon-only buttons
- Use aria-live for dynamic content
- Include role="status" for loading states
- Add aria-hidden="true" to decorative icons

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Visible focus states with focus-visible-ring
- Logical tab order
- Escape key closes modals/dialogs

### Screen Readers

- Use sr-only class for screen reader text
- Include descriptive alt text for images
- Provide context for icon buttons
- Announce state changes

### Color Contrast

- Maintain WCAG AA contrast ratios
- Don't rely on color alone for information
- Test in dark mode
- Use text labels with status colors

## Responsive Design

### Breakpoints

- Mobile: < 768px (default)
- Tablet: md: (768px+)
- Desktop: lg: (1024px+)

### Mobile Considerations

- Bottom navigation on mobile
- Sidebar on desktop
- Touch-friendly targets (min 44x44px)
- Simplified layouts on small screens

### Layout Shifts

- Fixed sidebar on desktop (margin-left: 16rem)
- Bottom nav padding (pb-20) on mobile
- Prevent layout shift during loading

## Icon Usage

Use Lucide React icons consistently:
- Size: w-4 h-4 (16px) for inline, w-5 h-5 (20px) for emphasis
- Color: text-muted-foreground or text-primary
- Always include aria-hidden="true"
- Pair with text labels when possible

Common icons:
- Sparkles: AI features
- TrendingUp: Analytics/growth
- Bell: Alerts/notifications
- Package: Products/inventory
- IndianRupee: Pricing/currency

## Data Visualization

### Charts (Recharts)

- Use consistent color palette (COLORS array)
- Include tooltips with formatted values
- Responsive containers (100% width)
- Legend below chart with color indicators

### Formatting

- Currency: ₹ symbol with Indian number format
- Large numbers: K suffix (₹1,064K)
- Dates: Relative (2 hours ago) or ISO
- Percentages: One decimal place

## Toast Notifications

Use shadcn/ui toast:
```tsx
toast({
  title: "Success",
  description: "Action completed",
  variant: "default" // or "destructive"
});
```

- Keep messages concise
- Use destructive variant for errors
- Auto-dismiss after 5 seconds
- Position: bottom-right

## Error Handling

- Show user-friendly error messages
- Use getUserFriendlyError helper
- Provide actionable next steps
- Log technical details to console
- Never expose API errors directly

## Internationalization

- Use useLanguage hook for translations
- All user-facing text through t() function
- Support Hindi and English
- Format numbers/dates per locale

## Performance

- Lazy load images and heavy components
- Use React Query for data caching
- Debounce search inputs
- Optimize animations (transform/opacity only)
- Minimize layout recalculations

## Best Practices

- Always test keyboard navigation
- Verify color contrast in both themes
- Test on mobile devices
- Use semantic HTML
- Include loading states
- Handle empty states gracefully
- Provide helpful error messages
- Add micro-interactions for delight
- Keep animations subtle and purposeful
- Maintain consistent spacing rhythm 