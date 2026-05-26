const express = require("express");
const router = express.Router();
const db = require("../data/db");

function applyDbFavorites(req, products, next, callback) {
  if (!req.session.user || products.length === 0) {
    return callback(products);
  }

  const productIds = products.map((product) => product.id);
  const placeholders = productIds.map(() => "?").join(",");

  const favoritesSql = `
    SELECT product_id
    FROM favorites
    WHERE user_id = ?
      AND product_id IN (${placeholders})
  `;

  db.all(favoritesSql, [req.session.user.id, ...productIds], (err, rows) => {
    if (err) {
      return next(err);
    }

    const favoriteIds = rows.map((row) => row.product_id);

    const productsWithFavorites = products.map((product) => {
      return {
        ...product,
        is_favorite: favoriteIds.includes(product.id),
      };
    });

    callback(productsWithFavorites);
  });
}

router.get("/", function (req, res, next) {
  const hero = {
    title: "Hydration. Point of view included.",
    description:
      "Seasonal ingredients, Copenhagen water, nothing unnecessary. Drinks for people who know what they like.",
    buttonText: "See the menu",
    buttonUrl: "/products",
    videoUrl: "/videos/hero-video.mp4",
  };

  const favoriteSlugs = req.session.favorites || [];
  
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

  const spotsSql = `
  SELECT id, title, image_url, link_url
  FROM spots
  ORDER BY sort_order ASC
  LIMIT 3
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
        is_favorite: req.session.user
  ? false
  : favoriteSlugs.includes(product.slug),
      };
    });

    db.all(categoriesSql, [], (categoriesErr, categories) => {
      if (categoriesErr) {
        return next(categoriesErr);
      }

      db.all(spotsSql, [], (spotsErr, spots) => {
  if (spotsErr) {
    return next(spotsErr);
  }

  applyDbFavorites(req, products, next, (productsWithFavorites) => {
    res.render("index", {
      title: "KIOSK",
      products: productsWithFavorites,
      categories,
      hero,
      spots,
    });
  });
});
    });
  });
});

router.get("/news", function (req, res, next) {
  const favoriteSlugs = req.session.favorites || [];

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  const newsSql = `
    SELECT id, name, slug, brand, price, image_url, published_at
    FROM products
    WHERE date(published_at) <= date('now')
      AND julianday('now') - julianday(published_at) < 7
    ORDER BY date(published_at) DESC
  `;

  db.all(newsSql, [], (productsErr, productRows) => {
    if (productsErr) {
      return next(productsErr);
    }

    const products = productRows.map((product) => {
      return {
        ...product,
        is_new: false,
        is_favorite: req.session.user
  ? false
  : favoriteSlugs.includes(product.slug),
      };
    });

    db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      applyDbFavorites(req, products, next, (productsWithFavorites) => {
      res.render("news", {
        title: "News | KIOSK",
        categories,
        products: productsWithFavorites,
      });
      });
    });
  });
});

router.get("/categories/:slug", function (req, res, next) {
  const categorySlug = req.params.slug;

  const favoriteSlugs = req.session.favorites || [];

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
          is_favorite: req.session.user
  ? false
  : favoriteSlugs.includes(product.slug),
        };
      });

      db.all(navCategoriesSql, [], (navErr, categories) => {
        if (navErr) {
          return next(navErr);
        }

        applyDbFavorites(req, products, next, (productsWithFavorites) => {
        res.render("category", {
          title: `${category.name} | KIOSK`,
          category,
          categories,
          products: productsWithFavorites,
        });
        });
      });
    });
  });
});

router.get("/search", function (req, res, next) {
  const query = req.query.q ? req.query.q.trim() : "";

  const favoriteSlugs = req.session.favorites || [];

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
        is_favorite: req.session.user
  ? false
  : favoriteSlugs.includes(product.slug),
      };
    });

    db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      applyDbFavorites(req, products, next, (productsWithFavorites) => {
  res.render("search", {
    title: `Search: ${query} | KIOSK`,
    categories,
    query,
    products: productsWithFavorites,
  });
});
    });
  });
});

router.get("/products", function (req, res, next) {
  const favoriteSlugs = req.session.favorites || [];

  const productsSql = `
    SELECT id, name, slug, brand, price, image_url, published_at
    FROM products
    WHERE date(published_at) <= date('now')
    ORDER BY date(published_at) DESC
  `;

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  db.all(productsSql, [], (productsErr, productRows) => {
    if (productsErr) return next(productsErr);

    const products = productRows.map((product) => {
      const publishedDate = new Date(product.published_at);
      const now = new Date();
      const diffInDays = (now - publishedDate) / (1000 * 60 * 60 * 24);

      return {
        ...product,
        is_new: diffInDays < 7,
        is_favorite: req.session.user
  ? false
  : favoriteSlugs.includes(product.slug),
      };
    });

    db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) return next(navErr);

      applyDbFavorites(req, products, next, (productsWithFavorites) => {
  res.render("products", {
    title: "Menu | KIOSK",
    categories,
    products: productsWithFavorites,
  });
});
    });
  });
});

router.get("/products/:slug", function (req, res, next) {
  const productSlug = req.params.slug;

  const favoriteSlugs = req.session.favorites || [];

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

    const productWithFavorite = {
  ...product,
  is_new: false,
  is_favorite: req.session.user
    ? false
    : favoriteSlugs.includes(product.slug),
};

    const relatedSql = `
      SELECT id, name, slug, brand, price, image_url, published_at
      FROM products
      WHERE id != ?
        AND date(published_at) <= date('now')
      ORDER BY date(published_at) DESC
      LIMIT 5
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
          is_favorite: req.session.user
  ? false
  : favoriteSlugs.includes(item.slug),
        };
      });

      db.all(navCategoriesSql, [], (navErr, categories) => {
        if (navErr) {
          return next(navErr);
        }

        applyDbFavorites(req, [productWithFavorite], next, (mainProductsWithFavorites) => {
  applyDbFavorites(req, relatedProducts, next, (relatedProductsWithFavorites) => {
    res.render("product", {
      title: `${product.name} | KIOSK`,
      categories,
      product: mainProductsWithFavorites[0],
      relatedProducts: relatedProductsWithFavorites,
    });
  });
});
      });
    });
  });
});

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

