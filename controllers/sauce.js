const Sauce = require("../models/sauce.js");

const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  });

  sauce.save()
  .then(() => { res.status(201).json({message: "Objet enregistré !"})})
  .catch(error => { res.status(400).json( { error })})
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({ message : "unauthorized request."});
    } else {
      Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
      .then(() => res.status(200).json({message : "Objet modifié!"}))
      .catch(error => res.status(401).json({ error }));
    }
  })
  .catch((error) => {
      res.status(400).json({ error });
  });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
  .then(sauce => {
    if (sauce.userId != req.auth.userId) {
      res.status(403).json({message: "unauthorized request."});
    } else {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({_id: req.params.id})
        .then(() => { res.status(200).json({message: "Objet supprimé !"})})
        .catch(error => res.status(401).json({ error }));
      });
    }
  })
  .catch( error => {
    res.status(500).json({ error });
  });
};

exports.getSauceById = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      /* Mettre l'image par défaut si absence d'image */
      const savedFilename  = sauce.imageUrl.split("/images/")[1];
      if (fs.existsSync(`images/${savedFilename}`) != true) {
        sauce.imageUrl = `${req.protocol}://${req.get("host")}/images/default.png`
      }
      res.status(200).json(sauce);
    }
  ).catch((error) => {
    res.status(400).json({ error });
  });
};

exports.getSauces = (req, res, next) => {
  headers = {"Authorization": `Bearer ${req.params.token}`}
  Sauce.find().then(
    (sauces) => {
      /* Mettre des images par défaut si absence d'images */
      for (let i = 0; i < sauces.length; i++) {
        const savedFilename  = sauces[i].imageUrl.split("/images/")[1];
        if (fs.existsSync(`images/${savedFilename}`) != true) {
          sauces[i].imageUrl = `${req.protocol}://${req.get("host")}/images/default.png`
        }
      } 
      res.status(200).json(sauces);
    }
  ).catch((error) => {
    res.status(400).json({ error });
  });
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => {
    if (req.body.like == 1 && !sauce.usersLiked.includes(req.auth.userId)) {
      Sauce.updateOne(
        { _id: req.params.id },
        { $push: { usersLiked: req.auth.userId }, $inc: { likes: +1 } }
      )
      .then(() => {
        res.status(200).json({ message: "liked" });
      })
      .catch((error) => res.status(400).json({ error }));
    } else if (req.body.like == -1 && !sauce.usersDisliked.includes(req.auth.userId)) {
      Sauce.updateOne(
        { _id: req.params.id },
        { $push: { usersDisliked: req.auth.userId }, $inc: { dislikes: +1 }}
      )
      .then(() => {
        res.status(200).json({ message: "disliked" });
      })
      .catch((error) => res.status(400).json({ error }));
    } else {
      if (sauce.usersLiked.includes(req.auth.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersLiked: req.auth.userId }, $inc: { likes: -1 } }
        )
        .then(() => {
          res.status(200).json({ message: "like canceled" });
        })
        .catch((error) => res.status(400).json({ error }));
      } else if (sauce.usersDisliked.includes(req.auth.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $pull: { usersDisliked: req.auth.userId }, $inc: { dislikes: -1 }}
        )
        .then(() => {
          res.status(200).json({ message: "dislike canceled" });
        })
        .catch((error) => res.status(400).json({ error }));
      }
    }
  });
};