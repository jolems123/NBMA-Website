# Launch checklist — NBMA

- [ ] Board approves institution profile, service descriptions and website launch.
- [ ] Review and approve website privacy notice and terms; establish retention/deletion process.
- [ ] Verify official address, phone numbers, mailbox and logo/brand usage.
- [ ] Attach PostgreSQL service, configure `DATABASE_URL`, test a full enquiry and membership submission.
- [ ] Confirm that records appear in database; perform a backup/restore exercise on a safe copy.
- [ ] Restrict database access and enable production monitoring/alerts.
- [ ] Add licensed, compressed manufacturing MP4 to `public/media/manufacturing-hero.mp4`.
- [ ] Test video playback and static fallback on desktop, mobile and poor connections.
- [ ] Test all 11 page URLs, navigation, mobile menu, form errors and keyboard accessibility.
- [ ] Test publication of survey link and Google Forms response access.
- [ ] Run `npm run check && npm test`; do not enable GitHub CI.
- [ ] Connect custom domain and verify HTTPS / SEO canonical URLs.
- [ ] Check pages with an accessibility tool and a performance audit before public invitations.
- [ ] Ensure no fabricated metrics, testimonials or unapproved partnership claims.
- [ ] Approve standard procedures for responding to membership applications and contact requests.
