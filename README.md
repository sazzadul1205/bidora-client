# Bidora — Online Auction Platform (Frontend)

**Bidora** is a web-based auction platform that makes online buying and selling transparent, secure, and reliable. It provides dedicated experiences for buyers, sellers, and administrators, with auction management, wallet-based transactions, deposit-backed bidding, escrow payments, delivery tracking, and dispute resolution.

The frontend is a **React 19 + Vite 8** single-page application that communicates with the **Bidora backend API** over HTTP (Axios).

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Application Routes](#application-routes)
9. [Authentication & Route Protection](#authentication--route-protection)
10. [Backend Integration](#backend-integration)
11. [API Response Handling](#api-response-handling)
12. [Code Splitting](#code-splitting)
13. [Project Status](#project-status)
14. [Repository & License](#repository--license)

---

## Overview

Bidora is a multi-role auction marketplace. The client is organized around four experiences:

- **Public marketplace** — browse products/auctions, view details, register/login.
- **Buyer** — bid, buy out, track bids/wins, pay, confirm receipt, dispute, wallet.
- **Seller** — manage products, auctions, sales, dispatch, disputes, wallet.
- **Admin** — users, product approvals, deposits, verifications, disputes, auctions, categories, platform wallet, roles, transactions, sales.

All monetary flows (deposits, bidding reservations, escrow, payouts, penalties) are reflected through the backend wallet and displayed in the UI.

---

## Features

### Public Marketplace

- Browse products (home) and auctions with search, category filter, status tabs, and pagination.
- Auction detail page with image gallery, countdown timer, bid history, bid placement, and buyout.
- Platform pages: About, Terms of Use, Privacy Policy.
- Register and login (guest-only routes).

### Buyer

- Buyer dashboard (active bids, leading bids, won count, awaiting-payment alerts, balances).
- My Bids (search, status filter, pagination).
- Won Auctions (pay, confirm receipt, raise dispute, view dispatch details).
- Wallet (overview, transactions, reservations, deposit requests, disputes tabs).
- Deposit funds (method, amount, reference, receipt image).
- Profile completion / KYC submission.

### Seller

- Seller dashboard (listings, live auctions, earnings, available balance, awaiting-dispatch alerts).
- Product management (create/edit/view/delete, image dropzone, submit/withdraw, re-auction).
- Seller auction view (bids on own auctions).
- Sales (search, status filter, revenue totals, dispatch, report non-delivery, raise dispute).
- Wallet and account settings.

### Admin

- Admin dashboard.
- Users (list, role counts, create admin, edit, reset password, lock/unlock, details).
- Products (pending approvals, review/approve/reject).
- Deposits (pending/all, approve/reject).
- Verifications (NID review, verify/reject).
- Disputes (list, start review, resolve, details).
- Auctions (all, configure, cancel, view bids).
- Categories (create/delete).
- Platform wallet, transactions, sales, roles.

### Transaction & Security

- JWT-based authenticated workflows.
- Role-based route protection and profile-completion gating.
- Wallet balances, escrow, and transaction/reservation views.
- Offline/online status banner and connection monitoring.

---

## Technology Stack

| Technology         | Purpose                       |
| ------------------ | ----------------------------- |
| React 19           | UI library                    |
| Vite 8             | Dev server, build tool, HMR   |
| React Router DOM 7 | Client-side routing           |
| Tailwind CSS 4     | Styling                       |
| Axios              | HTTP client                   |
| React Hook Form    | Form management               |
| Lucide React       | Icons                         |
| SweetAlert2        | Toasts, confirmations, alerts |
| React Helmet Async | Document head management      |
| ESLint             | Linting                       |

---

## Project Structure

```text
bidora-client/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── GuestGuard.jsx
│   │   │   ├── RoleGuard.jsx
│   │   │   └── ProfileCompletionGuard.jsx
│   │   ├── Pagination/Pagination.jsx
│   │   ├── AuctionCard.jsx
│   │   ├── AuctionLoader.jsx
│   │   ├── CategorySearchBox.jsx
│   │   ├── Countdown.jsx
│   │   ├── OfflineBanner.jsx
│   │   ├── PageTitle.jsx
│   │   └── Skeleton.jsx
│   │
│   ├── context/
│   │   ├── ThemeProvider.jsx
│   │   └── theme-context.js
│   │
│   ├── hooks/
│   │   └── useOnlineStatus.js
│   │
│   ├── Layouts/
│   │   ├── PublicLayout/PublicLayout.jsx
│   │   └── AuthenticatedLayout/AuthenticatedLayout.jsx
│   │
│   ├── Shared/
│   │   ├── Navbar/Navbar.jsx
│   │   └── Footer/Footer.jsx
│   │
│   ├── services/
│   │   ├── authApi.js       # Axios instance, auth, profile, interceptors
│   │   ├── publicApi.js     # Public catalog/auction endpoints
│   │   ├── buyerApi.js      # Buyer + shared wallet/bid/sale/dispute
│   │   ├── sellerApi.js     # Seller product/auction/sale/dispute
│   │   └── adminApi.js      # Admin management endpoints
│   │
│   ├── utils/
│   │   ├── currency.js
│   │   ├── date.js
│   │   ├── image.js
│   │   ├── theme.js
│   │   └── toast.js
│   │
│   ├── pages/
│   │   ├── Auth/            # Login, Register, Settings (+ Profile/Password/Verification tabs)
│   │   ├── Frontend/        # Products, Auctions, AuctionDetails, About, Terms, Privacy
│   │   ├── admin/           # Dashboard, Users, Products, Deposits, Verifications,
│   │   │                    # Disputes, Auctions, Categories, Wallet, Roles,
│   │   │                    # Transactions, Sales (+ modals)
│   │   ├── buyer/           # Dashboard, MyBids, WonAuctions (+ modals)
│   │   ├── seller/          # Dashboard, MyProducts, CreateProduct, EditProduct,
│   │   │                    # ViewProduct, SellerAuctionView, Sales (+ modals)
│   │   ├── Wallet/          # Wallet (+ Overview/Transactions/Reservations/
│   │   │                    # DepositRequests/Disputes tabs)
│   │   ├── ProfilePending/
│   │   └── Unauthorized/
│   │
│   ├── App.jsx              # Routes + guards
│   ├── main.jsx             # React root (HelmetProvider + ThemeProvider)
│   └── index.css
│
├── .env
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (compatible with Vite 8) and npm
- Git
- The Bidora backend API running and reachable

### 1. Clone the Repository

```bash
git clone https://github.com/sazzadul1205/bidora-client.git
cd bidora-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Backend Connection

Create or edit `.env` in the project root:

```bash
VITE_API_BASE_URL=http://<backend-host>:<port>/api
```

Examples:

```bash
# Local backend
VITE_API_BASE_URL=https://localhost:7285/api

# LAN backend
VITE_API_BASE_URL=http://10.192.168.204:5102/api
```

The Vite dev server also proxies `/api` and `/uploads` to a backend target (see `vite.config.js`). Update the proxy target if you rely on the proxy instead of `VITE_API_BASE_URL`.

### 4. Start the Development Server

```bash
npm run dev
```

Vite prints the local URL (e.g. `http://localhost:5173`).

### 5. Build for Production

```bash
npm run build
```

Output is written to `dist/`.

### 6. Preview the Production Build

```bash
npm run preview
```

---

## Environment Variables

| Variable            | Required | Description                                                     |
| ------------------- | -------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL of the backend API, including the `/api` path segment. |

> Only variables prefixed with `VITE_` are exposed to client code. Never put secrets in the frontend env.

---

## Available Scripts

| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR.       |
| `npm run build`   | Build the production bundle into `dist/`. |
| `npm run lint`    | Run ESLint.                               |
| `npm run preview` | Serve the production build locally.       |

---

## Application Routes

Routing uses `BrowserRouter` with two layouts: **PublicLayout** (guests) and **AuthenticatedLayout** (logged-in users).

### Public Routes

| Route          | Description                |
| -------------- | -------------------------- |
| `/`            | Product marketplace (home) |
| `/auctions`    | Browse auctions            |
| `/auction/:id` | Auction details            |
| `/about`       | About Bidora               |
| `/terms`       | Terms of Use               |
| `/privacy`     | Privacy Policy             |
| `/login`       | Login (guest-only)         |
| `/register`    | Registration (guest-only)  |

### Admin Routes (`/admin/*`, role `Admin`, staff allowed)

| Route                  | Description           |
| ---------------------- | --------------------- |
| `/admin/dashboard`     | Admin dashboard       |
| `/admin/users`         | User management       |
| `/admin/products`      | Product approvals     |
| `/admin/deposits`      | Deposit management    |
| `/admin/verifications` | NID verification      |
| `/admin/auctions`      | Auction management    |
| `/admin/disputes`      | Dispute management    |
| `/admin/categories`    | Category management   |
| `/admin/wallet`        | Platform wallet       |
| `/admin/roles`         | Role management       |
| `/admin/transactions`  | Platform transactions |
| `/admin/sales`         | Sales management      |

### Buyer Routes (`/buyer/*`, role `Buyer`, profile-complete)

| Route              | Description     |
| ------------------ | --------------- |
| `/buyer/dashboard` | Buyer dashboard |
| `/buyer/bids`      | My bids         |
| `/buyer/won`       | Won auctions    |

### Seller Routes (`/seller/*`, role `Seller`, profile-complete)

| Route                       | Description            |
| --------------------------- | ---------------------- |
| `/seller/dashboard`         | Seller dashboard       |
| `/seller/products`          | My products            |
| `/seller/products/create`   | Create product         |
| `/seller/products/edit/:id` | Edit product           |
| `/seller/products/view/:id` | View product           |
| `/seller/sales`             | Seller sales           |
| `/seller/auctions/:id`      | Seller auction details |

### Shared Authenticated Routes

| Route              | Description                               |
| ------------------ | ----------------------------------------- |
| `/wallet`          | Wallet (Buyer/Seller/Admin)               |
| `/settings`        | Account settings                          |
| `/profile-pending` | Profile completion / verification pending |
| `/unauthorized`    | Access denied page                        |

---

## Authentication & Route Protection

The client stores the JWT and role information in `localStorage` after login.

| Key                     | Contents                                 |
| ----------------------- | ---------------------------------------- |
| `token`                 | JWT access token                         |
| `roles`                 | JSON array of roles                      |
| `tokenExpiresInMinutes` | Token lifetime in minutes (from backend) |

Route guards (`src/components/Auth/`):

- **GuestGuard** — restricts guest-only pages (`/login`, `/register`) to unauthenticated users; validates token expiry by decoding the JWT and clears stale tokens.
- **RoleGuard** — restricts routes by role; calls `GET /auth/me` and reads `account.roles`. Supports an `allowStaff` option for admin/staff roles.
- **ProfileCompletionGuard** — requires completed profile (name, phone, address, city, NID) and `verificationStatus === "Verified"` before Buyer/Seller features; Admins bypass.
- **AuthenticatedLayout** — shared shell for authenticated users (navbar, wallet fetch, offline banner).

Supported roles: `Admin`, `Super Admin`, `Seller`, `Buyer` (plus custom roles from the backend).

> **Note:** Frontend route protection is for navigation/UX only. Real authorization is enforced by the backend API.

---

## Backend Integration

- All requests go through Axios instances in `src/services/`.
- `authApi.js` creates the base Axios instance with `baseURL = import.meta.env.VITE_API_BASE_URL` and request/response interceptors for debug logging.
- Protected requests attach the token via `getAuthConfig()`:

  ```js
  export const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } : {};
  };
  ```

- Multipart requests (product images, NID images, receipts, tracking/receipt proof) set `Content-Type: multipart/form-data` and send `FormData`.

### Service modules

| File           | Responsibility                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `authApi.js`   | Auth, current user, profile update, password change, `getAuthConfig`.                                                          |
| `publicApi.js` | Categories, auction list/detail, home feed.                                                                                    |
| `buyerApi.js`  | Buyer dashboard/bids/won, bid placement, buyout, wallet, deposits, pay/confirm, disputes, verification.                        |
| `sellerApi.js` | Seller dashboard/products/auctions/sales/dispatch/non-delivery/disputes/verification.                                          |
| `adminApi.js`  | Admin dashboard, users, products, deposits, auctions, verifications, disputes, categories, roles, wallet, transactions, sales. |

> `authApi.js` currently has `DEBUG = true` for request/response logging. Set it to `false` for production.

---

## API Response Handling

The backend returns a standardized envelope. The client reads:

- **Payload** → `response.data.data`
- **Pagination** → `response.data.pagination` (`page`, `pageSize`, `totalCount`)
- **Message** → `response.data.message`

Examples:

```js
// Paginated list
const items = res.data.data || [];
const total = res.data.pagination?.totalCount || 0;

// Current user (login/me)
const user = res.data.data; // { account, profile }
```

Login response shape (backend):

```json
{
  "status": 200,
  "message": "Login successful.",
  "data": {
    "token": "...",
    "roles": ["Buyer"],
    "email": "...",
    "expiresInMinutes": 120
  }
}
```

---

## Code Splitting

Currently all pages are imported eagerly in `App.jsx`, so Vite produces one main bundle. For larger builds you can convert page imports to `React.lazy` and wrap `<Routes>` in a `<Suspense>` fallback (e.g. `AuctionLoader`) to emit per-route chunks and reduce the initial bundle size.

---

## Project Status

Bidora is an actively developed auction platform. The frontend covers the public marketplace, buyer, seller, and admin experiences with wallet, escrow, delivery, and dispute flows wired to the backend API.

---

## Repository & License

**GitHub:** https://github.com/sazzadul1205/bidora-client

No open-source license has been specified. All rights are reserved by the repository owner unless a license is added.
