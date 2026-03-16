# Products Directory

Use product-first isolation to avoid context bleed.

## Rule
Create one product folder per product/project, then separate founders inside that product.

## Structure
- `products/<product-slug>/overview.md`
- `products/<product-slug>/notes.md`
- `products/<product-slug>/founders/<founder-slug>/profile.md`
- `products/<product-slug>/founders/<founder-slug>/memory.md`
- `products/<product-slug>/founders/<founder-slug>/step-01-founder-insight.md`
- `products/<product-slug>/founders/<founder-slug>/step-02-market-narrative.md`
- `products/<product-slug>/founders/<founder-slug>/step-03-territory-definition.md`
- `products/<product-slug>/founders/<founder-slug>/step-04-content-pillars.md`
- `products/<product-slug>/founders/<founder-slug>/step-05-signature-series.md`
- `products/<product-slug>/founders/<founder-slug>/editorial-guidelines.md`
- `products/<product-slug>/founders/<founder-slug>/idea-graph.md`
- `products/<product-slug>/founders/<founder-slug>/audience-resonance.md`
- `products/<product-slug>/founders/<founder-slug>/pattern-library.md`

## Naming
- `product-slug`: lowercase kebab-case (e.g., `vidyaa`, `ai-recruiter`)
- `founder-slug`: lowercase kebab-case full name or handle (e.g., `ray-padhy`)
