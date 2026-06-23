<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Code hygiene

- New components must be imported by a page or another component — do not leave orphan files.
- Put API/business logic in `lib/services` and `lib/repositories`; route handlers stay thin wrappers.
- Run `npm run check` before committing (lint + test + knip dead-code scan).
