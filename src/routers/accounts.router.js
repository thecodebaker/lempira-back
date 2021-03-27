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
      const cleanedAccounts = await Promise.all(
        userAccounts.map(async (doc) => {
          const movement = await movements.findOne(
            { accountId: doc._id },
            {},
            { sort: { createdAt: -1 } }
          );
          return {
            name: doc.name,
            currency: doc.currency,
            accountId: doc._id,
            movement,
          };
        })
      );
      res.status(200).json({ success: true, accounts: cleanedAccounts });
    })
    .catch(next);
});

router.post('/', (req, res, next) => {
  const { _id } = req.user;
  const { name, currency, amount, isIncome } = req.body;
  accounts
    .create({ userId: _id, name, currency, amount })
    .then((newAccount) => {
      movements
        .create({
          accountId: newAccount._id,
          accountPrev: 0,
          amount,
          isIncome,
          name: 'Valor inicial',
        })
        .then(() => {
          res.status(201).json({ success: true, accounts: newAccount });
        });
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
