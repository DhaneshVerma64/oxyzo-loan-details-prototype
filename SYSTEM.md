# Oxyzo Admin Design System & Prototype Style Guide
> **Version:** 2.0 (Living Specification)  
> **Target Surface:** Oxyzo Admin Portal (Loan Details, Facilities, Underwriting, Ops)  
> **Source of Truth:** Shared Figma Design System + Production Admin Conventions  

---

## 1. Core Design Principles & Guardrails

| Principle | Rule & Guideline |
| :--- | :--- |
| **Extend, Don't Replace** | Preserve all existing fields, status points, and data points unless a PRD explicitly marks them redundant or conflicting. |
| **Sentence Case Default** | Use sentence case for all headers, labels, menu items, table headers, and badges. **Never use all-caps or heavy bold for headers.** |
| **Medium Weight Hierarchy** | Headers and labels use medium weight (`font-weight: 500`) in muted gray (`#64748B`). Actual data values carry darker contrast (`#0F172A`) and weight (`500` or `600`). |
| **Minimum Text Size** | **12px minimum**. Never render text smaller than 12px anywhere in the admin. |
| **Hit Target Accessibility** | All clickable buttons, tabs, toggles, and chips must have a minimum interactive height/touch target of **36px** (`min-height: 36px` or `height: 36px`). |
| **Multi-Modal Signaling** | **Never rely on color alone** to communicate status or severity. Always pair color with an icon, prefix (e.g., `▲` for critical, `◆` for medium, `✓` for resolved), or textual description. |
| **Accessible Focus States** | All interactive elements must declare distinct `:focus-visible` outlines (typically `2px solid var(--color-brand-strong)` with `2px offset`). |
| **Respect Reduced Motion** | Wrap animations and transitions in `@media (prefers-reduced-motion: reduce)` to disable non-essential motion. |
| **CSS Class Naming** | Prefix all prototype-specific components and utility classes with `.adm-*` to prevent namespace collisions. |

---

## 2. Color Tokens & Semantic System

### 2.1 Primitive Color Palette
```css
:root {
  /* Admin Primary Teal */
  --teal-primary: #00AFCD;   /* Primary Brand Color */
  --teal-tint-1:  #4DC7DC;   /* Hover / Secondary Accents */
  --teal-tint-2:  #99DFEB;   /* Focus Rings & Active Borders */
  --teal-tint-3:  #E5F7FA;   /* Subtle Backgrounds / Chips */
  --teal-tint-4:  #F2FBFC;   /* Faint Surface Fills */

  /* Neutral Scale (Slate Grays) */
  --white:        #FFFFFF;
  --black-primary:#0F172A;   /* Primary Headings & Critical Values */
  --black-secondary:#334155; /* Section Titles & Secondary Text */
  --black-tint-1: #64748B;   /* Field Labels, Units & Muted Text */
  --black-tint-2: #94A3B8;   /* Disabled Text & Inactive Chevrons */
  --black-tint-3: #CBD5E1;   /* Active Card Borders & Inset Dividers */
  --black-tint-4: #E2E8F0;   /* Surface Dividing Borders & Canvas */
  --black-tint-5: #F1F5F9;   /* Muted Card Fills & Sub-bars */
  --black-tint-6: #F8FAFC;   /* Subtle Surface Backgrounds */

  /* Danger / Critical Red */
  --red-primary:  #BE123C;   /* Critical Issues, Overdue, Bounced */
  --red-tint-3:   #FB7185;   /* Danger Border */
  --red-tint-4:   #FFE4E6;   /* Danger Chip Fill Strong */
  --red-tint-5:   #FFF1F2;   /* Danger Alert Background */

  /* Warning / Amber */
  --amber-primary:#7A5200;   /* Warning Text & Accents */
  --amber-border: #F0D58A;   /* Warning Border */
  --amber-bg:     #FFFBF0;   /* Warning Chip Fill */
  --amber-accent: #E08A1E;   /* Pinned Star, Limit Accents */

  /* Success / Green */
  --green-text:   #1D6B3A;   /* Positive Dues, Paid, Cleared Checks */
  --green-bg:     #EEF9F2;   /* Success Chip Fill */
  --green-border: #CFE6D6;   /* Success Border */

  /* Specialized Accents */
  --blue-chart:   #2F6DF6;   /* Line Chart & Hard-copy Received */
  --nav-bg:       #2E3B4A;   /* Sidebar Background & Tooltips */
  --nav-active:   #3A4A5C;   /* Sidebar Active Item */
  --nav-text:     #C9D3DD;   /* Sidebar Inactive Labels */
}
```

