# 05 — Project Architecture (Source of Truth)

> **Version**: 1.0  
> **Last Updated**: 2026-05-13  
> **Status**: ACTIVE — All new code MUST follow this architecture.

---

## 1. Overview

Nyan Market follows a **Monorepo** structure with two independent applications:

```
nyan-market/
├── client/          # Next.js 14 (App Router) — Frontend
├── server/          # Node.js + Express — REST API Backend
├── docs/            # Project documentation
└── README.md
```

---

## 2. Backend Architecture — 3-Layer Pattern

### 2.1 Core Principle

```
HTTP Request
     ↓
┌─────────────┐
│   Routes    │  ← Defines HTTP method + path + middleware chain
└──────┬──────┘
       ↓
┌─────────────┐
│ Controllers │  ← Parses req, calls service, formats res
└──────┬──────┘
       ↓
┌─────────────┐
│  Services   │  ← ALL business logic + DB operations
└──────┬──────┘
       ↓
┌─────────────┐
│   Models    │  ← Mongoose schemas + instance methods
└─────────────┘
```

### 2.2 Layer Responsibilities

| Layer | File Pattern | Allowed To Do | NEVER Does |
|---|---|---|---|
| **Routes** | `*.routes.js` | Define endpoints, attach middlewares | Access DB, contain logic |
| **Controllers** | `*.controller.js` | Parse `req`, validate input, call services, send `res` | Query DB directly, contain business logic |
| **Services** | `*.service.js` | Business logic, DB queries via Models, call other services | Access `req`/`res`, send HTTP responses |
| **Models** | `*.js` (PascalCase) | Schema definition, indexes, instance/static methods, hooks | Contain business workflows |
| **Middlewares** | `*.middleware.js` / `*.js` | Auth, validation, file upload, error handling | Contain business logic |
| **Utils** | `*.js` | Pure helper functions (slug, formatting) | Access DB, access `req`/`res` |
| **Config** | `*.js` | External service config (DB, Cloudinary, etc.) | Contain business logic |

### 2.3 Backend Directory Tree

```
server/
├── .env
├── package.json
└── src/
    ├── server.js                    # Express app entry point
    │
    ├── config/
    │   ├── database.js              # MongoDB connection
    │   └── cloudinary.js            # Cloudinary SDK config
    │
    ├── models/
    │   ├── User.js
    │   ├── Shop.js
    │   ├── Product.js
    │   └── Category.js
    │
    ├── routes/
    │   ├── auth.routes.js           # /api/v1/auth/*
    │   ├── shop.routes.js           # /api/v1/shops/*
    │   ├── product.routes.js        # /api/v1/products/*
    │   ├── category.routes.js       # /api/v1/categories/*
    │   └── admin.routes.js          # /api/v1/admin/*
    │
    ├── controllers/
    │   ├── auth.controller.js       # Thin — delegates to auth.service
    │   ├── shop.controller.js       # Thin — delegates to shop.service
    │   ├── product.controller.js    # Thin — delegates to product.service
    │   ├── category.controller.js   # Exception: simple enough to be self-contained
    │   └── admin.controller.js      # Thin — delegates to admin.service
    │
    ├── services/
    │   ├── auth.service.js          # Auth business logic (OTP, JWT, login)
    │   ├── shop.service.js          # Shop registration, validation
    │   ├── product.service.js       # Product CRUD, merchant queries
    │   ├── admin.service.js         # Admin approval workflows
    │   └── email.service.js         # Nodemailer transporter & templates
    │
    ├── middlewares/
    │   ├── auth.middleware.js        # JWT verify + role authorization
    │   └── upload.js                # Multer + Cloudinary storage
    │
    ├── utils/
    │   ├── slug.js                  # Shared Vietnamese-safe slug generator
    │   └── cloudinary.utils.js      # Shared Cloudinary rollback helper
    │
    └── scripts/
        ├── seedAdmin.js
        └── seedCategories.js
```

### 2.4 Service Pattern Example

```javascript
// services/shop.service.js — Pure business logic, no req/res
const Shop = require("../models/Shop");
const { generateSlug } = require("../utils/slug");

const createShop = async (userId, shopData) => {
  // Check duplicate...
  // Generate slug...
  // Create in DB...
  return newShop;
};

module.exports = { createShop };
```

```javascript
// controllers/shop.controller.js — Thin HTTP wrapper
const shopService = require("../services/shop.service");

const registerShop = async (req, res) => {
  try {
    const shop = await shopService.createShop(req.user.id, req.body, req.files);
    return res.status(201).json({ success: true, data: { shop } });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
```

