# Requirements Document

## Introduction

A web frontend dashboard for visualizing monthly operational costs across two products (Coffstack and BitWord). The dashboard replaces an existing spreadsheet and provides interactive filtering by month and product, with cost breakdowns by category, vendor, and type. Data spans from December 2025 to July 2026.

## Glossary

- **Dashboard**: The web frontend application that displays cost data visualizations and summaries
- **Cost_Entry**: A single row of cost data containing date, product, category, description, vendor, value, type, essentiality, and notes
- **Product**: One of the two business products tracked: "Coffstack" or "BitWord"
- **Category**: A cost classification: Ferramentas/SaaS, Taxas e Impostos, Equipe/Prestadores, Contabilidade/Jurídico, Hospedagem/Cloud, or Marketing
- **Month_Selector**: The UI control that allows the user to pick which month's data is displayed
- **Product_Filter**: The UI control that allows the user to filter data by one product, the other, or both
- **KPI_Card**: A summary metric displayed prominently at the top of the dashboard
- **Cost_Type**: Classification of a cost as either "Fixo" (fixed) or "Variável" (variable)
- **Essential_Flag**: A boolean marker indicating whether a cost is essential ("Sim") or not ("Não")

## Requirements

### Requirement 1: Month Selection

**User Story:** As a business owner, I want to select a specific month to analyze, so that I can see cost data for that period.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Month_Selector control with all available months from December 2025 to July 2026
2. WHEN the user selects a month from the Month_Selector, THE Dashboard SHALL update all displayed data to reflect only Cost_Entries for the selected month within 2 seconds
3. WHEN the Dashboard loads for the first time, THE Dashboard SHALL pre-select the latest month in the December 2025 to July 2026 range that contains at least one Cost_Entry, and display data for that month
4. IF the user selects a month that contains no Cost_Entries, THEN THE Dashboard SHALL display an empty state message indicating no cost data is available for the selected month

### Requirement 2: Product Filtering

**User Story:** As a business owner, I want to filter costs by product, so that I can understand how much each product costs independently.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Product_Filter control with options: "Coffstack", "BitWord", and "Todos" (all)
2. WHEN the user selects a single Product in the Product_Filter, THE Dashboard SHALL display only Cost_Entries associated with that Product
3. WHEN the user selects "Todos" in the Product_Filter, THE Dashboard SHALL display Cost_Entries for both Products
4. WHEN the Dashboard loads for the first time, THE Dashboard SHALL set the Product_Filter to "Todos"

### Requirement 3: Monthly Cost Summary KPIs

**User Story:** As a business owner, I want to see key financial metrics at a glance, so that I can quickly assess the financial health of my products.

#### Acceptance Criteria

1. THE Dashboard SHALL display a KPI_Card showing "Custos do mês" as the sum of all Valor BRL values from the filtered Cost_Entries, formatted in BRL currency with 2 decimal places and thousands separators (e.g., "R$ 1.234,56")
2. IF no Cost_Entries match the selected Month_Selector and Product_Filter combination, THEN THE Dashboard SHALL display "R$ 0,00" in the "Custos do mês" KPI_Card
3. WHEN the Month_Selector or Product_Filter changes, THE Dashboard SHALL recalculate and update all KPI_Cards within 1 second
4. IF the cost data fails to load, THEN THE Dashboard SHALL display an error indication in the KPI_Card and preserve the last successfully loaded value until new data is available

### Requirement 4: Cost Breakdown by Category

**User Story:** As a business owner, I want to see costs grouped by category, so that I can identify which areas consume the most resources.

#### Acceptance Criteria

1. THE Dashboard SHALL display a summary table grouping filtered Cost_Entries by Category, showing for each Category: the Category name, the total Valor BRL, and the percentage that Category represents of the overall filtered total
2. THE Dashboard SHALL format the total Valor BRL for each Category as Brazilian currency with exactly 2 decimal places
3. THE Dashboard SHALL sort the Category summary table by total Valor BRL in descending order
4. WHEN no Cost_Entries exist for a Category in the selected filters, THE Dashboard SHALL omit that Category from the summary table
5. IF the selected filters result in zero Cost_Entries across all Categories, THEN THE Dashboard SHALL display the summary table area with a message indicating no data is available for the selected filters

### Requirement 5: Cost Breakdown by Vendor

**User Story:** As a business owner, I want to see which tools and vendors I pay for, so that I can evaluate individual subscriptions and services.

#### Acceptance Criteria