### 2.2 Semantic Color Mapping
Always reference semantic tokens in component markup rather than hardcoded hex values:

| Semantic Token | Value / Mapping | Intended Usage |
| :--- | :--- | :--- |
| `--color-brand` | `var(--teal-primary)` (`#00AFCD`) | Primary buttons, active tab underlines, main indicators |
| `--color-brand-strong` | `var(--teal-primary)` (`#00AFCD`) | Link buttons, action icons, active chip text, primary headers |
| `--color-brand-subtle` | `var(--teal-tint-3)` (`#E5F7FA`) | Active filter pill background, badge fills, highlighted rows |
| `--color-text-primary` | `var(--black-primary)` (`#0F172A`) | Data numbers, borrower name, modal titles, table values |
| `--color-text-secondary` | `var(--black-secondary)` (`#334155`) | Card section headers, table headers, group titles |
| `--color-text-tertiary` | `var(--black-tint-1)` (`#64748B`) | Metric labels, metadata field titles, relative timestamps |
| `--color-text-disabled` | `var(--black-tint-2)` (`#94A3B8`) | Disabled action reasons, empty row text, inactive icons |
| `--color-text-inverse` | `var(--white)` (`#FFFFFF`) | Text on primary teal buttons and active sidebar items |
| `--color-surface` | `var(--white)` (`#FFFFFF`) | Content cards, overlays, dropdown popovers |
| `--color-surface-subtle`| `var(--black-tint-6)` (`#F8FAFC`) | Table header rows, sub-item background, control panel |
| `--color-surface-muted` | `var(--black-tint-5)` (`#F1F5F9`) | Muted tags, progress bar tracks, disabled button fills |
| `--color-surface-canvas`| `var(--black-tint-4)` (`#E2E8F0`) | Page-level background canvas |
| `--color-border` | `var(--black-tint-4)` (`#E2E8F0`) | Card separation borders, table cell bottom borders |
| `--color-border-strong` | `var(--black-tint-3)` (`#CBD5E1`) | Filter pill borders, input borders, dashed control outlines |
| `--color-danger` | `var(--red-primary)` (`#BE123C`) | Bounced indicators, overdue values, high-risk badges |
| `--color-danger-bg` | `var(--red-tint-5)` (`#FFF1F2`) | Critical error banners, bounced cheque row highlights |

> [!NOTE]
> **Contrast Acceptance:** Text on primary teal fills (`#00AFCD`) is white (`#FFFFFF`), yielding ~2.6:1 contrast. This is an accepted Oxyzo brand design decision. All interactive buttons remain distinguishable through shape, hit area, and iconography.

---

## 3. Typography & Text Hierarchy

**Typeface:** `Inter, system-ui, -apple-system, sans-serif`

| Token | Size / Line-Height | Weight | Semantic Application |
| :--- | :--- | :--- | :--- |
| `--text-xs` | `12px` / `18px` | `400` / `500` | Metadata labels, filter chips, timestamps, table sub-values |
| `--text-sm` | `14px` / `22px` | `500` / `600` | Table cell data, card metadata values, modal descriptions, body text |
| `--text-md` | `16px` / `24px` | `500` | Card section titles ("Actions", "Recent updates", "EMI schedule") |
| `--text-lg` | `18px` / `28px` | `500` | Sub-modal headers, intelligence card key metrics |
| `--text-xl` | `20px` / `30px` | `500` / `600` | Loan name (H1), primary financial tiles (Outstanding, Utilised, Overdue) |

### Typography Rules
1. **Sentence Case Strictness:** Write "Ready for disbursal", not "READY FOR DISBURSAL" or "Ready For Disbursal".
2. **Number Formatting:** Always use tabular numerals (`font-variant-numeric: tabular-nums`) for currency amounts, dates, percentages, and DPD counts to preserve vertical alignment.
3. **No Heavy Bold on Headers:** Section headers use medium weight (`500`). Use bold (`600`/`700`) only on key numerical amounts (e.g., sanctioned loan amount, total overdue).

