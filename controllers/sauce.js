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

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      const savedFilename  = sauce.imageUrl.split("/images/")[1];
      if (fs.existsSync(`images/${savedFilename}`) != true) {
        sauce.imageUrl = `${req.protocol}://${req.get("host")}/images/default.png`
      }
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.getAllSauces = (req, res, next) => {
  headers = {"Authorization": `Bearer ${req.params.token}`}
  Sauce.find().then(
    (sauces) => {
      for (let i = 0; i < sauces.length; i++) {
        const savedFilename  = sauces[i].imageUrl.split("/images/")[1];
        if (fs.existsSync(`images/${savedFilename}`) != true) {
          sauces[i].imageUrl = `${req.protocol}://${req.get("host")}/images/default.png`
        }
      } 
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {
  console.log("Work in progress")
}