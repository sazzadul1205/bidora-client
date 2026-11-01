# Bidora – Online Auction Platform

**Bidora** is a web-based auction platform designed to make online buying and selling more transparent, secure, and reliable. It provides dedicated experiences for buyers, sellers, and administrators, with auction management, wallet-based transactions, deposit-backed bidding, escrow payments, and dispute resolution.

The frontend is built with React and Vite and communicates with the Bidora backend API.

## Features

### Public Marketplace

- Browse available products and auctions.
- View individual auction details.
- Explore auction listings and product information.
- Access platform information, Terms of Use, and Privacy Policy.
- Register and log in to an account.

### Buyer Dashboard

- Access a dedicated buyer dashboard.
- View and manage bidding activity.
- Track won auctions.
- Access wallet information and transactions.
- Manage account and profile information.

### Seller Dashboard

- Access a dedicated seller dashboard.
- Create and manage product listings.
- Edit and view product details.
- Monitor seller auctions.
- View sales information.
- Manage wallet and account information.

### Admin Dashboard

- Monitor platform activities.
- Manage users and products.
- Manage product categories.
- Manage auctions.
- Review user verifications.
- Manage deposits.
- Review and resolve disputes.
- Monitor platform wallet and transactions.
- View sales information.

### Transaction and Security Features

- JWT-based authenticated application workflows.
- Role-based frontend route protection.
- Profile completion checks.
- Wallet-based transaction management.
- Deposit-backed auction participation.
- Escrow-based payment workflows.
- Dispute management interfaces.

## Technology Stack

| Technology         | Purpose                           |
| ------------------ | --------------------------------- |
| React 19           | Frontend UI                       |
| Vite 8             | Development server and build tool |
| React Router DOM 7 | Client-side routing               |
| Tailwind CSS 4     | Styling                           |
| Axios              | HTTP requests                     |
| React Hook Form    | Form management                   |
| Lucide React       | Icons                             |
| SweetAlert2        | Notifications and alerts          |
| ESLint             | Code quality and linting          |

## Project Structure

```text
bidora-client/
│
├── public/
│
├── src/
│   ├── components/
│   │   └── Auth/
│   │
│   ├── Layouts/
│   │   ├── PublicLayout/
│   │   └── AuthenticatedLayout/
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   ├── Frontend/
│   │   ├── admin/
│   │   ├── buyer/
│   │   ├── seller/
│   │   ├── Wallet/
│   │   └── Unauthorized/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (compatible with Vite 8).
- npm.
- Git.
- Bidora backend API running and accessible.

### 1. Clone the Repository

```bash
git clone https://github.com/sazzadul1205/bidora-client.git
```

### 2. Navigate to the Project

```bash
cd bidora-client
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Backend Connection

Open `vite.config.js` and configure the API proxy target to match your backend server.

Current configuration:

```javascript
server: {
  proxy: {
    "/api": {
      target: "http://10.192.168.204:5102",
      changeOrigin: true,
    },
    "/uploads": {
      target: "http://10.192.168.204:5102",
      changeOrigin: true,
    },
  },
},
```

If your backend runs locally, update the target to your local backend address and port.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at the local development URL displayed by Vite.

### 6. Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist/` directory.

### 7. Preview Production Build

```bash
npm run preview
```

## Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Starts the Vite development server |
| `npm run build`   | Builds the production application  |
| `npm run lint`    | Runs ESLint                        |
| `npm run preview` | Previews the production build      |

## Application Routes

The application uses React Router DOM for navigation.

### Public Routes

| Route          | Description         |
| -------------- | ------------------- |
| `/`            | Product marketplace |
| `/auctions`    | Browse auctions     |
| `/auction/:id` | Auction details     |
| `/about`       | About Bidora        |
| `/terms`       | Terms of Use        |
| `/privacy`     | Privacy Policy      |
| `/login`       | User login          |
| `/register`    | User registration   |

### Admin Routes

| Route                  | Description           |
| ---------------------- | --------------------- |
| `/admin/dashboard`     | Admin dashboard       |
| `/admin/users`         | User management       |
| `/admin/products`      | Product management    |
| `/admin/deposits`      | Deposit management    |
| `/admin/verifications` | User verification     |
| `/admin/auctions`      | Auction management    |
| `/admin/disputes`      | Dispute management    |
| `/admin/categories`    | Category management   |
| `/admin/wallet`        | Platform wallet       |
| `/admin/transactions`  | Platform transactions |
| `/admin/sales`         | Sales management      |

### Buyer Routes

| Route              | Description     |
| ------------------ | --------------- |
| `/buyer/dashboard` | Buyer dashboard |
| `/buyer/bids`      | My bids         |
| `/buyer/won`       | Won auctions    |

### Seller Routes

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

| Route              | Description              |
| ------------------ | ------------------------ |
| `/wallet`          | User wallet              |
| `/settings`        | Account settings         |
| `/profile-pending` | Profile completion page  |
| `/unauthorized`    | Unauthorized access page |

## Authentication and Route Protection

Bidora uses dedicated route guards to control frontend navigation:

- **GuestGuard:** Restricts guest-only pages to unauthenticated users.
- **RoleGuard:** Restricts protected routes according to user roles.
- **ProfileCompletionGuard:** Requires profile completion before accessing designated Buyer and Seller features.
- **AuthenticatedLayout:** Provides the shared layout for authenticated users.

Supported application roles:

- Admin
- Buyer
- Seller

**Note:** Frontend route protection is for navigation and user experience. Actual authorization and security must also be enforced by the backend API.

## Backend Integration

The frontend communicates with the Bidora backend through HTTP API requests using Axios.

The Vite development server proxies requests from:

- `/api`
- `/uploads`

These requests are forwarded to the configured backend server.

## Project Status

Bidora is an actively developed auction platform project. Its frontend is organized around three main user roles, with dedicated marketplace, transaction, account management, and administrative interfaces.

## Repository

GitHub: https://github.com/sazzadul1205/bidora-client

## License

No open-source license has currently been specified. All rights are reserved by the repository owner unless a license is added.