---

## 4. Layout & Spatial System

### 4.1 Global App Shell Architecture
```
+---------------------------------------------------------------------------------------------------+
|  SIDEBAR           TOP HEADER (Borrower Name, Status Badge, Star Toggle, Pinned Popover, Primary) |
|  [220px / 80px]   +-------------------------------------------------------------------------------+
|                   |  KPI SUMMARY TILES (Utilised, Outstanding, Overdue DPD, Cheque Bounce)        |
|                   +-------------------------------------------------------------------------------+
|                   |  METADATA EXPANDABLE GRID (6 Key Fields -> 15 Extended Fields)                |
|                   +-------------------------------------------------------+-----------------------+
|                   |  MAIN CONTENT COLUMN (minmax(0, 1fr))                 |  STICKY RIGHT RAIL    |
|                   |  - Alerts & Critical Issues Bar (~60px)               |  [320px / 264px]      |
|                   |  - Module Intelligence (Tabs: Chart + On-Demand AI)   |  - Actions Matrix     |
|                   |  - Extension Timeline (Renewal Chain)                 |  - Cheques & Perfect. |
|                   |  - EMI Schedule (10 Cols + Filter Persistence)        |  - Recent Updates     |
+---------------------------------------------------------------------------------------------------+
```

### 4.2 Breakpoints & Column Sizing
- **Expanded Sidebar:** `220px` width (standard view).
- **Collapsed Sidebar:** `80px` width (icon mode with 2-line truncated labels).
- **Sticky Right Rail:**
  - `320px` when inner viewport $\ge 1150\text{px}$.
  - `264px` when inner viewport $\ge 1000\text{px}$.
  - Stacks (`order: -1` or bottom flow) when inner viewport $< 1000\text{px}$.
- **Card Spacing:** `gap: 16px` between major layout blocks; `gap: 12px` inside section containers; `gap: 8px` between chip elements.

---

## 5. Standard Component Patterns

### 5.1 Click-to-Copy on Identifiers (`.adm-copyable`)
Applied to all system identifiers: Loan No, Application No, NBFC Loan ID, Master Loan No, Physical Document ID, and Payment UTR.

* **Anatomy:**
  ```html
  <div class="adm-copyable">
    <span class="adm-copy-val">{{ id }}</span>
    <button class="adm-copy-btn" onClick="{{ handleCopy }}" aria-label="Copy Loan No">
      <svg class="adm-copy-icon">...</svg>
    </button>
  </div>
  ```
* **Behavior:**
  - Icon button reveals on hover and on `:focus-visible`.
  - On touch displays (`@media (hover: none)`), the copy icon is always visible.
  - If the identifier is a navigation link, clicking the text navigates; clicking the icon copies (`e.stopPropagation()`).
  - Empty values (`"-"`, `"- / -"`) display no copy button.
  - Masked values (e.g. `"[UTR number]"`) copy exactly what is displayed; never copy unmasked secrets.
  - Provides a 1.5-second checkmark visual state and announces `"Copied"` to polite `aria-live` screen readers.
  - Blocked clipboard fallback selects the raw text and displays `"Press Ctrl+C to copy"`.
  - Telemetry logs `{ field: name }` without transmitting the sensitive ID value.

### 5.2 Pinned & Recent Loans Popover (`.adm-recent-popover`)
Per-user navigation drawer anchored in the header.

* **Rules:**
  - **Recent:** Stores the last 10 loans, newest first, deduplicated. Records a visit only after page view renders successfully (never on hover or in list views).
  - **Pinned:** Stores up to 20 loans in the order pinned. Star toggle button (`.adm-star-btn`) sits in the header and on each item.
  - **Cap Protection:** If a user attempts to pin a 21st loan, block addition and announce: `"You can pin up to 20 loans. Unpin one to add another."`.
  - **Data Display:** Displays borrower name (primary), loan number (muted), and relative visit time (`"2 hours ago"`). Does not execute extra API calls per item.
  - **Actions:** Real `<a>` links (Cmd/Ctrl+click creates new tab), hover remove (`✕`), and `"Clear recent"` action (clears recents only, leaves pins intact).

