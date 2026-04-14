var express = require("express");
var router = express.Router();
const db = require("../data/db");

router.get("/", function (req, res, next) {
  const productsSql = `
    SELECT id, name, slug, brand, price, image_url, published_at
    FROM products
    WHERE date(published_at) <= date('now')
    ORDER BY date(published_at) DESC
    LIMIT 8
  `;

  const categoriesSql = `
    SELECT id, name, slug, description, image_url
    FROM categories
    ORDER BY name ASC
  `;

  db.all(productsSql, [], (productsErr, productRows) => {
    if (productsErr) {
      return next(productsErr);
    }

    const products = productRows.map((product) => {
      const publishedDate = new Date(product.published_at);
      const now = new Date();
      const diffInMs = now - publishedDate;
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      return {
        ...product,
        is_new: diffInDays < 7,
      };
    });

    db.all(categoriesSql, [], (categoriesErr, categories) => {
      if (categoriesErr) {
        return next(categoriesErr);
      }

      res.render("index", {
        title: "KIOSK",
        products,
        categories,
      });
    });
  });
});

router.get("/categories/:slug", function (req, res, next) {
  const categorySlug = req.params.slug;

  const categorySql = `
    SELECT id, name, slug, description
    FROM categories
    WHERE slug = ?
    LIMIT 1
  `;

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  db.get(categorySql, [categorySlug], (categoryErr, category) => {
    if (categoryErr) {
      return next(categoryErr);
    }

    if (!category) {
      return res.status(404).render("error", {
        message: "Category not found",
        error: {},
      });
    }

    const productsSql = `
      SELECT p.id, p.name, p.slug, p.brand, p.price, p.image_url, p.published_at
      FROM products p
      INNER JOIN product_categories pc ON p.id = pc.product_id
      WHERE pc.category_id = ?
        AND date(p.published_at) <= date('now')
      ORDER BY date(p.published_at) DESC
    `;

    db.all(productsSql, [category.id], (productsErr, productRows) => {
      if (productsErr) {
        return next(productsErr);
      }

      const products = productRows.map((product) => {
        const publishedDate = new Date(product.published_at);
        const now = new Date();
        const diffInMs = now - publishedDate;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        return {
          ...product,
          is_new: diffInDays < 7,
        };
      });

      db.all(navCategoriesSql, [], (navErr, categories) => {
        if (navErr) {
          return next(navErr);
        }

        res.render("category", {
          title: `${category.name} | KIOSK`,
          category,
          categories,
          products,
        });
      });
    });
  });
});

router.get("/search", function (req, res, next) {
  const query = req.query.q ? req.query.q.trim() : "";

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  if (!query) {
    return db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      res.render("search", {
        title: "Search | KIOSK",
        categories,
        query: "",
        products: [],
      });
    });
  }

  const productsSql = `
    SELECT id, name, slug, brand, price, image_url, published_at
    FROM products
    WHERE date(published_at) <= date('now')
      AND name LIKE ?
    ORDER BY date(published_at) DESC
  `;

  db.all(productsSql, [`%${query}%`], (productsErr, productRows) => {
    if (productsErr) {
      return next(productsErr);
    }

    const products = productRows.map((product) => {
      const publishedDate = new Date(product.published_at);
      const now = new Date();
      const diffInMs = now - publishedDate;
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      return {
        ...product,
        is_new: diffInDays < 7,
      };
    });

    db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      res.render("search", {
        title: `Search: ${query} | KIOSK`,
        categories,
        query,
        products,
      });
    });
  });
});

router.get("/products/:slug", function (req, res, next) {
  const productSlug = req.params.slug;

  const productSql = `
    SELECT id, name, slug, brand, description, price, image_url, published_at
    FROM products
    WHERE slug = ?
      AND date(published_at) <= date('now')
    LIMIT 1
  `;

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  db.get(productSql, [productSlug], (productErr, product) => {
    if (productErr) {
      return next(productErr);
    }

    if (!product) {
      return res.status(404).render("error", {
        message: "Product not found",
        error: {},
      });
    }

    const relatedSql = `
      SELECT id, name, slug, brand, price, image_url, published_at
      FROM products
      WHERE id != ?
        AND date(published_at) <= date('now')
      ORDER BY date(published_at) DESC
      LIMIT 3
    `;

    db.all(relatedSql, [product.id], (relatedErr, relatedRows) => {
      if (relatedErr) {
        return next(relatedErr);
      }

      const relatedProducts = relatedRows.map((item) => {
        const publishedDate = new Date(item.published_at);
        const now = new Date();
        const diffInMs = now - publishedDate;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        return {
          ...item,
          is_new: diffInDays < 7,
        };
      });

      db.all(navCategoriesSql, [], (navErr, categories) => {
        if (navErr) {
          return next(navErr);
        }

        res.render("product", {
          title: `${product.name} | KIOSK`,
          categories,
          product,
          relatedProducts,
        });
      });
    });
  });
});
// --------------------------------------------
// BASKET ROUTES
// --------------------------------------------

router.get("/basket", function (req, res, next) {
  const basket = req.session.basket || [];

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  db.all(navCategoriesSql, [], (navErr, categories) => {
    if (navErr) {
      return next(navErr);
    }

    res.render("basket", {
      title: "Basket | KIOSK",
      categories,
      basket,
    });
  });
});


router.post("/basket/add/:slug", function (req, res, next) {
  const productSlug = req.params.slug;

  const productSql = `
    SELECT id, name, slug, brand, price
    FROM products
    WHERE slug = ?
      AND date(published_at) <= date('now')
    LIMIT 1
  `;

  db.get(productSql, [productSlug], (err, product) => {
    if (err) return next(err);

    if (!product) {
      return res.status(404).render("error", {
        message: "Product not found",
        error: {},
      });
    }

    if (!req.session.basket) {
      req.session.basket = [];
    }

    const existingItem = req.session.basket.find(
      (item) => item.slug === product.slug
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      req.session.basket.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.price,
        quantity: 1,
      });
    }

    res.redirect("/basket");
  });
});


router.post("/basket/remove/:slug", function (req, res) {
  if (!req.session.basket) {
    return res.redirect("/basket");
  }

  req.session.basket = req.session.basket.filter(
    (item) => item.slug !== req.params.slug
  );

  res.redirect("/basket");
});
module.exports = router;