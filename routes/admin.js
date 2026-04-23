const express = require("express");
const router = express.Router();
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
      errors: {},
      formData: {
        name: "",
        slug: "",
        brand: "",
        description: "",
        price: "",
        image_url: "",
        published_at: "",
        category_id: "",
      },
    });
  });
});

router.post("/products/new", requireAdmin, function (req, res, next) {
  const { name, slug, brand, description, price, image_url, published_at, category_id } = req.body;

  const formData = {
    name: name ? name.trim() : "",
    slug: slug ? slug.trim() : "",
    brand: brand ? brand.trim() : "",
    description: description ? description.trim() : "",
    price: price ? price.trim() : "",
    image_url: image_url ? image_url.trim() : "",
    published_at: published_at ? published_at.trim() : "",
    category_id: category_id ? category_id.trim() : "",
  };

  const errors = {};

  if (!formData.name) {
    errors.name = "Name is required.";
  }

  if (!formData.slug) {
    errors.slug = "Slug is required.";
  }

  if (!formData.brand) {
    errors.brand = "Brand is required.";
  }

  if (!formData.price) {
    errors.price = "Price is required.";
  }

  if (!formData.published_at) {
    errors.published_at = "Publish date is required.";
  }

  if (!formData.category_id) {
    errors.category_id = "Category is required.";
  }

  const categoriesSql = `
    SELECT id, name
    FROM categories
    ORDER BY name ASC
  `;

  if (Object.keys(errors).length > 0) {
    return db.all(categoriesSql, [], (categoriesErr, categories) => {
      if (categoriesErr) {
        return next(categoriesErr);
      }

      res.render("admin-product-new", {
        title: "New Product | KIOSK",
        categories,
        errors,
        formData,
      });
    });
  }

  const insertProductSql = `
    INSERT INTO products (name, slug, brand, description, price, image_url, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertProductSql,
    [
      formData.name,
      formData.slug,
      formData.brand,
      formData.description,
      Number(formData.price),
      formData.image_url,
      formData.published_at,
    ],
    function (productErr) {
      if (productErr) {
        return db.all(categoriesSql, [], (categoriesErr, categories) => {
          if (categoriesErr) {
            return next(categoriesErr);
          }

          if (productErr.message.includes("UNIQUE")) {
            errors.slug = "A product with this slug already exists.";
          } else {
            errors.general = "Something went wrong. Please try again.";
          }

          res.render("admin-product-new", {
            title: "New Product | KIOSK",
            categories,
            errors,
            formData,
          });
        });
      }

      const productId = this.lastID;

      const insertRelationSql = `
        INSERT INTO product_categories (product_id, category_id)
        VALUES (?, ?)
      `;

      db.run(insertRelationSql, [productId, Number(formData.category_id)], function (relationErr) {
        if (relationErr) {
          return next(relationErr);
        }

        res.redirect("/admin/products");
      });
    }
  );
});

router.get("/products/:id/edit", requireAdmin, function (req, res, next) {
  const productId = req.params.id;

  const productSql = `
    SELECT id, name, slug, brand, description, price, image_url, published_at
    FROM products
    WHERE id = ?
    LIMIT 1
  `;

  const categoriesSql = `
    SELECT id, name
    FROM categories
    ORDER BY name ASC
  `;

  db.get(productSql, [productId], (productErr, product) => {
    if (productErr) {
      return next(productErr);
    }

    if (!product) {
      return res.redirect("/admin/products");
    }

    db.get(
      `SELECT category_id FROM product_categories WHERE product_id = ? LIMIT 1`,
      [productId],
      (relationErr, relation) => {
        if (relationErr) {
          return next(relationErr);
        }

        db.all(categoriesSql, [], (categoriesErr, categories) => {
          if (categoriesErr) {
            return next(categoriesErr);
          }

          res.render("admin-product-edit", {
            title: "Edit Product | KIOSK",
            product,
            categories,
            errors: {},
            formData: {
              ...product,
              category_id: relation ? String(relation.category_id) : "",
            },
          });
        });
      }
    );
  });
});

router.post("/products/:id/edit", requireAdmin, function (req, res, next) {
  const productId = req.params.id;
  const { name, slug, brand, description, price, image_url, published_at, category_id } = req.body;

  const formData = {
    name: name ? name.trim() : "",
    slug: slug ? slug.trim() : "",
    brand: brand ? brand.trim() : "",
    description: description ? description.trim() : "",
    price: price ? price.trim() : "",
    image_url: image_url ? image_url.trim() : "",
    published_at: published_at ? published_at.trim() : "",
    category_id: category_id ? category_id.trim() : "",
  };

  const errors = {};

  if (!formData.name) {
    errors.name = "Name is required.";
  }

  if (!formData.slug) {
    errors.slug = "Slug is required.";
  }

  if (!formData.brand) {
    errors.brand = "Brand is required.";
  }

  if (!formData.price) {
    errors.price = "Price is required.";
  }

  if (!formData.published_at) {
    errors.published_at = "Publish date is required.";
  }

  if (!formData.category_id) {
    errors.category_id = "Category is required.";
  }

  const categoriesSql = `
    SELECT id, name
    FROM categories
    ORDER BY name ASC
  `;

  if (Object.keys(errors).length > 0) {
    return db.all(categoriesSql, [], (categoriesErr, categories) => {
      if (categoriesErr) {
        return next(categoriesErr);
      }

      res.render("admin-product-edit", {
        title: "Edit Product | KIOSK",
        product: { id: productId },
        categories,
        errors,
        formData,
      });
    });
  }

  const updateProductSql = `
    UPDATE products
    SET name = ?, slug = ?, brand = ?, description = ?, price = ?, image_url = ?, published_at = ?
    WHERE id = ?
  `;

  db.run(
    updateProductSql,
    [
      formData.name,
      formData.slug,
      formData.brand,
      formData.description,
      Number(formData.price),
      formData.image_url,
      formData.published_at,
      productId,
    ],
    function (productErr) {
      if (productErr) {
        return db.all(categoriesSql, [], (categoriesErr, categories) => {
          if (categoriesErr) {
            return next(categoriesErr);
          }

          if (productErr.message.includes("UNIQUE")) {
            errors.slug = "A product with this slug already exists.";
          } else {
            errors.general = "Something went wrong. Please try again.";
          }

          res.render("admin-product-edit", {
            title: "Edit Product | KIOSK",
            product: { id: productId },
            categories,
            errors,
            formData,
          });
        });
      }

      db.run(
        `DELETE FROM product_categories WHERE product_id = ?`,
        [productId],
        (deleteRelationErr) => {
          if (deleteRelationErr) {
            return next(deleteRelationErr);
          }

          db.run(
            `INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`,
            [productId, Number(formData.category_id)],
            (insertRelationErr) => {
              if (insertRelationErr) {
                return next(insertRelationErr);
              }

              res.redirect("/admin/products");
            }
          );
        }
      );
    }
  );
});

router.post("/products/:id/delete", requireAdmin, function (req, res, next) {
  const productId = req.params.id;

  db.run(`DELETE FROM product_categories WHERE product_id = ?`, [productId], (relationErr) => {
    if (relationErr) {
      return next(relationErr);
    }

    db.run(`DELETE FROM products WHERE id = ?`, [productId], (productErr) => {
      if (productErr) {
        return next(productErr);
      }

      res.redirect("/admin/products");
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

router.get("/categories/:id/edit", requireAdmin, function (req, res, next) {
  const categoryId = req.params.id;

  const sql = `
    SELECT id, name, slug, description, image_url
    FROM categories
    WHERE id = ?
    LIMIT 1
  `;

  db.get(sql, [categoryId], (err, category) => {
    if (err) return next(err);

    if (!category) {
      return res.redirect("/admin/categories");
    }

    res.render("admin-category-edit", {
      title: "Edit Category | KIOSK",
      category,
      errors: {},
      formData: category,
    });
  });
});

router.post("/categories/:id/edit", requireAdmin, function (req, res, next) {
  const categoryId = req.params.id;

  const { name, slug, description, image_url } = req.body;

  const formData = {
    name: name ? name.trim() : "",
    slug: slug ? slug.trim() : "",
    description: description ? description.trim() : "",
    image_url: image_url ? image_url.trim() : "",
  };

  const errors = {};

  if (!formData.name) errors.name = "Name is required.";
  if (!formData.slug) errors.slug = "Slug is required.";

  if (Object.keys(errors).length > 0) {
    return res.render("admin-category-edit", {
      title: "Edit Category | KIOSK",
      category: { id: categoryId },
      errors,
      formData,
    });
  }

  const updateSql = `
    UPDATE categories
    SET name = ?, slug = ?, description = ?, image_url = ?
    WHERE id = ?
  `;

  db.run(
    updateSql,
    [formData.name, formData.slug, formData.description, formData.image_url, categoryId],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          errors.slug = "Slug already exists.";

          return res.render("admin-category-edit", {
            title: "Edit Category | KIOSK",
            category: { id: categoryId },
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

router.post("/categories/:id/delete", requireAdmin, function (req, res, next) {
  const categoryId = req.params.id;

  db.run(
    `DELETE FROM product_categories WHERE category_id = ?`,
    [categoryId],
    (relationErr) => {
      if (relationErr) return next(relationErr);

      db.run(
        `DELETE FROM categories WHERE id = ?`,
        [categoryId],
        (err) => {
          if (err) return next(err);

          res.redirect("/admin/categories");
        }
      );
    }
  );
});

module.exports = router;