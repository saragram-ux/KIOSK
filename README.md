# KIOSK

**KIOSK** is a full-stack webshop project built with **Node.js, Express, EJS and SQLite**.

The concept is a Copenhagen-inspired hydration brand: seasonal drinks, clean product cards, a quiet editorial feeling, and a simple ecommerce flow. The original assignment/wireframes are based on a fashion store structure, but I adapted the visual concept into a drinks brand while keeping the required technical structure.

The project is built as a school project for **Backend-utveckling 1** and focuses on dynamic routing, SQLite, EJS views/partials, sessions, admin CRUD, image uploads and responsive design.

---

## Concept

KIOSK is a small digital storefront for canned drinks.

The brand direction is:

- minimal
- fresh
- editorial
- slightly premium
- mobile-first
- built around products, categories, favorites and basket flow

The idea was not to copy the wireframes visually one-to-one, but to follow their structure and technical purpose while giving the project its own brand identity.

---

## Assignment focus

The project demonstrates:

- Express routing
- EJS templates
- reusable partials
- SQLite database structure
- dynamic content from database
- public webshop pages
- admin pages
- form handling
- sessions
- basket/cart logic
- favorites logic
- image uploads
- responsive layout
- Git workflow with feature branches

---

## Tech stack

- **Node.js**
- **Express**
- **EJS**
- **SQLite**
- **CSS**
- **JavaScript**
- **express-session**
- **Multer**
- **Phosphor Icons**

---

## Main features

### Public shop

- Homepage with dynamic hero content
- Desktop-only spots section
- Product cards rendered from SQLite
- Product listing page
- Product detail pages
- Category pages
- Search results page
- News page for recently published products
- Favorites page
- Basket page
- Responsive mobile-first layout

### Products

Products are stored in SQLite and rendered dynamically.

Each product includes:

- name
- slug
- SKU
- brand
- description
- price
- image URL
- publish date

Product cards are reused across homepage, categories, search, news, favorites and related products.

### Product detail page

Each product has its own detail page based on its slug.

The product detail page includes:

- product image
- favorite heart
- product name
- brand
- description
- price
- add to basket button
- related products slider

The related products are fetched dynamically from the database.

### Categories

Categories are stored in SQLite and rendered dynamically.

The category navigation is generated from the database, and each category page shows products connected through a join table.

### Search

The search page lists products where the product name matches the search query.

It includes:

- search heading
- result count
- product grid
- empty state
- link back to all products

### News

The news page shows products published within the last 7 days.

The products are fetched dynamically from SQLite based on `published_at`.

### Basket

The basket is session-based.

Users can:

- add products
- update quantity
- remove products
- see item totals
- see basket total

The basket uses a mobile-first layout and becomes a semantic table layout on tablet/desktop.

### Favorites

Favorites work in two ways:

- anonymous users: favorites are stored in the session
- logged-in users: favorites are stored in the database

The heart icons show filled/empty states depending on current favorite state.

### Account

Users can:

- register
- log in
- log out

The header changes depending on login state.

### Admin

The admin area is protected and only available for admin users.

Admin users can:

- view products
- create products
- edit products
- delete products
- upload product images
- view categories
- create categories
- edit categories
- delete categories
- upload category images

The admin pages are styled as a dashboard with sidebar navigation on larger screens and a mobile-first stacked layout on smaller screens.

---

## Project structure

```txt
KIOSK/
├── app.js
├── routes/
│   ├── index.js
│   ├── admin.js
│   └── users.js
├── middleware/
│   └── requireAdmin.js
├── data/
│   ├── KIOSK.sql
│   ├── KIOSK.db
│   └── db.js
├── views/
│   ├── layouts/
│   │   └── public.ejs
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   ├── hero.ejs
│   │   ├── product-card.ejs
│   │   ├── category-card.ejs
│   │   ├── spots.ejs
│   │   ├── usp.ejs
│   │   └── admin-sidebar.ejs
│   ├── index.ejs
│   ├── products.ejs
│   ├── product.ejs
│   ├── category.ejs
│   ├── search.ejs
│   ├── news.ejs
│   ├── basket.ejs
│   ├── favorites.ejs
│   ├── login.ejs
│   ├── register.ejs
│   └── admin-*.ejs
├── public/
│   ├── images/
│   ├── javascripts/
│   └── stylesheets/
└── package.json
```

---

## Main routes

### Public routes

```txt
GET /                     Homepage
GET /products             Product listing
GET /products/:slug       Product detail
GET /categories/:slug     Category page
GET /search?q=...         Search results
GET /news                 Recently published products
GET /favorites            Favorites page
GET /basket               Basket page
GET /register             Register page
GET /login                Login page
POST /logout              Logout
```

### Basket routes

```txt
POST /basket/add/:slug
POST /basket/update/:slug
POST /basket/remove/:slug
```

### Favorite routes

```txt
POST /favorites/toggle/:slug
```

### Admin product routes

```txt
GET /admin/products
GET /admin/products/new
POST /admin/products/new
GET /admin/products/:id/edit
POST /admin/products/:id/edit
POST /admin/products/:id/delete
```

### Admin category routes

```txt
GET /admin/categories
GET /admin/categories/new
POST /admin/categories/new
GET /admin/categories/:id/edit
POST /admin/categories/:id/edit
POST /admin/categories/:id/delete
```

---

## Database

The project uses SQLite.

The SQL setup file is:

```txt
data/KIOSK.sql
```

The database file is:

```txt
data/KIOSK.db
```

Main tables:

```txt
users
categories
products
product_categories
favorites
spots
```

