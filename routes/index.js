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

module.exports = router;

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