# 5. Domain and DNS

The domain appears in:

- every share link
- Stripe's return links
- password reset emails
- link previews on WhatsApp and iMessage

---

## Testing

Nothing to set up.

- Local: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- Test copy on Vercel: `NEXT_PUBLIC_SITE_URL=https://<project>.vercel.app`

Share links and Stripe return links are built from this value, so it must match wherever you're opening the site. If the domain is wrong, you'll be sent to the wrong place after paying.

---

**Going live?** See [`docs/live/`](../live/README.md).
