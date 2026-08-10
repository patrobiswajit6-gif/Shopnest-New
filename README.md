# ShopNest — React E-Commerce Web App

A multi-page e-commerce storefront built with **React + Vite**, styled with plain CSS (no UI framework), using **React Router** for navigation and the **Context API** for global state. Product data is pulled live from the public [DummyJSON Products API](https://dummyjson.com/docs/products) — nothing product-related is hardcoded.

## Tech stack
- React 18 (function components + hooks only)
- React Router v6 (client-side routing)
- Context API — `AuthContext`, `CartContext`, `OrderContext`
- Vite (dev server / bundler)
- Plain CSS with design tokens (`src/index.css`)
- `fetch` calls to `https://dummyjson.com` (categories, category listing, product detail, search)

## Getting started
```bash
npm install
npm run dev
```
Then open the printed local URL (default `http://localhost:5173`).

To create a production build:
```bash
npm run build
npm run preview
```

## Folder structure
```
src/
  api/productsApi.js        DummyJSON fetch wrappers (categories, search, by id, by category)
  context/                  AuthContext, CartContext, OrderContext (Context API)
  components/                Navbar, Footer, ProductCard, CategoryCard, ProtectedRoute, Loader
  pages/                     One file per route/page
  utils/                     localStorage helpers + GST/coupon pricing logic
```

## Feature walkthrough
1. **Sign Up / Sign In** — accounts are created client-side and stored in `localStorage` (`AuthContext`); passwords are never sent anywhere since there's no backend in this brief. Every other route is wrapped in `ProtectedRoute` and redirects to `/signin` until a session exists.
2. **Home** — categories are fetched from `/products/categories` and rendered dynamically; fashion/footwear/men/women-flavoured categories are surfaced first, with the rest under "Browse all categories." Trending products come from `/products`.
3. **Category & Search pages** — `/category/:slug` calls `/products/category/:slug`; `/search?q=` calls `/products/search`.
4. **Product detail** — image gallery, quantity stepper, **Add to Cart** and **Buy Now** (Buy Now adds the item then jumps straight to checkout).
5. **Cart** (`CartContext`) — persisted per signed-in user in `localStorage`; quantity update/remove, live subtotal.
6. **Checkout** — delivery address form (or pick a previously saved address); saved to the user's profile.
7. **Payment** — UPI / Debit-Credit Card / Cash on Delivery, plus a coupon field (`FLIP10`, `NEST50`, `WELCOME15`). **GST (18%) is automatically applied whenever the cart subtotal exceeds ₹3,000**, per the brief (`src/utils/pricing.js`).
8. **Order tracking** — every order gets a live-simulated shipment timeline (Placed → Confirmed → Shipped → Out for Delivery → Delivered) driven by elapsed time, viewable at `/order/:orderId`.
9. **Settings** — profile summary plus full **order history**, per-order **tracking status**, and a **refund request** flow (available once an order shows Delivered) with its own simulated Requested → Approved → Refunded timeline.

## Notes for grading / demo
- No product, category, price, or order data is hardcoded — everything shopping-related comes from the DummyJSON API or from what the signed-in user actually does in the app.
- Because the brief scopes this to HTML/CSS/JS/React only, authentication and order storage are intentionally client-side (`localStorage`) rather than a real backend/database.
- Tracking and refund stages advance automatically over a few minutes purely for demo purposes (no server, no cron job) — see `getTrackingStage` / `getRefundStage` in `src/context/OrderContext.jsx` if you want to change the timing.
