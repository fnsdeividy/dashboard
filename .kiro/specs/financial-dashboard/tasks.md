# Implementation Plan: Financial Dashboard

## Overview

Build a React + TypeScript SPA with Vite and Tailwind CSS that loads cost data from a static JSON file and renders an interactive financial dashboard. The implementation follows a bottom-up approach: data layer and pure utility modules first, then UI components, then integration and wiring.

## Tasks

- [ ] 1. Set up project structure and core types
  - [x] 1.1 Initialize Vite + React + TypeScript project with Tailwind CSS
    - Run `npm create vite@latest` with React + TypeScript template
    - Install and configure Tailwind CSS
    - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom`
    - Configure Vitest in `vite.config.ts`
    - _Requirements: 10.1_

  - [x] 1.2 Define core TypeScript types and interfaces
    - Create `src/types.ts` with `CostEntry`, `Category`, `ProductFilter`, `SortColumn`, `AppState`, `CategorySummary`, `TypeSummary`, `ProductSummary` interfaces and types
    - Ensure all type definitions match the design document data models
    - _Requirements: 8.1_

  - [x] 1.3 Create static JSON data file
    - Create `public/data/costs.json` with cost entries spanning December 2025 to July 2026 for both Coffstack and BitWord products
    - Include entries across all 6 categories, both types (Fixo/Variável), and both essentiality flags
    - _Requirements: 8.1_

- [ ] 2. Implement pure utility modules
  - [x] 2.1 Implement `src/utils/formatters.ts`
    - Implement `formatBRL(value: number): string` — formats numbers as "R$ X.XXX,XX" with dot thousands separator and comma decimal separator
    - Implement `formatPercentage(value: number, decimals?: number): string` — formats percentage with configurable decimal places
    - Guard against NaN/undefined with fallback to "R$ 0,00"
    - _Requirements: 9.1, 3.1, 4.2_

  - [-] 2.2 Write property test for formatters (Property 4)
    - **Property 4: BRL currency formatting**
    - **Validates: Requirements 9.1, 3.1, 4.2**
    - Use fast-check to generate random non-negative numbers and verify output matches `R$ X.XXX,XX` pattern

  - [x] 2.3 Implement `src/utils/filters.ts`
    - Implement `filterByMonth(entries: CostEntry[], month: string): CostEntry[]`
    - Implement `filterByProduct(entries: CostEntry[], product: ProductFilter): CostEntry[]`
    - Implement `applyFilters(entries: CostEntry[], month: string, product: ProductFilter): CostEntry[]`
    - Implement `getLatestMonthWithData(entries: CostEntry[], availableMonths: string[]): string`
    - _Requirements: 1.2, 1.3, 2.2, 2.3_

  - [-] 2.4 Write property tests for filters (Properties 1, 2, 3)
    - **Property 1: Month filtering returns only matching entries**
    - **Validates: Requirements 1.2**
    - **Property 2: Default month is the latest month with data**
    - **Validates: Requirements 1.3**
    - **Property 3: Product filtering returns only matching entries**
    - **Validates: Requirements 2.2, 2.3**

  - [x] 2.5 Implement `src/utils/aggregations.ts`
    - Implement `computeTotal(entries: CostEntry[]): number` — sum of all `valor` values, returns 0 for empty
    - Implement `groupByCategory(entries: CostEntry[]): CategorySummary[]` — group, sum, compute percentages, sort descending
    - Implement `groupByType(entries: CostEntry[]): TypeSummary[]` — always returns both "Fixo" and "Variável" groups with count
    - Implement `groupByProduct(entries: CostEntry[]): ProductSummary[]` — always returns both "Coffstack" and "BitWord" groups
    - Implement `computePercentages<T>(groups: T[], grandTotal: number): (T & { percentage: number })[]`
    - _Requirements: 3.1, 3.2, 4.1, 4.3, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.4_

  - [-] 2.6 Write property tests for aggregations (Properties 5, 6, 7, 9)
    - **Property 5: Category breakdown correctness**
    - **Validates: Requirements 4.1, 4.3**
    - **Property 6: Type breakdown correctness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
    - **Property 7: Product comparison correctness**
    - **Validates: Requirements 7.1, 7.2, 7.4**
    - **Property 9: Total computation is sum of filtered entries**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 2.7 Implement `src/utils/sorting.ts`
    - Implement `sortEntries(entries: CostEntry[], column: SortColumn, direction: "asc" | "desc"): CostEntry[]`
    - Handle string columns (descricao, fornecedor, categoria, tipo) with locale-aware comparison
    - Handle numeric column (valor) with numeric comparison
    - Handle boolean column (essencial) with boolean comparison
    - _Requirements: 5.3_

  - [-] 2.8 Write property test for sorting (Property 8)
    - **Property 8: Column sorting correctness**
    - **Validates: Requirements 5.3**
    - Use fast-check to generate random CostEntry arrays and verify ordering invariants

- [x] 3. Checkpoint - Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement data loading layer
  - [x] 4.1 Implement `src/hooks/useDataLoader.ts`
    - Create custom hook that fetches `data/costs.json` on mount
    - Implement AbortController for 10-second timeout
    - Manage loading/error/ready states
    - Implement retry functionality
    - Extract available months list from loaded data
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 4.2 Implement `src/components/DataProvider.tsx`
    - Create context provider component wrapping `useDataLoader`
    - Render loading indicator while data loads
    - Render error state with retry button on failure
    - Disable all interactive controls during loading
    - Pass data to children via context on success
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. Implement UI components
  - [x] 5.1 Implement `src/components/FilterBar.tsx` with MonthSelector and ProductFilter
    - Create MonthSelector dropdown showing all months from December 2025 to July 2026
    - Create ProductFilter with options: "Coffstack", "BitWord", "Todos"
    - Accept `disabled` prop to disable during loading
    - Apply responsive styling (44x44px min touch targets on mobile)
    - _Requirements: 1.1, 1.4, 2.1, 2.4, 10.4_

  - [x] 5.2 Implement `src/components/KPICards.tsx`
    - Display "Custos do mês" KPI card with formatted BRL total
    - Display "BRL" currency indicator in the interface
    - Show error state when data loading fails
    - Stack vertically on viewports narrower than 768px
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 9.2, 10.2_

  - [x] 5.3 Implement `src/components/CategoryBreakdown.tsx`
    - Render summary table with Category name, total Valor BRL, and percentage columns
    - Display categories sorted by total descending (handled by aggregation module)
    - Omit categories with zero entries for current filters
    - Show empty state message when no data matches filters
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.4 Implement `src/components/TypeBreakdown.tsx`
    - Display "Fixo" and "Variável" groups with total, count, and percentage
    - Always show both types even when one has no entries
    - Display zero values for empty filter results
    - Format percentage to 1 decimal place
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 5.5 Implement `src/components/ProductComparison.tsx`
    - Display side-by-side comparison of Coffstack and BitWord totals
    - Show percentage each product represents of combined total (1 decimal place)
    - Hide section when Product_Filter is set to a single product
    - Display 0.00 and 0.0% for products with no entries in active month
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 5.6 Implement `src/components/VendorTable.tsx`
    - Render detailed table with columns: Descrição, Fornecedor, Categoria, Valor BRL, Tipo, Essencial
    - Implement sortable column headers with click-to-toggle behavior
    - Default sort: ascending by Descrição
    - Show empty state message when no entries match filters
    - Wrap table in horizontally-scrollable container on viewports <768px
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.3_

- [x] 6. Checkpoint - Component rendering verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Wire components together into Dashboard
  - [x] 7.1 Implement `src/components/Dashboard.tsx`
    - Consume data from DataProvider context
    - Manage filter state: selectedMonth (default from `getLatestMonthWithData`), selectedProduct (default "Todos")
    - Manage sort state: sortColumn (default "descricao"), sortDirection (default "asc")
    - Derive all computed data using pure utility functions (filteredEntries, monthTotal, categoryBreakdown, typeBreakdown, productComparison, sortedEntries)
    - Pass derived data and handlers to child components
    - Toggle sort direction on consecutive same-column clicks
    - Conditionally render ProductComparison based on selectedProduct
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 2.4, 3.3, 5.3, 7.3_

  - [x] 7.2 Implement `src/App.tsx` and integrate full component tree
    - Compose App → DataProvider → Dashboard
    - Apply responsive layout with Tailwind: viewport-aware grid/flex
    - Ensure no horizontal scrolling on viewports ≥360px
    - Apply global styles and responsive breakpoints
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 7.3 Write integration tests for Dashboard
    - Test full filter interaction flow (month change updates all sections)
    - Test product filter hides/shows comparison section
    - Test sort toggle behavior on vendor table
    - Test loading and error states
    - Test empty state displays
    - _Requirements: 1.2, 2.2, 3.3, 5.3, 7.3, 8.2, 8.3_

- [x] 8. Final checkpoint - Full application verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The data file (`costs.json`) should contain realistic sample data covering all categories, types, and both products across the full date range
- Product comparison uses month-filtered data (not product-filtered) to always show both products side by side
- All monetary formatting uses Brazilian Real format: `R$ X.XXX,XX`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.3", "2.5", "2.7"] },
    { "id": 3, "tasks": ["2.2", "2.4", "2.6", "2.8", "4.1"] },
    { "id": 4, "tasks": ["4.2", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2"] },
    { "id": 7, "tasks": ["7.3"] }
  ]
}
```
