const jwt = require("jsonwebtoken");
require("dotenv").config();

/* Vérification du token utilisé */
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(" ")[1];
       const decodedToken = jwt.verify(token, process.env.authToken);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error : "not authorized" });
   }
};