# Platinum Liquors

Platinum Liquors is a polished, mobile-friendly liquor storefront experience built with plain HTML, CSS, and JavaScript. It includes:

- a premium landing page
- a dynamic catalog experience
- a checkout flow with cart totals
- Supabase-backed product and order support

## Features

- Responsive layout for desktop and mobile
- Smooth animated sections
- Catalog cards with size and quantity selection
- Local cart persistence
- Supabase integration for products and orders

## Project Structure

- `index.html` — login/auth entry page
- `home.html` — landing page
- `catalog.html` — product catalog
- `checkout.html` — checkout form
- `style.css` — shared styling
- `*.js` — page behavior and Supabase integration
- `images/` — visual assets

## Getting Started

1. Clone the repository
2. Open the project in a simple local server (such as Live Server)
3. Make sure your local Supabase config is available in `supabase-config.local.js`
4. Visit the site in your browser

## Notes

- Keep your Supabase URL and anon key in a local-only file such as `supabase-config.local.js`
- Do not commit secrets or your `.env` file
- The project uses a static front-end structure, so a local server is recommended
