# Platinum Liquors

An online storefront and delivery web application built for **Platinum Liquors**, serving customers in Nakuru and surrounding areas. The platform offers seamless browsing, product selection, real-time reviews, and a 50/50 M-Pesa deposit checkout pipeline.

## Features

-Instant Catalog & Filtering: Browse spirits, beers, wines, and mixers with quick category filters.
-50/50 Split Payment Model: Secure 50% M-Pesa deposit required at checkout via automated STK Push, with the remaining 50% balance paid upon delivery inspection.
-Customer Review Feed: Interactive rating and media upload functionality for verified customer delivery feedback.
-Frictionless Shopping: Dynamic browser-based cart management with zero registration barriers for fast ordering.
-Fully Responsive: Optimized UI for mobile, tablet, and desktop viewports.

## Tech Stack

-Frontend: HTML5, CSS3 (Custom Grid & Flexbox, Parallax UI), JavaScript (ES6+)
-Backend & Database: [Supabase](https://supabase.com/) (PostgreSQL & Storage Buckets)
-Payment Integration: Safaricom M-Pesa Express (STK Push API)
-Deployment & Hosting: Netlify / GitHub Pages

## Repository Structure

├── index.html # Gateway entry point & redirect handler
├── home.html # Main landing banner & services overview
├── catalog.html # Live drinks menu & customer reviews
├── checkout.html # Shopping cart summary & M-Pesa payment form
├── style.css # Centralized stylesheet
├── supabase-client.js # Supabase database connection bootstrap
├── catalog.js # Dynamic catalog rendering & review submissions
├── checkout.js # Cart state logic & M-Pesa payload dispatch
└── images/ # Store graphics, favicons, & meta thumbnails

## Local Setup & Development

-​Clone the repository:

git clone [https://github.com/SkylerVee/Platinum-Liquor.git](https://github.com/SkylerVee/platinum-liquors.git)
cd platinum-liquors

-​Configure Environment Variables:

Update public/config.js with your Supabase credentials:
window.SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
window.SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

-​Run Locally:

Open index.html in any modern web browser or run via Live Server in VS Code.

​# License & Legal

​Restricted to individuals 18 years of age and older.
​© 2026 Platinum Liquors. All Rights Reserved.
