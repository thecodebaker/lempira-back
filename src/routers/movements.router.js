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
          const movimientos = await movements.find(
            { accountId: doc._id },
            {},
            { sort: { createdAt: 1 } }
          );
          return movimientos.map((move) => ({
            currency: doc.currency,
            accountName: doc.name,
            accountId: doc._id,
            movementId: move._id,
            ...move.toJSON(),
          }));
        })
      );
      const cleanedMovements = cleanedAccounts.reduce(
        (t, m) => [...t, ...m],
        []
      );
      res.status(200).json({ success: true, movements: cleanedMovements });
    })
    .catch(next);
});

router.post('/', (req, res, next) => {
  const { accountId, amount, isIncome } = req.body;
  movements
    .findOne({ accountId }, {}, { sort: { createdAt: -1 } })
    .then((doc) => {
      movements
        .create({
          accountId,
          accountPrev: doc.accountPrev + doc.amount * (doc.isIncome ? 1 : -1),
          amount,
          isIncome,
        })
        .then((newMovement) => {
          res.status(201).json({ success: true, movement: newMovement });
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
  const { movementId } = req.body;
  const realMovementId = Mongoose.Types.ObjectId(movementId);
  accounts
    .updateOne({ _id: realMovementId }, { $set: { isActive: false } })
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch(next);
});

router.use(middlewares.defaultError);

module.exports = router;
