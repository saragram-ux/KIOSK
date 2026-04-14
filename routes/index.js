var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  const products = [
    {
      slug: "svart-tshirt",
      name: "Svart T-Shirt",
      brand: "Levis",
      price: "199 SEK",
    },
    {
      slug: "vit-tshirt",
      name: "Vit T-Shirt",
      brand: "Levis",
      price: "199 SEK",
    },
    {
      slug: "gra-hoodie",
      name: "Grå Hoodie",
      brand: "Nike",
      price: "599 SEK",
    },
    {
      slug: "bla-jeans",
      name: "Blå Jeans",
      brand: "Levis",
      price: "799 SEK",
    },
  ];

  res.render("index", {
    title: "KIOSK",
    products,
  });
});

module.exports = router;