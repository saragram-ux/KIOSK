var express = require("express");
var router = express.Router();
const db = require("../data/db");

router.get("/", function (req, res, next) {
  const sql = `
    SELECT id, name, slug, brand, price, image_url, published_at
    FROM products
    WHERE date(published_at) <= date('now')
    ORDER BY date(published_at) DESC
    LIMIT 8
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return next(err);
    }

    const products = rows.map((product) => {
      const publishedDate = new Date(product.published_at);
      const now = new Date();
      const diffInMs = now - publishedDate;
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      return {
        ...product,
        is_new: diffInDays < 7,
      };
    });

    res.render("index", {
      title: "KIOSK",
      products,
    });
  });
});

module.exports = router;