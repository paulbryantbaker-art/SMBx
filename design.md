# Design System: Sturdy Stitch-Uber (smbx.ai)

This document defines the unified, world-class design language for the **smbx.ai** M&A platform. It synthesizes the minimalist, "canvas-first" elegance of **Stitch** with the bold, "sturdy" structural confidence of **Uber**.

## 1. Visual Foundation

### 1.1 Color Palette
*   **Primary Background:** `#FFFFFF` (Pure White). Used for all major content cards and the main workspace.
*   **Global Background:** `#F9F9F9` (Soft Off-White). Provides subtle contrast for the canvas.
*   **Sidebar & Navigation:** `#FFFFFF` with a `1px` border in `rgba(0,0,0,0.06)`.
*   **Primary Text:** `#000000` (Pure Black). High contrast for headings and primary content.
*   **Secondary Text:** `#545454` (Muted Grey). Used for descriptions, labels, and metadata.
*   **Accent (Brand):** Coral Red/Terracotta `#C96B4F`. Used exclusively for the 3D interlocked 'X' in the logo.
*   **Interactive Accents:** Solid Black for primary buttons; White with Black border for secondary.

### 1.2 Typography
*   **Headings:** Bold, high-contrast Sans-Serif (e.g., Inter or a refined Uber Move variant).
    *   H1: Large, authoritative (48px - 64px), often used with significant vertical clearance.
    *   Subheads: Clear and weighted to establish immediate hierarchy.
*   **Body:** Clean Sans-Serif with generous line-height (1.6) for an editorial feel.
*   **Alignment:** Full-page justification where appropriate; centered or left-aligned depending on context (e.g., Chat is left-aligned, Journey hero sections are centered).

### 1.3 Spacing & Rhythm
*   **Ultra-Airy Spacing:** Massive vertical margins (e.g., `120px` to `200px`) between major content sections to convey a "premium" and "defensible" feel.
*   **Grid:** Information is organized into horizontal or vertical grids of white cards.

## 2. Component Library

### 2.1 The Sidebar (App Shell)
*   **Position:** Fixed to the Left.
*   **Style:** Minimalist white rail with a subtle `1px` border.
*   **Content:** Simple, unboxed icons with text labels.

### 2.2 Experience Tiles (Content Cards)
*   **Background:** `#FFFFFF` (Pure White).
*   **Border:** `1px solid rgba(0,0,0,0.06)` (Subtle, high-end).
*   **Corners:** Slightly rounded (`8px` to `12px`).
*   **Shadow:** Very light (`0 4px 12px rgba(0,0,0,0.03)`) to create a "canvas" depth.
*   **Internal Spacing:** Generous padding to prevent information from feeling "crammed."

### 2.3 The Stitch-Style Chat
*   **Conversation View:** No chat bubbles.
*   **Tags:** User and AI ("Yulia AI") labels placed directly above the text blocks.
*   **Alignment:** Left-aligned in a dedicated chat pane.
*   **Rich Text:** Supports bolding, lists, and data tables within the flow.

### 2.4 Chat Input (The Pill)
*   **Shape:** Signature pill-shape/stadium border.
*   **Icons:** Minimalist `+` (Attachment) on the left, `↑` (Send) on the right.
*   **Placement:** Centered on Home; Bottom-aligned in Chat Pane.

### 2.5 Buttons
*   **Primary:** Solid Black background, White text, pill-shaped or slightly rounded (`8px`).
*   **Secondary:** White background, Black `1px` border, pill-shaped.

## 3. Brand Identity & Motion

### 3.1 Logo
*   **Mark:** 3D interlocked 'X' in `#C96B4F`.
*   **Logotype:** 'smb' and '.ai' in Solid Black, bold geometric sans-serif.

### 3.2 Motion Signature
*   **Hopping Animation:** Subtle "squash-and-stretch" effect on the 'X' using CSS keyframes. Used for brand delight on the Home page or hover states.

## 4. Platform Architecture
*   **Journey Pages:** Long-form, editorial "Sales Funnel" layouts using the Card system.
*   **In-Chat Dashboard:** Three-column view (Sidebar | Chat Pane | Dual Canvas) for data-intensive M&A tasks.
*   **Mobile View:** Full-page justification with integrated sidebar navigation for maximum readability.