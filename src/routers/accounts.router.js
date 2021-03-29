const express = require('express');
const Mongoose = require('mongoose');
const middlewares = require('../middlewares');
const accounts = require('../models/account.model');
const movements = require('../models/movement.model');

const router = express.Router();

router.use(middlewares.checkJWT);

router.get('/', (req, res, next) => {
  const { _id } = req.user;
  accounts
    .find({ userId: _id, isActive: true })
    .then(async (userAccounts) => {
      const cleanedAccounts = userAccounts.map((doc) => ({
        name: doc.name,
        currency: doc.currency,
        balance: doc.balance,
        hasMinimum: doc.hasMinimum,
        minimum: doc.minimum,
        accountId: doc._id,
      }));
      res.status(200).json({ success: true, accounts: cleanedAccounts });
    })
    .catch(next);
});

router.post('/', (req, res, next) => {
  const { _id } = req.user;
  const { name, currency, balance, hasMinimum, minimum } = req.body;
  accounts
    .create({
      userId: _id,
      name,
      currency,
      balance,
      hasMinimum,
      minimum,
    })
    .then((newAccount) => {
      res.status(201).json({ success: true, account: newAccount });
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
      movements
        .updateMany({ accountId: realAccountId }, { $set: { isActive: false } })
        .then(() => {
          res.status(200).json({ success: true });
        })
        .catch(next);
    })
    .catch(next);
});

router.use(middlewares.defaultError);

module.exports = router;
