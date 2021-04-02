require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rfs = require('rotating-file-stream');
const accounts = require('./routers/accounts.router');
const auth = require('./routers/auth.router');
const movements = require('./routers/movements.router');
const categories = require('./routers/categories.router');
const middlewares = require('./middlewares');

const PORT = process.env.PORT || 3001;
mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) {
      console.log('conexión con Mongo Exitosa');
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
if (process.env.ENV === 'production') {
  app.use(
    morgan(
      '[:date[clf]] :method :url :status :response-time ms - :res[content-length] ":user-agent"',
      { stream: accessLogStream }
    )
  );
} else {
  app.use(morgan('dev'));
}

app.use('/auth', auth);
app.use('/accounts', accounts);
app.use('/movements', movements);
app.use('/categories', categories);

app.use(middlewares.NotFound);

app.listen(PORT, () => {
  console.log(`El app empezo en el puerto: ${PORT}`);
});
