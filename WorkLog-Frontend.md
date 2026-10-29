# Frontend Work Log — Bidora Client

**Project:** Bidora Client (React + Vite)  
**Repository:** `D:\Sazzadul_PTSL_236_Intern\Sazzadul React\Bidora Project\bidora-client`  
**Branch:** `master`  
**Total Commits:** 56  
**Last Updated:** Thursday, 29 October 2026, 11:10 AM

---

## 1. Work Completed on 29 October 2026

### 8:00 AM — Auction Management and Dashboard Updates

#### Seller Sales Dashboard

- Verified that Total Sales, Awaiting Dispatch, and Revenue cards display counts and values returned by the backend.
- Removed client-side filtering and unclear “(page)” labels from dashboard statistics.

#### Won Auctions

- Updated `WonAuctions.jsx` to read the paginated response from `res.data.data?.items`, matching the backend response structure.

#### Admin Auction Management

- Added a Result / Winner column to the auction history table, displaying:
  - Auction result (Sold or NoWinner)
  - Winner's name
  - Winning bid amount
  - Total bid count
- Replaced Seller ID with the seller's name, with a truncated ID as a fallback.
- Moved the bid count into a red notification badge on the Bids button for active auctions.
- Extended the bid-count badge to Completed and Cancelled auction tabs.

#### Validation

ESLint passed with zero errors.

### 10:40 AM — Currency Standardization

- Created a shared `formatCurrency()` utility in `src/utils/currency.js` to format currency using the Bangladeshi Taka symbol (৳).
- Replaced duplicated `formatMoney()` implementations in eight files with the shared utility.
- Updated currency symbols in:
  - `BuyerDashboard`
  - `AdminDashboard`
  - `Users`
  - `BidsModal`
- Added missing Taka symbols in:
  - `ViewProduct`
  - `MyProducts`
  - `SellerAuctionView`
  - `AdminProducts` ReviewModal

#### Validation

ESLint passed with zero errors.

### 11:00 AM — Dispute Resolution Fix

**File:** `ResolveModal.jsx`

- Removed the **System** fault-type radio option because the backend rejects the combination of System fault and Apply Penalty.
- Removed the unused `ShieldAlert` import.

#### Validation

ESLint passed with zero errors.

### 11:10 AM — Online Status and Polling Optimization

**File:** `useOnlineStatus.js`

- Paused `/category` polling while the browser tab is hidden (`document.hidden` check added to interval and timeout).
- Added a `visibilitychange` listener to resume polling when the tab becomes visible again.

**Purpose:** Reduce unnecessary background network requests when the application is not actively viewed.

#### Validation

ESLint passed with zero errors. Production build passed successfully.

### 12:30 PM — Currency Import Path Fixes

**Files:** `Wallet.jsx`, `ReviewModal.jsx`

- Fixed incorrect relative import path for `formatCurrency` util in `Wallet.jsx` (`../../../utils/currency` → `../../utils/currency`).
- Fixed incorrect relative import path for `formatCurrency` util in `ReviewModal.jsx` (`../../../utils/currency` → `../../../../utils/currency`).
- Production build: 2081 modules transformed, built successfully with zero errors.

---

## 2. Commit History Overview

**Total commits:** 60  
**Latest recorded commit:** `03bd82e` — `fix(ui): correct currency util import paths in Wallet.jsx and ReviewModal.jsx`

### 29 October — Auction Management and UI Improvements

- Added bid counts and auction winner details to admin views.
- Fixed won-auction response handling.
- Prevented negative wallet balances and improved navigation.
- Standardized currency formatting to BDT.
- Refactored auction and product pages to use reusable components.
- Removed System fault-type option from ResolveModal (backend rejects it).
- Paused online-status polling when browser tab is hidden.
- Fixed currency util import paths in Wallet.jsx and ReviewModal.jsx.

### 28 October — Pagination and Data Fetching

- Implemented server-side pagination and filtering for auctions.
- Migrated search and filtering from client-side to server-side processing.
- Added pagination across admin, buyer, and seller pages.
- Updated frontend handling of paginated API responses.
- Improved loading states, data fetching, connection monitoring, and auction status logic.

### 27 October — Authentication, Routing, and Core Workflows

- Added live bid polling to auction details.
- Improved bid status indicators and mobile-responsive layouts.
- Refactored authentication, route guards, and role-based navigation.
- Organized admin dashboard pages and modal components.
- Implemented seller dispatch workflows with tracking evidence.
- Added financial ledger and sales management modules.
- Improved dispute management and API service organization.
- Updated API base URL and development proxy configuration.

### 26 October — Auction, Wallet, and Dispute Features

- Implemented role-based dashboards and routing.
- Added platform wallet functionality and enhanced user management.
- Improved receipt confirmation and non-delivery reporting.
- Added dispute-raising workflows for buyers and sellers.
- Implemented seller auction and product management.
- Added deposit request tracking and modularized wallet dashboard tabs.
- Improved auction management and administrative oversight.

### 25 October — Project Setup and Authentication

- Initialized the React + Vite project with ESLint.
- Established project architecture, styling, and routing.
- Created service layers for admin, buyer, and seller APIs.
- Implemented protected routes and React Hook Form integration.
- Added buyer and seller routes, dashboard layouts, and loading skeletons.
- Improved profile management, verification workflows, and settings pages.
- Fixed ESLint errors and refined admin dashboard layouts.

---

## 3. Current Project Status

- **Frontend:** React + Vite
- **Routing:** Role-based navigation for admin, buyer, and seller
- **API integration:** Separate service layers for each role
- **Auction management:** Server-side pagination and filtering, bid counts, and result details
- **Wallet:** Balance handling, currency formatting, and deposit request tracking
- **Disputes:** Buyer/seller dispute workflows and administrative resolution
- **Seller workflows:** Product management, sales, dispatch, and tracking evidence
- **Authentication:** Protected routes and profile verification workflows
- **UI quality:** Responsive layouts, reusable components, and improved loading states
- **Code quality:** Latest recorded ESLint checks passed with zero errors

---

## 4. Latest Validation

The following checks were recorded on 29 October:

| Time     | Area                                     | Result  |
| -------- | ---------------------------------------- | ------- |
| 8:00 AM  | Auction management and dashboard updates | Passed  |
| 10:40 AM | Currency standardization                 | Passed  |
| 11:00 AM | Dispute resolution modal                 | Passed  |
| 11:10 AM | Online status and polling optimization   | Passed  |

All ESLint checks passed with zero errors for every change recorded above.
