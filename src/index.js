require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rfs = require('rotating-file-stream');
const auth = require('./routers/auth.router');
const middlewares = require('./middlewares');

const PORT = process.env.PORT || 3001;
mongoose.connect(
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:27017/${process.env.DB_NAME}`,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) {
      console.log('Listo');
    } else {
      console.error(err);
    }
  }
);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  path: path.join(__dirname, '..', 'logs'),
});

app.use(morgan('combined', { stream: accessLogStream }));

app.use('/auth', auth);

app.use(middlewares.NotFound);

app.listen(PORT, () => {
  console.log(`El app empezo en el puerto: ${PORT}`);
});
