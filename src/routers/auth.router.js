const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('../models/user.model');
const middlewares = require('../middlewares');

const saltRounds = Number(process.env.SALT_ROUNDS);
const secret = process.env.SECRET;
const router = express.Router();

router.post('/signup', (req, res, next) => {
  const { email, password, name } = req.body;
  const hash = bcrypt.hashSync(password, saltRounds);
  user
    .create({ email, password: hash, name })
    .then((doc) => {
      res.json({ success: true, user: doc.toJSON() });
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  user.findOne({ email }).then((doc) => {
    if (bcrypt.compareSync(password, doc.password)) {
      jwt.sign({ email }, secret, (err, hash) => {
        if (err) next(err);
        res.json({
          success: true,
          name: doc.name,
          token: hash,
        });
      });
    } else {
      res.status(401).json({ success: false });
    }
  });
});

router.use(middlewares.defaultError);

module.exports = router;