router.post("/basket/increase/:slug", function (req, res) {
  if (!req.session.basket) {
    return res.redirect("/basket");
  }

  const item = req.session.basket.find(
    (basketItem) => basketItem.slug === req.params.slug
  );

  if (item) {
    item.quantity += 1;
  }

  res.redirect("/basket");
});

router.post("/basket/decrease/:slug", function (req, res) {
  if (!req.session.basket) {
    return res.redirect("/basket");
  }

  const item = req.session.basket.find(
    (basketItem) => basketItem.slug === req.params.slug
  );

  if (item) {
    item.quantity -= 1;
  }

  req.session.basket = req.session.basket.filter(
    (basketItem) => basketItem.quantity > 0
  );

  res.redirect("/basket");
});

router.post("/basket/update/:slug", function (req, res) {
  if (!req.session.basket) {
    return res.redirect("/basket");
  }

  const quantity = Number(req.body.quantity);

  req.session.basket = req.session.basket
    .map((item) => {
      if (item.slug === req.params.slug) {
        return {
          ...item,
          quantity,
        };
      }

      return item;
    })
    .filter((item) => item.quantity > 0);

  res.redirect("/basket");
});

router.get("/favorites", function (req, res, next) {
  const favoriteSlugs = req.session.favorites || [];

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

if (req.session.user) {
  const favoritesSql = `
    SELECT p.id, p.name, p.slug, p.brand, p.price, p.image_url, p.published_at
    FROM favorites f
    INNER JOIN products p ON f.product_id = p.id
    WHERE f.user_id = ?
      AND date(p.published_at) <= date('now')
    ORDER BY date(p.published_at) DESC
  `;

  return db.all(favoritesSql, [req.session.user.id], (productsErr, productRows) => {
    if (productsErr) {
      return next(productsErr);
    }

    const products = productRows.map((product) => {
      const publishedDate = new Date(product.published_at);
      const now = new Date();
      const diffInDays = (now - publishedDate) / (1000 * 60 * 60 * 24);

      return {
        ...product,
        is_new: diffInDays < 7,
        is_favorite: true,
      };
    });

    db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      res.render("favorites", {
        title: "Favorites | KIOSK",
        categories,
        products,
      });
    });
  });
}

  if (favoriteSlugs.length === 0) {
    return db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      res.render("favorites", {
        title: "Favorites | KIOSK",
        categories,
        products: [],
      });
    });
  }

  const placeholders = favoriteSlugs.map(() => "?").join(",");

  const favoritesSql = `
    SELECT id, name, slug, brand, price, image_url, published_at
    FROM products
    WHERE slug IN (${placeholders})
      AND date(published_at) <= date('now')
    ORDER BY date(published_at) DESC
  `;

  db.all(favoritesSql, favoriteSlugs, (productsErr, productRows) => {
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
        is_favorite: true,
      };
    });

    db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      res.render("favorites", {
        title: "Favorites | KIOSK",
        categories,
        products,
      });
    });
  });
});

