const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passwordValidator = require("password-validator");
const emailValidator = require("email-validator");
require("dotenv").config();

const User = require("../models/user");

exports.signup = (req, res, next) => {
  /* Critères de validation de mot de passe */
  const schema = new passwordValidator();

  schema
  .is()
  .min(8) /* minimum de 8 caractères */
  .is()
  .max(64) /* maximum de 64 caractères */
  .has()
  .not()
  .spaces()  /* ne doit pas comprendre d'espace */

  /* validation de l'email puis du mot de passe */
  if (emailValidator.validate(req.body.email)) {
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
          .then(() => res.status(201).json({ message: "user account created" }))
          .catch(() => res.status(400).json({ error : "unable to save user data" }));
      })
      .catch(() => res.status(500).json({ error : "unable to check password validity" }));
    } else {
      res.status(400).json({error : "invalid password : " + schema.validate(req.body.password, { list: true })});
    }
  } else {
    res.status(400).json({error : "invalid email"})
  } 
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
  .then((user) => {
    if (!user) {
      return res.status(401).json({ error: "unknown user" });
    }
    /* vérification du mot de passe  */
    bcrypt.compare(req.body.password, user.password)
    .then((valid) => {
      if (!valid) {
        return res.status(401).json({ error: "wrong password" });
      }
      /* création d'un token */
      res.status(200).json({
        userId: user._id,
        token: jwt.sign(
          { userId: user._id },
          process.env.authToken,
          { expiresIn: "4h" }
        )
      });
    })
    .catch((error) => res.status(500).json({ error : "unable to check password"}));
  })
  .catch((error) => res.status(500).json({ error : "unable to check user" }));
};


