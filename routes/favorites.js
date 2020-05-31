const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      }, err => next(err))
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(favorites => {
        const saveFavorites = (favorites) => {
          favorites.save()
            .then(favorites => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, err => next(err));
        };

        if (favorites == null) {
          // создаем новый
          Favorites
            .create({ user: req.user._id, dishes: [] })
            .then(favorites => {
              req.body.forEach(dish => {
                favorites.dishes.push(dish._id);
              });

              saveFavorites(favorites);

            }, err => next(err));

          return;
        }

        req.body.forEach(dish => {
          if (!favorites.dishes.includes(dish._id)) {
            favorites.dishes.push(dish._id);
          }
        });

        saveFavorites(favorites);
      }, err => next(err))
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`Put operations is not supported on /favorites`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then(resp => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, err => next(err))
      .catch(err => next(err));
  });

favoriteRouter.route('/favorites/:dishId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`Get operations is not supported on /favorites/:dishId`);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites == null) {
          // создаем новый
          Favorites
            .create({ user: req.user._id, dishes: [req.body] })
            .then(favorites => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, err => next(err));

          return;
        }

        if (!favorites.dishes.includes(req.body)) {
          favorites.dishes.push(req.body);

          favorites.save()
            .then(favorites => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorites);
            }, err => next(err));

          return;
        }

        res.statusCode = 403;
        res.end(`Dish with id ${req.body} is already in favorites`);
      }, err => next(err))
      .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`Put operations is not supported on /favorites/:dishId`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites == null) {
          const err = new Error(`Favorites are empty`);
          err.status = 404;
          return next(err);
        }

        const dishIndex = favorites.dishes.findIndex(req.params.dishId);

        if (dishIndex === -1) {
          const err = new Error(`Dish ${req.params.dishId} is not on the favorites`);
          err.status = 404;
          return next(err);
        }

        favorites.dishes.splice(dishIndex, 1);

        favorites.save()
          .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
          }, err => next(err));
      }, err => next(err))
      .catch(err => next(err));
  });
module.exports = favoriteRouter;
