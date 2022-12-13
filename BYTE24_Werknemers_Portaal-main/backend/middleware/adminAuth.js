const jwt = require('jsonwebtoken');
const config = require('../knexfile').production;
const knex = require('knex')(config);
require('dotenv').config({
  path: `${__dirname}/../../.env`,
});

const superAdminAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ msg: 'Token not found. Authorization has been denied.' });
    }

    const isVerified = jwt.verify(token, process.env.SECRET_KEY);
    if (!isVerified) {
      return res.status(400).json({ msg: 'Unsuccesful token verification. Authentication denied. ' });
    }

    if (!isVerified.role || !isVerified.role === 'Super Admin') {
      return res.status(400).json({ msg: 'Only Super Admin access has been allowed.' });
    }

    next();
  } catch (err) {
    return res.status(500).send({ msg: 'Authorization is denied.' });
  }
};

module.exports = superAdminAuth;
