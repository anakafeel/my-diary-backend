/* FETCHUSER IS A MIDDLE WARE - to be used anywhere where login is required*/

/* importing JWT token for adding another layer of authentication - so that server provides correct persons data to the user */
var jwt = require("jsonwebtoken");
JWT_SECRET = "Saim$sMernApp";

const fetchUser = (req, res, next) => {
  /* GETTING THE USER FROM THE JWT TOKEN AND ADDING ID TO REQUESTED OBJECT */
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please Uthenticate Using A Valid Token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please Uthenticate Using A Valid Token" });
  }
};

module.exports = fetchUser;
