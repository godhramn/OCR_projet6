const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passwordValidator = require("password-validator");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  /* valider le choix de mot de passe */
  const schema = new passwordValidator();

  schema
  .is()
  .min(8) /* minimum de 8 caractères */
  .is()
  .max(64); /* maximum de 64 caractères */
  
  if (schema.validate(req.body.password)) {
    bcrypt.hash(req.body.password, 10) 
    .then((hash) => {
      /* Création d'un nouvel utilisateur */
      const user = new User({
        email: req.body.email,
        password: hash
      });
      /* enregistrer l'utilisateur dans la base de donnée */
      user.save()
        .then(() => res.status(201).json({ message: "Compte utilisateur créé" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
  } else {
    res.status(400).json({error: schema.validate(req.body.password, { list: true })});
  } 
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur inconnu" });
      }
      /* vérification du mot de passe  */
      bcrypt.compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
          }
          /* création d'un token */
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              "RANDOM_TOKEN_SECRET",
              { expiresIn: "6h" }
            )
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};


