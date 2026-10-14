# SEO deployment checklist — Zuha Kanji portfolio

This package contains source-level SEO improvements. It has **not** been deployed to the live domain, and Google indexing or ranking cannot be guaranteed.

## Changes made in this package

- Refined the homepage title to lead with the exact name and professional role.
- Refined the meta description to explain the profile naturally.
- Added explicit index/follow directives and large-image preview preferences.
- Completed Open Graph and X/Twitter sharing metadata.
- Replaced the single Person JSON-LD block with a connected `WebSite`, `ProfilePage`, and `Person` graph. The details are based on the existing website content; verify employment, education, membership, and contact details before publishing.
- Kept the existing apex-domain canonical URL (`https://zuhakanji.in/`) and sitemap URL consistent.

## Before deploying

1. Review all personal, employment, education, membership, publication, and contact claims for accuracy and permission to publish.
2. Commit the changed `index.html` and this checklist to the GitHub branch connected to your deployment.
3. Deploy through the existing Vercel or Netlify project. No build command should be needed for this plain static site.
4. Confirm that `https://zuhakanji.in/` loads successfully and that `https://www.zuhakanji.in/` redirects to the apex domain with a permanent redirect (or deliberately choose `www` as the primary domain and update every canonical/social/sitemap URL consistently). Do not leave both hostnames serving duplicate versions.
5. Check these URLs in a browser:
   - `https://zuhakanji.in/`
   - `https://zuhakanji.in/robots.txt`
   - `https://zuhakanji.in/sitemap.xml`
   - `https://zuhakanji.in/og-image.png`
6. Use Google's Rich Results Test / Schema Markup Validator to validate the structured data. A valid schema does not guarantee a rich result.
7. Add the domain property in Google Search Console, verify ownership, inspect the homepage URL, and submit `https://zuhakanji.in/sitemap.xml`.
8. In Search Console, monitor indexing and search performance. Request indexing after deployment if appropriate; crawling and ranking can take time.

## Important limits

- `robots.txt` currently permits crawling and points to the sitemap.
- `sitemap.xml` currently lists only the homepage, which is appropriate for this one-page static site. Do not list pages that do not exist.
- The website is a single-page portfolio. Section anchors (`#about`, `#work`, etc.) are not separate search landing pages. Add new pages only when they contain genuinely distinct, useful content.
- The current canonical is the apex domain, not `www`. This package does not change DNS, domain settings, redirects, GitHub, Vercel, Netlify, or Google Search Console.
- No keyword stuffing or unsupported employer claims should be added. Ranking for a person's full name is a more focused goal than ranking for broad phrases such as “geotechnical engineer” or a company name alone.