### Rebuild database

To rebuild the database from the SQL file:

```bash
sqlite3 data/KIOSK.db < data/KIOSK.sql
```

If you need to recreate the database from scratch:

```bash
rm data/KIOSK.db
sqlite3 data/KIOSK.db < data/KIOSK.sql
```

---

## Installation

Install dependencies:

```bash
npm install
```

Start the project:

```bash
npm run dev
```

Then open:

```txt
http://localhost:3000
```

If your environment uses the standard Express start script instead, run:

```bash
npm start
```

---

## Admin access

Admin routes are protected with middleware.

To access admin pages, the logged-in user must have:

```txt
admin = 1
```

in the `users` table.

For testing, a user can be made admin manually in SQLite:

```sql
UPDATE users
SET admin = 1
WHERE email = 'your@email.com';
```

Then log in and visit:

```txt
/admin/products
```

---

## Image uploads

Image uploads are handled with Multer.

Product images are saved in:

```txt
public/images/products
```

Category images are saved in:

```txt
public/images/categories
```

The saved image path is stored in the database as `image_url`.

Example:

```txt
/images/products/cucumber-yuzu-sea-salt.webp
```

---

## SKU validation

Products include a SKU field.

The SKU format is:

```txt
ABC123
```

That means:

- 3 uppercase letters
- 3 numbers

The admin form includes browser validation and backend validation.

Example valid SKU:

```txt
CUY001
```

---

## Responsive design

The project is built mobile-first.

Responsive behavior includes:

- header stacks on mobile
- navigation adapts across breakpoints
- hero stacks on mobile/tablet and becomes two columns on desktop
- product grids adapt across breakpoints
- spots section only appears on desktop
- USP section stacks on mobile and becomes columns on larger screens
- footer works as mobile accordion and desktop columns
- basket is mobile-first and becomes table layout on tablet/desktop
- admin pages stack on mobile and become dashboard/sidebar layout on larger screens

---

## Design system

The CSS is built around custom properties for:

- colors
- typography
- spacing
- radius
- layout rhythm

The visual direction is based on:

- newsprint-like neutral base
- black typography
- acid green accent
- clean product cards
- minimal admin dashboard
- strong responsive structure

---

## Wireframe adaptations

The supplied wireframes are based on a fashion store. KIOSK adapts the same structure into a drinks brand.

Examples of adaptations:

- clothing products became canned drinks
- clothing categories became flavor/mood categories
- product images became drink/can images
- the basket route remains `/basket`
- the admin structure follows the original product/category CRUD flow
- the visual style was adapted to match the KIOSK brand

The technical and structural requirements are still followed:

- dynamic products from SQLite
- dynamic categories
- product detail pages
- search
- news page
- basket
- favorites
- login/register
- protected admin area
- admin image uploads
- responsive layout
- reusable EJS partials

---

## Git workflow

The project uses feature branches and clear commits.

Examples of branches/features:

```txt
news-page
products-page
active-navigation
admin-image-upload
db-favorites
product-sku-validation
homepage-spots
wireframe-layout-polish
readme-presentation
```

Example commit messages:

```txt
feat: add news page for recently published products
feat: add products listing page
feat: store logged-in favorites in database
feat: add SKU field with validation to products
feat: add dynamic spots partial to homepage
fix: align homepage with responsive wireframes
fix: align product detail with responsive wireframes
fix: align basket with responsive wireframes
fix: align admin pages with responsive wireframes
docs: add project README
```

Branches are merged into `main` when the feature or fix is complete.

---

## Development notes

Some important implementation choices:

### Sessions

Sessions are used for:

- logged-in user state
- anonymous favorites
- basket state

### Favorites

Favorites use a hybrid approach:

- session storage for anonymous users
- database storage for logged-in users

This makes the feature work before login, while still allowing persistent favorites for accounts.

### Basket

The basket is session-based because the project does not include a full order/payment system.

### Admin

The admin section is protected with middleware and uses a dashboard-style layout.

### Layouts and partials

The project uses EJS layouts and partials to avoid repeating shared UI.

Important partials:

```txt
header.ejs
footer.ejs
hero.ejs
product-card.ejs
category-card.ejs
spots.ejs
usp.ejs
admin-sidebar.ejs
```

---

## Known limitations

This project is built for a school assignment and has some intentional limitations:

- passwords are stored as plain text
- checkout button is visual only
- no payment integration
- no order history
- uploaded images are stored locally
- uploaded image files are not automatically deleted when products/categories are deleted
- admin account setup is manual through the database
- search only checks product names

---

## Final handoff checklist

Before handoff:

```txt
[ ] npm install works
[ ] app starts locally
[ ] database can be rebuilt from KIOSK.sql
[ ] homepage loads
[ ] product listing loads
[ ] product detail works
[ ] basket add/update/remove works
[ ] favorites work logged out
[ ] favorites work logged in
[ ] register/login/logout works
[ ] admin product CRUD works
[ ] admin category CRUD works
[ ] image uploads work
[ ] responsive layout checked on mobile/tablet/desktop
```

---

## Reflection

The main goal was to build a working full-stack webshop with a clear backend structure, dynamic data and a responsive frontend.

The biggest learning points were:

- connecting Express routes with SQLite queries
- structuring EJS views and partials
- working with sessions
- separating anonymous and logged-in behavior
- building admin CRUD routes
- handling image uploads
- keeping commits and branches organized
- adapting wireframes without losing the assignment requirements

KIOSK is intentionally simple, but it has the core structure of a real ecommerce application.