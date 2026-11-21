---
name: agent-builder-design
description: Apply Agent Builder’s design rules when building or restyling screens, choosing UI components, or changing shared styles. Covers shadcn, button variants, color, layout, typography, and motion.
---

# Agent Builder Design

## Component sourcing

1. Look in [`components/ui`](../../components/ui) and nearby feature components first. Reuse existing shadcn components and check [`components.json`](../../components.json) for the project's `base-nova`, Base UI, and Hugeicons conventions. When a suitable shadcn component exists upstream, add that component using the project's configuration.
2. When shadcn has no suitable component, compose the missing UI from existing shadcn primitives. Use Base UI for any underlying interaction the composition needs. Follow the repo's `data-slot`, `className`, and variant conventions as applicable.
3. When a ready-made specialty component fits a feature, install only the needed item from RareUI, Aceternity UI, or Magic UI. Use Number Flow for numeric readouts where animating a value change helps the reader track it. Follow the source's current installation instructions and use Bun for dependencies. Review changes to shared files and adapt imported styles to the repo's tokens and primitives.

## Buttons

Use the shared [`Button`](../../components/ui/button.tsx) and its sizes. Keep its rounded shape, compact spacing, keyboard focus treatment, and state behavior consistent across screens.

- Use `variant="primary"` for the main action in a section or flow. Its light-to-deep blue gradient, fine blue border, inset edge, soft shadow, and white label give it the strongest emphasis. Give each action group one clear primary.
- Use `variant="neutral"` for a prominent alternate action or a standalone action that calls for a neutral palette. It uses the same top-lit treatment in charcoal with white text in light mode, and a light gradient with dark text in dark mode.
- Use `outline` for quiet bordered alternatives, `ghost` for toolbar and row actions, and `destructive` for destructive actions. Use the shared icon sizes and give icon-only controls accessible names.
- Keep the gradient, border, inset edge, and shadow in the shared variants. Keep any needed interaction-state fixes in the shared component and verify contrast across the full gradient in both themes.

## Color and surfaces

- Start with the semantic tokens in [`app/globals.css`](../../app/globals.css). Use white or near-white canvases, white cards, charcoal text, and soft gray separators in light mode. Use the matching dark tokens for the same hierarchy. Use `foreground` for titles and important values, and `muted-foreground` for supporting copy and metadata.
- Use saturated blue for the main action and meaningful selection, such as an active filter pill. Use muted neutral fills for idle filters. Reserve green, amber, and red for meaningful statuses where appropriate, and pair status color with a label or icon. Concentrate decorative color in small icon tiles or artwork so controls remain easy to find.
- Define cards with a fine border and a soft, short shadow. Give popovers or focused previews more depth when it helps distinguish their layer. Use dotted or dashed rules between major groups or above a card footer. Keep textures and image fades inside illustrations or previews where they preserve text contrast.

## Layout and type

- Use a constrained, centered column for editorial content and aligned grids for groups of cards. Let dashboard content use the width it needs. Keep generous space between sections and tighter spacing between related controls and labels. Stack cards when columns become too narrow for their content.
- Use the existing Inter sans and Geist Mono setup in [`app/layout.tsx`](../../app/layout.tsx). Keep headings compact and distinct from body copy. Use small mono labels for short metadata and tabular numerals for comparable metrics. Give a metric card a clear reading order from label to value to supporting detail.
- Use rounded pills for short filters, with a clearly visible active state. On a narrow screen, let a long filter row scroll horizontally within its own container and keep the page free of horizontal overflow. Keep preview details beside the visual when there is room and below it on narrow screens.
- For marketing and editorial pages, use one focal image or product preview, a concise headline, and a clear action group. A subtle texture, image fade, or serif display headline can support a page's subject. Apply the screenshot references through spacing, hierarchy, and surface treatments while creating original layouts and artwork.

## Interaction

Use brief motion to communicate press, selection, disclosure, or a meaningful value change. Honor reduced-motion preferences. Check the changed UI at narrow and wide widths, in both themes, and with keyboard focus. Keep labels and focus indicators legible on textured surfaces and gradients.