router.post("/favorites/toggle/:slug", function (req, res, next) {
  const productSlug = req.params.slug;
  const redirectTo = req.body.redirectTo || "back";

  const productSql = `
    SELECT id, slug
    FROM products
    WHERE slug = ?
    LIMIT 1
  `;

  db.get(productSql, [productSlug], (err, product) => {
    if (err) return next(err);
    if (!product) return res.redirect("back");

    // 🔒 CASE 1: NOT LOGGED IN → SESSION
    if (!req.session.user) {
      if (!req.session.favorites) {
        req.session.favorites = [];
      }

      const isFavorite = req.session.favorites.includes(product.slug);

      if (isFavorite) {
        req.session.favorites = req.session.favorites.filter(
          (slug) => slug !== product.slug
        );
      } else {
        req.session.favorites.push(product.slug);
      }

      return res.redirect(redirectTo);
    }

    // 🔒 CASE 2: LOGGED IN → DATABASE
    const userId = req.session.user.id;

    const checkSql = `
      SELECT id FROM favorites
      WHERE user_id = ? AND product_id = ?
    `;

    db.get(checkSql, [userId, product.id], (checkErr, existing) => {
      if (checkErr) return next(checkErr);

      if (existing) {
        // remove favorite
        db.run(
          `DELETE FROM favorites WHERE id = ?`,
          [existing.id],
          (deleteErr) => {
            if (deleteErr) return next(deleteErr);
            return res.redirect(redirectTo);
          }
        );
      } else {
        // add favorite
        db.run(
          `INSERT INTO favorites (user_id, product_id) VALUES (?, ?)`,
          [userId, product.id],
          (insertErr) => {
            if (insertErr) return next(insertErr);
            return res.redirect(redirectTo);
          }
        );
      }
    });
  });
});

router.get("/register", function (req, res, next) {
  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  db.all(navCategoriesSql, [], (navErr, categories) => {
    if (navErr) {
      return next(navErr);
    }

    res.render("register", {
      title: "Create account | KIOSK",
      categories,
      errors: {},
      formData: {
        email: "",
      },
    });
  });
});

router.post("/register", function (req, res, next) {
  const { email, password } = req.body;

  const errors = {};
  const formData = {
    email: email ? email.trim() : "",
  };

  if (!formData.email) {
    errors.email = "Email is required.";
  }

  if (!password || password.trim().length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  if (Object.keys(errors).length > 0) {
    return db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      res.render("register", {
        title: "Create account | KIOSK",
        categories,
        errors,
        formData,
      });
    });
  }

  const insertSql = `
    INSERT INTO users (email, password, admin)
    VALUES (?, ?, 0)
  `;

  db.run(insertSql, [formData.email, password], function (insertErr) {
    if (insertErr) {
      return db.all(navCategoriesSql, [], (navErr, categories) => {
        if (navErr) {
          return next(navErr);
        }

        if (insertErr.message.includes("UNIQUE")) {
          errors.email = "An account with this email already exists.";
        } else {
          errors.general = "Something went wrong. Please try again.";
        }

        res.render("register", {
          title: "Create account | KIOSK",
          categories,
          errors,
          formData,
        });
      });
    }

    res.redirect("/login");
  });
});

router.get("/login", function (req, res, next) {
  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  db.all(navCategoriesSql, [], (navErr, categories) => {
    if (navErr) {
      return next(navErr);
    }

    res.render("login", {
      title: "Log in | KIOSK",
      categories,
      errors: {},
      formData: {
        email: "",
      },
    });
  });
});

router.post("/login", function (req, res, next) {
  const { email, password } = req.body;

  const errors = {};
  const formData = {
    email: email ? email.trim() : "",
  };

  const navCategoriesSql = `
    SELECT id, name, slug
    FROM categories
    ORDER BY name ASC
  `;

  if (!formData.email) {
    errors.email = "Email is required.";
  }

  if (!password || password.trim().length === 0) {
    errors.password = "Password is required.";
  }

  if (Object.keys(errors).length > 0) {
    return db.all(navCategoriesSql, [], (navErr, categories) => {
      if (navErr) {
        return next(navErr);
      }

      res.render("login", {
        title: "Log in | KIOSK",
        categories,
        errors,
        formData,
      });
    });
  }

  const userSql = `
    SELECT id, email, password, admin
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.get(userSql, [formData.email], (userErr, user) => {
    if (userErr) {
      return next(userErr);
    }

    if (!user || user.password !== password) {
      return db.all(navCategoriesSql, [], (navErr, categories) => {
        if (navErr) {
          return next(navErr);
        }

        errors.general = "Invalid email or password.";

        res.render("login", {
          title: "Log in | KIOSK",
          categories,
          errors,
          formData,
        });
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      admin: user.admin,
    };

    res.redirect("/");
  });
});

router.post("/logout", function (req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.redirect("/");
  });
});

module.exports = router;