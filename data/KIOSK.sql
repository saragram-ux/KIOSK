DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  admin INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  published_at TEXT NOT NULL
);

CREATE TABLE product_categories (
  product_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

INSERT INTO categories (name, slug, description, image_url) VALUES
  ('Citrus', 'citrus', 'Bright, sharp, wide awake. For mornings and Mondays.', '/images/categories/citrus.jpg'),
  ('Botanicals', 'botanicals', 'The slow sippers. Herbal, layered, best with a window seat.', '/images/categories/botanicals.jpg'),
  ('Staples', 'staples', 'The ones you order every time. No explanation needed.', '/images/categories/staples.jpg'),
  ('Seasonal', 'seasonal', 'Limited. Ingredient-led. Here and then gone.', '/images/categories/seasonal.jpg');

INSERT INTO products (name, slug, brand, description, price, image_url, published_at) VALUES
  ('Cucumber + Yuzu + Sea Salt', 'cucumber-yuzu-sea-salt', 'KIOSK', 'Light, clean, slightly unexpected.', 49, '/images/products/cucumber-yuzu-sea-salt.jpg', '2026-04-10'),
  ('Watermelon Rooibos', 'watermelon-rooibos', 'KIOSK', 'Sweet without trying. Summer in a bottle.', 45, '/images/products/watermelon-rooibos.jpg', '2026-03-28'),
  ('Ginger Lemonade No. 3', 'ginger-lemonade-no-3', 'KIOSK', 'The third attempt was the one. Sharp, balanced, perfect.', 52, '/images/products/ginger-lemonade-no-3.jpg', '2026-04-12'),
  ('The Weekday', 'the-weekday', 'KIOSK', 'Your daily. Simple, reliable, unreasonably good.', 39, '/images/products/the-weekday.jpg', '2026-02-18'),
  ('Sunday Morning', 'sunday-morning', 'KIOSK', 'A slow-sip botanical for late starts and soft landings.', 55, '/images/products/sunday-morning.jpg', '2026-04-13'),
  ('Pear + Sea Salt', 'pear-sea-salt', 'KIOSK', 'Quiet, crisp, a little strange in the best way.', 51, '/images/products/pear-sea-salt.jpg', '2026-03-21'),
  ('Strawberry Basil', 'strawberry-basil', 'KIOSK', 'Green, juicy, and gone before you are ready.', 53, '/images/products/strawberry-basil.jpg', '2026-04-08'),
  ('Grapefruit Tonic', 'grapefruit-tonic', 'KIOSK', 'Bitter in the best way.', 48, '/images/products/grapefruit-tonic.jpg', '2026-01-30');

INSERT INTO product_categories (product_id, category_id) VALUES
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