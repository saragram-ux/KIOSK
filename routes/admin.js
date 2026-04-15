var express = require("express");
var router = express.Router();
const db = require("../data/db");
const requireAdmin = require("../middleware/requireAdmin");

router.get("/products", requireAdmin, function (req, res, next) {
  const productsSql = `
    SELECT id, name, slug, brand, price
    FROM products
    ORDER BY name ASC
  `;

  db.all(productsSql, [], (err, products) => {
    if (err) {
      return next(err);
    }

    res.render("admin-products", {
      title: "Admin Products | KIOSK",
      products,
    });
  });
});

router.get("/products/new", requireAdmin, function (req, res, next) {
  const categoriesSql = `
    SELECT id, name
    FROM categories
    ORDER BY name ASC
  `;

  db.all(categoriesSql, [], (err, categories) => {
    if (err) {
      return next(err);
    }

    res.render("admin-product-new", {
      title: "New Product | KIOSK",
      categories,
    });
  });
});

router.get("/categories", requireAdmin, function (req, res, next) {
  const categoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  db.all(categoriesSql, [], (err, categories) => {
    if (err) {
      return next(err);
    }

    res.render("admin-categories", {
      title: "Admin Categories | KIOSK",
      categories,
    });
  });
});

router.get("/categories/new", requireAdmin, function (req, res) {
  res.render("admin-category-new", {
    title: "New Category | KIOSK",
  });
});

module.exports = router;