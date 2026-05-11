const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const db = require('./data/db');

const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layouts/public');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: 'kiosk-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  res.locals.user = req.session.user || null;
  res.locals.currentUrl = req.originalUrl;

  const basket = req.session.basket || [];
  res.locals.basketCount = basket.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  if (!req.session.user) {
    const favorites = req.session.favorites || [];
    res.locals.favoriteCount = favorites.length;
    res.locals.hasFavorites = favorites.length > 0;
    return next();
  }

  const favoritesSql = `
    SELECT COUNT(*) AS count
    FROM favorites
    WHERE user_id = ?
  `;

  db.get(favoritesSql, [req.session.user.id], (err, row) => {
    if (err) {
      return next(err);
    }

    res.locals.favoriteCount = row.count;
    res.locals.hasFavorites = row.count > 0;


  next();
});

});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
