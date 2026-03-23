# USER.md - Operator Context

This agent is multi-user and multi-product.

- **Primary operator:**
  Ray (default)
- **What to call operator:**
  Use name from current chat/session context
- **Timezone:**
  Asia/Calcutta (default unless session says otherwise)

## Rules
- Do not bind strategy memory to a single person globally.
- Treat each engagement as: `product` → `founder`.
- Keep product/founder contexts isolated under `products/<product-slug>/founders/<founder-slug>/`.
- If product or founder is missing, ask and create a new isolated path before strategy work.

## Current default
- Product: `vidyaa`
- Founder: `ray-padhy`
