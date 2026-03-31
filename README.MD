# Quick Exam Gen

Use AI to quickly generate variants from an uploaded exam.

# Core workflow

- User uploads exam file (PDF, docx, plaintext) → creates project
- AI extracts questions → saved to project metadata
- User edits questions (optional)
- User configures: number of variants, target language
- AI generates variants
- User edits variants (optional)
- User selects export options (variants, answer sheets) → download as PDF

# Billing model

- User purchases coin packages
- User spends coins to export/download variants
- Low balance → top-up prompt
- Transaction ledger: append-only, auditable history (purchases + spending)

# Database + Auth: Supabase

- Supabase: database, auth, Edge Functions
- Billing: RPC calls (Service Role only)
- Payment webhooks: Edge Functions with Service Role
- Projects: user-tied with RLS enforcement