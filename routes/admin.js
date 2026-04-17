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
    errors: {},
    formData: {
      name: "",
      slug: "",
      description: "",
      image_url: "",
    },
  });
});

router.post("/categories/new", requireAdmin, function (req, res, next) {
  const { name, slug, description, image_url } = req.body;

  const formData = {
    name: name ? name.trim() : "",
    slug: slug ? slug.trim() : "",
    description: description ? description.trim() : "",
    image_url: image_url ? image_url.trim() : "",
  };

  const errors = {};

  if (!formData.name) {
    errors.name = "Name is required.";
  }

  if (!formData.slug) {
    errors.slug = "Slug is required.";
  }

  if (Object.keys(errors).length > 0) {
    return res.render("admin-category-new", {
      title: "New Category | KIOSK",
      errors,
      formData,
    });
  }

  const insertSql = `
    INSERT INTO categories (name, slug, description, image_url)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    insertSql,
    [formData.name, formData.slug, formData.description, formData.image_url],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          errors.slug = "Slug already exists.";

          return res.render("admin-category-new", {
            title: "New Category | KIOSK",
            errors,
            formData,
          });
        }

        return next(err);
      }

      res.redirect("/admin/categories");
    }
  );
});

module.exports = router;