---

## 3. Frontend Architecture — Next.js 14 App Router

### 3.1 Core Principle

```
┌──────────────┐
│  app/ pages  │  ← Route segments + page components (UI + state)
└──────┬───────┘
       ↓ imports
┌──────────────┐     ┌──────────────┐
│  components/ │     │  services/   │  ← Reusable UI / API call functions
└──────────────┘     └──────┬───────┘
                            ↓ uses
                     ┌──────────────┐
                     │   store/     │  ← Zustand global state
                     └──────────────┘
```

### 3.2 Layer Responsibilities

| Layer | Path | Purpose | Rules |
|---|---|---|---|
| **app/** | `src/app/` | Route segments, pages, layouts | Pages call services for data. No raw `fetch()` in components. |
| **components/** | `src/components/` | Reusable UI components | Organized by domain: `layout/`, `product/`, `auth/`, etc. |
| **services/** | `src/services/` | API call functions | Each file maps to a backend domain. Handles `fetch`, auth headers, error parsing. |
| **store/** | `src/store/` | Zustand stores | Global client state (auth, cart, etc.) |
| **providers/** | `src/providers/` | React context providers | Auth initialization, theme, etc. |
| **types/** | `src/types/` | Shared TypeScript interfaces | Imported by services, components, and pages. |

### 3.3 Frontend Directory Tree

```
client/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout (AuthProvider + Header)
    │   ├── page.tsx                   # Home page (SSR)
    │   ├── not-found.tsx              # Global 404
    │   ├── error.tsx                  # Global error boundary
    │   ├── globals.css                # Design system tokens
    │   │
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   │
    │   ├── merchant/
    │   │   ├── layout.tsx             # Merchant sidebar layout
    │   │   ├── not-found.tsx          # Merchant 404
    │   │   ├── dashboard/page.tsx
    │   │   ├── products/page.tsx
    │   │   ├── products/new/page.tsx
    │   │   ├── orders/page.tsx
    │   │   └── register/page.tsx
    │   │
    │   └── (admin)/
    │       └── admin/merchants/page.tsx
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx
    │   │   └── HeaderWrapper.tsx
    │   ├── product/
    │   │   └── ProductCard.tsx
    │   └── auth/                      # (future: auth-specific UI)
    │
    ├── services/
    │   ├── auth.service.ts            # login, register, verifyOtp, getMe
    │   ├── shop.service.ts            # registerShop
    │   ├── product.service.ts         # getMerchantProducts, (future CRUD)
    │   └── admin.service.ts           # getShops, approveShop, rejectShop
    │
    ├── store/
    │   └── useAuthStore.ts            # Zustand auth state
    │
    ├── providers/
    │   └── AuthProvider.tsx           # Non-blocking auth initialization
    │
    └── types/
        └── index.ts                   # Shared interfaces (Product, User, Shop, etc.)
```

### 3.4 Service Pattern Example

```typescript
// services/product.service.ts — Centralized API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function getMerchantProducts(): Promise<Product[]> {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_URL}/products/my-products`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data.products;
}
```

```tsx
// app/merchant/products/page.tsx — Uses the service
import { getMerchantProducts } from "@/services/product.service";

useEffect(() => {
  getMerchantProducts()
    .then(setProducts)
    .catch(console.error)
    .finally(() => setIsLoading(false));
}, []);
```

---

## 4. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| **Models** | PascalCase singular | `User.js`, `Product.js` |
| **Routes** | kebab-case `.routes.js` | `auth.routes.js` |
| **Controllers** | kebab-case `.controller.js` | `auth.controller.js` |
| **Services** | kebab-case `.service.js` / `.service.ts` | `auth.service.js` |
| **Utils** | kebab-case `.js` / `.utils.js` | `slug.js`, `cloudinary.utils.js` |
| **Components** | PascalCase `.tsx` | `ProductCard.tsx`, `Header.tsx` |
| **Stores** | camelCase `use*.ts` | `useAuthStore.ts` |
| **Types** | PascalCase interfaces | `Product`, `UserData` |

---

## 5. API Response Format (Standard)

All API responses follow this structure:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... },              // Only on success
  "code": "ERROR_CODE",         // Only on specific errors
  "pagination": { ... }         // Only on list endpoints
}
```

---

## 6. Exceptions & Notes

- **`category.controller.js`**: Too simple (28 lines, single query) to justify a service layer. Left as self-contained.
- **`email.service.js`**: Already properly extracted as a service. No changes needed.
- **No `loading.tsx` files**: Managed via component-level state to avoid Next.js Suspense traps.
