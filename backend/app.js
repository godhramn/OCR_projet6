const express = require("express");
const app = express();
const mongoose = require("mongoose");
const saucesRoutes = require("./routes/sauce");
const path = require("path");

mongoose.connect("mongodb+srv://godhramm:H3LL0faR1D3!$&!@cluster0.129hpae.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use("/api/sauce", saucesRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;

