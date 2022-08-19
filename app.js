const express = require("express");
const helmet = require("helmet");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");


mongoose.connect(process.env.SECRET_KEY,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet({
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;