### 5.3 Filter Persistence & Safety Reset
Persists active user filters across page reloads and cross-loan navigation:

* **Persistence Surfaces:**
  - `Recent updates`: type chips (`all`, `pay`, `limits`, `status`, `other`). Key: `oxyzo:filter:v1:recent_updates`.
  - `EMI schedule`: status chips (`all`, `overdue`, `due_today`, `upcoming`, `paid`) and rows per page (`10`, `20`, `50`). Key: `oxyzo:filter:v1:emi_schedule`.
  - **Critical Boundary:** The Alerts & Critical Issues overlay severity filter **must never be persisted**; it must always open on `"All"`.
* **Safety Reset UI:**
  - Whenever a restored filter is non-default, display a visible count and reset link: `"Showing 2 of 5 · Reset filters"`.
  - Empty filter results display a helpful callout: `"No overdue dues on this loan. Show all."`.

### 5.4 Collapsible Cards with Mini-Bar Preview (`.adm-cheques-toggle`)
Used in dense rails to reclaim vertical screen estate while preserving risk signaling.

* **Cheques Section Pattern (Option B):**
  - Section header button with `min-height: 36px` and `aria-expanded="true|false"`.
  - Always-visible `6px` multi-colored progress bar directly under the header.
  - **Smart Default Expansion:**
    - If `bounced > 0`: Auto-expand by default so officers immediately see the critical failures.
    - If `bounced === 0`: Default to collapsed, bringing downstream sections above the fold.
  - **Collapsed Subheading Line:**
    - If bounced: `▲ 4 bounced · 4 active · 3 paid · 1 in bank` (with danger pill background on the bounced count).
    - If clean: `✓ 0 bounced · 3 active · 2 paid · 1 in bank`.

### 5.5 Right-Side Overlay Drawer (460px)
The standard Oxyzo pattern for "more details on anything" (replaces modal dialogs and route jumping).

* **Specifications:**
  - Width: `460px`, anchored to the right viewport edge with dark semi-transparent scrim (`rgba(15, 23, 42, 0.4)`).
  - Contains fixed header with close button (`✕` and Escape key listener), tab navigation, and independent scroll body.
  - Used for: Alerts & Critical Issues deep-dive, KYC Score breakdown & verification logs.

### 5.6 Module Intelligence (MI)
* **Default View:** Utilization, DPD, and Repayment charts render by default on page load (zero "Load Chart" clicks).
* **Facility vs Client Toggle:** Segmented toggle (`Loan view | Client view`) at the top of the card.
* **On-Demand AI Spending:** AI synthesis consumes tokens on demand. States supported:
  1. *Not Generated* (explaining token action).
  2. *Loading Skeleton*.
  3. *Generated* (summary + bullet points + "Generated 2h ago").
  4. *Stale* ("Data changed since generation" + Refresh action).
  5. *Error with Retry*.
  6. *Token Limit Reached*.

---

## 6. Implementation Checklist for New Prototype Tickets

When building a new ticket or screen prototype, verify this checklist:

- [ ] **Styles:** Only use tokens from `colors.semantic.css` and `tokens.css`. Do not declare ad-hoc hex colors.
- [ ] **Naming:** All custom CSS classes follow `.adm-*` naming.
- [ ] **Case:** All headers, field labels, button labels, and status badges are in **sentence case**.
- [ ] **Touch Targets:** All clickable triggers, chips, and buttons are at least `36px` tall.
- [ ] **Focus Rings:** All buttons, links, and inputs have visible `:focus-visible` styling.
- [ ] **Empty States:** Every table, feed, and filter list has a designed empty state with a reset or clear action.
- [ ] **Copyable IDs:** Any ID field uses `.adm-copyable` with masked data protection and polite screen reader announcements.
- [ ] **State Preservation:** Stored filters use versioned storage keys (`oxyzo:filter:v1:...`) and multi-tab synchronization.
- [ ] **Risk Signaling:** All red/danger indicators pair color with text or symbol (`▲`).
