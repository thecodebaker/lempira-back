const express = require('express');
const axios = require('axios');
const Mongoose = require('mongoose');
const middlewares = require('../middlewares');
const accounts = require('../models/account.model');
const movements = require('../models/movement.model');

const router = express.Router();

router.use(middlewares.checkJWT);
router.get('/exchanges', async (req, res) => {
  const HNL = await axios.get(
    `https://free.currconv.com/api/v7/convert?apiKey=${process.env.API_KEY}&q=HNL_USD,HNL_EUR&compact=ultra`
  );
  const USD = await axios.get(
    `https://free.currconv.com/api/v7/convert?apiKey=${process.env.API_KEY}&q=USD_HNL,USD_EUR&compact=ultra`
  );
  const EUR = await axios.get(
    `https://free.currconv.com/api/v7/convert?apiKey=${process.env.API_KEY}&q=EUR_USD,EUR_HNL&compact=ultra`
  );
  const exchanges = { ...HNL.data, ...USD.data, ...EUR.data };
  res.status(200).json({ success: true, exchanges });
});

router.get('/', (req, res, next) => {
  const { _id } = req.user;
  accounts
    .find({ userId: _id, isActive: true })
    .then(async (userAccounts) => {
      const cleanedAccounts = await Promise.all(
        userAccounts.map(async (doc) => {
          const movimientos = await movements.find(
            { accountId: doc._id, isActive: true },
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
  const { accountId, categoryId, amount, isIncome, note } = req.body;
  movements
    .create({
      accountId,
      categoryId,
      amount,
      isIncome,
      note,
    })
    .then((newMovement) => {
      accounts
        .updateOne(
          { _id: accountId },
          { $inc: { balance: (isIncome ? 1 : -1) * amount } }
        )
        .then(() => {
          res.status(201).json({ success: true, movement: newMovement });
        })
        .catch(next);
    })
    .catch(next);
});

router.put('/', (req, res, next) => {
  const { _id } = req.user;
  const { accountId, name, currency, categoryId } = req.body;
  const realAccountId = Mongoose.Types.ObjectId(accountId);
  accounts
    .updateOne(
      { userId: _id, _id: realAccountId, isActive: true },
      { $set: { name, currency, categoryId } }
    )
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch(next);
});

router.delete('/', (req, res, next) => {
  const { movementId } = req.body;
  const realMovementId = Mongoose.Types.ObjectId(movementId);
  movements
    .findOneAndUpdate({ _id: realMovementId }, { $set: { isActive: false } })
    .then((movement) => {
      accounts
        .updateOne(
          { _id: movement.accountId },
          { $inc: { balance: (movement.isIncome ? -1 : 1) * movement.amount } }
        )
        .then(() => {
          res.status(201).json({ success: true, movement });
        })
        .catch(next);
    })
    .catch(next);
});

router.use(middlewares.defaultError);

module.exports = router;
