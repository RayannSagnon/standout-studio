# Security Policy

## Supported versions

Only the latest production deployment of the Standout Studio marketing site
is supported for security fixes.

## Reporting a vulnerability

Please report security issues privately. Do not open a public GitHub issue
for vulnerabilities.

Email: **standout.studio.ottawa@gmail.com**

Include:

- A short description of the issue
- Steps to reproduce
- Impact assessment (what an attacker could do)
- Your contact details for follow-up

We aim to acknowledge reports within 2 business days.

## Scope

In scope:

- The public site at the production URL
- Client-side abuse of the contact form
- Secrets accidentally exposed in this repository

Out of scope:

- Third-party services we integrate with (Web3Forms, PostHog, Vercel), except
  where our configuration introduces a clear misconfiguration
- Social engineering against studio staff
- Denial-of-service volume testing without prior written approval

## Public tokens

Some values are intentionally public because they ship to the browser
(`NEXT_PUBLIC_*`), for example analytics project tokens and form access keys
designed for client-side submit. Report abuse of those endpoints; do not treat
their presence in the client bundle alone as a vulnerability.