1. THE Dashboard SHALL display a detailed table listing each Cost_Entry matching the current filters
2. THE Dashboard SHALL show the following columns in the detailed table: Descrição, Fornecedor, Categoria, Valor BRL, Tipo, and Essencial
3. WHEN the user selects a column header, THE Dashboard SHALL sort the detailed table by that column, toggling between ascending and descending order on consecutive selections, with the default sort being ascending by Descrição
4. WHEN the user changes the Month_Selector or Product_Filter, THE Dashboard SHALL update the detailed table to show only matching Cost_Entries
5. IF no Cost_Entries match the current filters, THEN THE Dashboard SHALL display a message indicating that no entries were found for the selected filters

### Requirement 6: Cost Breakdown by Type

**User Story:** As a business owner, I want to see how costs are split between fixed and variable expenses, so that I can understand my cost structure.

#### Acceptance Criteria

1. THE Dashboard SHALL display a summary grouping filtered Cost_Entries by Cost_Type ("Fixo" and "Variável"), showing both types even when one has no entries in the current filter
2. THE Dashboard SHALL show the total Valor BRL (formatted to 2 decimal places) and the count of Cost_Entries for each Cost_Type
3. THE Dashboard SHALL show the percentage each Cost_Type represents of the total filtered costs, rounded to 1 decimal place
4. IF no Cost_Entries exist in the filtered set, THEN THE Dashboard SHALL display the cost breakdown summary with zero values for both Cost_Types

### Requirement 7: Product Cost Comparison

**User Story:** As a business owner, I want to compare costs between Coffstack and BitWord side by side, so that I can understand relative cost distribution.

#### Acceptance Criteria

1. WHILE the Product_Filter is set to "Todos", THE Dashboard SHALL display a comparison section showing total Valor BRL for each Product (Coffstack and BitWord) formatted with 2 decimal places and grouped-thousands separator, scoped to the active Month_Filter period
2. WHILE the Product_Filter is set to "Todos", THE Dashboard SHALL show the percentage each Product represents of the total combined cost for the active Month_Filter period, rounded to 1 decimal place, where percentages sum to 100%
3. WHEN the Product_Filter is set to a single Product, THE Dashboard SHALL hide the product comparison section
4. IF a Product has no cost entries for the active Month_Filter period, THEN THE Dashboard SHALL display that Product in the comparison section with a Valor BRL of 0.00 and a percentage of 0.0%

### Requirement 8: Data Loading

**User Story:** As a business owner, I want the dashboard to load cost data reliably, so that I always see accurate information.

#### Acceptance Criteria

1. WHEN the Dashboard starts, THE Dashboard SHALL load all Cost_Entries from the data source within 10 seconds
2. IF the data source fails to respond within 10 seconds or returns a network error, THEN THE Dashboard SHALL display an error message indicating the data could not be retrieved and SHALL provide a retry option for the user to attempt loading again
3. WHILE data is being loaded, THE Dashboard SHALL display a loading indicator and SHALL disable all interactive controls (Month_Selector, Product_Filter)
4. WHEN data loading completes successfully, THE Dashboard SHALL remove the loading indicator and enable all interactive controls
5. IF the user activates the retry option after a loading failure, THEN THE Dashboard SHALL display the loading indicator and attempt to load all Cost_Entries from the data source again

### Requirement 9: Currency Display

**User Story:** As a business owner, I want all monetary values displayed in Brazilian Reais (BRL), so that values are clear and consistent.

#### Acceptance Criteria

1. THE Dashboard SHALL format all Valor BRL values using the Brazilian Real currency format (R$ X.XXX,XX)
2. THE Dashboard SHALL display "BRL" as the selected currency in the interface

### Requirement 10: Responsive Layout

**User Story:** As a business owner, I want the dashboard to be usable on different screen sizes, so that I can check costs from my desktop or mobile device.

#### Acceptance Criteria

1. THE Dashboard SHALL render all controls, charts, and data tables within the viewport width without page-level horizontal scrolling on viewports 360px wide or larger
2. WHILE the viewport is narrower than 768px, THE Dashboard SHALL stack KPI_Cards vertically instead of horizontally
3. WHILE the viewport is narrower than 768px, THE Dashboard SHALL display data tables within a horizontally-scrollable container that does not exceed the viewport width
4. WHILE the viewport is narrower than 768px, THE Dashboard SHALL render all interactive elements (buttons, dropdowns, date pickers) with a minimum touch-target size of 44×44 CSS pixels
