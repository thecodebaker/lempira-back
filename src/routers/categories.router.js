const express = require('express');
const Mongoose = require('mongoose');
const middlewares = require('../middlewares');
const category = require('../models/category.model');

const router = express.Router();

router.use(middlewares.checkJWT);

router.get('/', (req, res, next) => {
  const { _id } = req.user;
  category
    .find({ $or: [{ userId: '-1' }, { userId: String(_id) }] })
    .then((data) => {
      const sorted = data.sort((a, b) => (a.name > b.name ? 1 : -1));
      const appInfo = sorted.filter((cat) => cat.userId === '-1');
      const userInfo = sorted.filter((cat) => cat.userId === String(_id));
      res
        .status(200)
        .json({ success: true, categories: [...userInfo, ...appInfo] });
    })
    .catch(next);
});

router.post('/', (req, res, next) => {
  const { _id } = req.user;
  const { name } = req.body;
  category
    .create({ name, userId: String(_id) })
    .then((data) => {
      res.status(200).json({ success: true, categories: data });
    })
    .catch(next);
});

router.delete('/', (req, res, next) => {
  const { _id } = req.user;
  const { categoryId } = req.body;
  const realId = Mongoose.Types.ObjectId(categoryId);
  category
    .findOneAndDelete({ _id: realId, userId: String(_id) })
    .then((data) => {
      res.status(200).json({ success: true, categories: data });
    })
    .catch(next);
});

router.put('/', (req, res, next) => {
  const { _id } = req.user;
  const { name, categoryId } = req.body;
  const realId = Mongoose.Types.ObjectId(categoryId);
  category
    .findOneAndUpdate({ userId: String(_id), _id: realId }, { name })
    .then((data) => {
      res.status(200).json({ success: true, categories: data });
    })
    .catch(next);
});

router.use(middlewares.defaultError);

module.exports = router;
