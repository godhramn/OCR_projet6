const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png"
};

/* Stockage des fichiers images uploadés par l'utilisateur */
const storage = multer.diskStorage({
  /* enregistrer le fichier dans le dossier /images */
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  /* nommer le fichier à enregistrer */
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  }
});

module.exports = multer({storage: storage}).single("image");