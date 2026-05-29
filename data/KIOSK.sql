DROP TABLE IF EXISTS favorites;

DROP TABLE IF EXISTS product_categories;

DROP TABLE IF EXISTS spots;

DROP TABLE IF EXISTS products;

DROP TABLE IF EXISTS categories;

DROP TABLE IF EXISTS users;

CREATE TABLE
  users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    admin INTEGER NOT NULL DEFAULT 0
  );

CREATE TABLE
  categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT
  );

CREATE TABLE
  products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url TEXT,
    published_at TEXT NOT NULL
  );

CREATE TABLE
  product_categories (
    product_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
  );

CREATE TABLE
  spots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

CREATE TABLE
  favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    UNIQUE (user_id, product_id)
  );

INSERT INTO
  categories (name, slug, description, image_url)
VALUES
  (
    'Citrus',
    'citrus',
    'Bright, sharp, wide awake. For mornings and Mondays.',
    '/images/categories/citrus.webp'
  ),
  (
    'Botanicals',
    'botanicals',
    'The slow sippers. Herbal, layered, best with a window seat.',
    '/images/categories/botanicals.webp'
  ),
  (
    'Staples',
    'staples',
    'The ones you order every time. No explanation needed.',
    '/images/categories/staples.webp'
  ),
  (
    'Seasonal',
    'seasonal',
    'Limited. Ingredient-led. Here and then gone.',
    '/images/categories/seasonal.webp'
  );

INSERT INTO
  products (
    name,
    slug,
    sku,
    brand,
    description,
    price,
    image_url,
    published_at
  )
VALUES
  (
    'Cucumber + Yuzu + Sea Salt',
    'cucumber-yuzu-sea-salt',
    'CUY001',
    'KIOSK',
    'Light, clean, slightly unexpected.',
    49,
    '/images/products/cucumber-yuzu-sea-salt.webp',
    '2026-04-10'
  ),
  (
    'Watermelon Rooibos',
    'watermelon-rooibos',
    'WAR002',
    'KIOSK',
    'Sweet without trying. Summer in a bottle.',
    45,
    '/images/products/watermelon-rooibos.webp',
    '2026-03-28'
  ),
  (
    'Ginger Lemonade No. 3',
    'ginger-lemonade-no-3',
    'GIN003',
    'KIOSK',
    'The third attempt was the one. Sharp, balanced, perfect.',
    52,
    '/images/products/ginger-lemonade-no-3.webp',
    '2026-04-12'
  ),
  (
    'The Weekday',
    'the-weekday',
    'WEE004',
    'KIOSK',
    'Your daily. Simple, reliable, unreasonably good.',
    39,
    '/images/products/the-weekday.webp',
    '2026-02-18'
  ),
  (
    'Sunday Morning',
    'sunday-morning',
    'SUN005',
    'KIOSK',
    'A slow-sip botanical for late starts and soft landings.',
    55,
    '/images/products/sunday-morning.webp',
    '2026-04-13'
  ),
  (
    'Pear + Sea Salt',
    'pear-sea-salt',
    'PEA006',
    'KIOSK',
    'Quiet, crisp, a little strange in the best way.',
    51,
    '/images/products/pear-sea-salt.webp',
    '2026-03-21'
  ),
  (
    'Strawberry Basil',
    'strawberry-basil',
    'STB007',
    'KIOSK',
    'Green, juicy, and gone before you are ready.',
    53,
    '/images/products/strawberry-basil.webp',
    '2026-04-08'
  ),
  (
    'Grapefruit Tonic',
    'grapefruit-tonic',
    'GRT008',
    'KIOSK',
    'Bitter in the best way.',
    48,
    '/images/products/grapefruit-tonic.webp',
    '2026-01-30'
  );

INSERT INTO
  product_categories (product_id, category_id)
VALUES
  (1, 1),
  (1, 4),
  (2, 4),
  (3, 1),
  (3, 4),
  (4, 3),
  (5, 2),
  (5, 4),
  (6, 3),
  (7, 2),
  (7, 4),
  (8, 1),
  (8, 2);

INSERT INTO
  spots (title, image_url, link_url, sort_order)
VALUES
  (
    'Cucumber + Yuzu',
    '/images/spots/cucumber.webp',
    '/products/cucumber-yuzu-sea-salt',
    1
  ),
  (
    'Strawberry Basil',
    '/images/spots/strawberry.webp',
    '/products/strawberry-basil',
    2
  ),
  (
    'Grapefruit Tonic',
    '/images/spots/grapefruit.webp',
    '/products/grapefruit-tonic',
    3
  );