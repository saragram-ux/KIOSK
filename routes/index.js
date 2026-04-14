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