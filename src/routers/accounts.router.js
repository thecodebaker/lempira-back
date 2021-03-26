const express = require('express');
const Mongoose = require('mongoose');
const middlewares = require('../middlewares');
const accounts = require('../models/account.model');

const router = express.Router();

router.use(middlewares.checkJWT);

router.get('/', (req, res, next) => {
  const { _id } = req.user;
  accounts
    .find({ userId: _id, isActive: true })
    .then((userAccounts) => {
      const cleanedAccounts = userAccounts.map((doc) => ({
        name: doc.name,
        currency: doc.currency,
        accountId: doc._id,
      }));
      res.status(200).json({ success: true, accounts: cleanedAccounts });
    })
    .catch(next);
});

router.post('/', (req, res, next) => {
  const { _id } = req.user;
  const { name, currency } = req.body;
  accounts
    .create({ userId: _id, name, currency })
    .then((newAccount) => {
      res.status(201).json({ success: true, accounts: newAccount });
    })
    .catch(next);
});

router.put('/', (req, res, next) => {
  const { _id } = req.user;
  const { accountId, name, currency } = req.body;
  const realAccountId = Mongoose.Types.ObjectId(accountId);
  accounts
    .updateOne(
      { userId: _id, _id: realAccountId, isActive: true },
      { $set: { name, currency } }
    )
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch(next);
});

router.delete('/', (req, res, next) => {
  const { _id } = req.user;
  const { accountId } = req.body;
  const realAccountId = Mongoose.Types.ObjectId(accountId);
  accounts
    .updateOne(
      { userId: _id, _id: realAccountId },
      { $set: { isActive: false } }
    )
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch(next);
});

router.use(middlewares.defaultError);

module.exports = router;
