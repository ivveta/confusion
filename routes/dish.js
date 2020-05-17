const express = require('express');
const bodyParser = require('body-parser');

const autenticate = require('../authenticate');
const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
    .get((req, res, next) => {
        Dishes.find({})
            .then(dishes => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, err => next(err))
            .catch(err => next(err));
    })
    .post(autenticate.verifyUser, (req, res, next) => {
        Dishes.create(req.body)
            .then(dish => {
                console.log('Dish created');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, err => next(err))
            .catch(err => next(err));
    })
    .put(autenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('Put operations is not supported on /dishes');
    })
    .delete(autenticate.verifyUser, (req, res, next) => {
        Dishes.remove({})
            .then(resp => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, err => next(err))
            .catch(err => next(err));
    });

dishRouter.route('/:dishId')
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, err => next(err))
            .catch(err => next(err));
    })
    .post(autenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`Post operations is not supported on /dishes/${req.params.dishId}`);
    })
    .put(autenticate.verifyUser, (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, { $set: req.body }, { new: true })
            .then(dish => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, err => next(err))
            .catch(err => next(err));
    })
    .delete(autenticate.verifyUser, (req, res, next) => {
        Dishes.findByIdAndRemove(req.params.dishId)
            .then(resp => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, err => next(err))
            .catch(err => next(err));
    });

dishRouter.route('/:dishId/comments')
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                if (dish == null) {
                    const err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments);

            }, err => next(err))
            .catch(err => next(err));
    })
    .post(autenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                if (dish == null) {
                    const err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }

                dish.comments.push(req.body);
                dish.save()
                    .then(dish => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    }, err => next(err));
            }, err => next(err))
            .catch(err => next(err));
    })
    .put(autenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`Put operations is not supported on /dishes/${req.params.dishId}/comments`);
    })
    .delete(autenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                if (dish == null) {
                    const err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }

                for (let i = (dish.comments.length - 1); i >= 0; i--) {
                    dish.comments.id(dish.comments[i]._id).remove();
                }

                dish.save()
                    .then(dish => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    }, err => next(err));
            }, err => next(err))
            .catch(err => next(err));
    });

dishRouter.route('/:dishId/comments/:commentId')
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                const comment = dish.comments.id(req.params.commentId);
                if (dish == null) {
                    const err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }

                if (comment == null) {
                    const err = new Error(`Сomment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);
            }, err => next(err))
            .catch(err => next(err));
    })
    .post(autenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`Post operations is not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`);
    })
    .put(autenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                const comment = dish.comments.id(req.params.commentId);
                if (dish == null) {
                    const err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }

                if (comment == null) {
                    const err = new Error(`Сomment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }

                if (req.body.rating != null) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }

                if (req.body.comment != null) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;
                }

                dish.save()
                    .then(dish => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    }, err => next(err));

            }, err => next(err))
            .catch(err => next(err));
    })
    .delete(autenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then(dish => {
                if (dish == null) {
                    const err = new Error(`Dish ${req.params.dishId} not found`);
                    err.status = 404;
                    return next(err);
                }

                if (dish.comments.id(req.params.commentId) == null) {
                    const err = new Error(`Сomment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }

                dish.comments.id(req.params.commentId).remove();

                dish.save()
                    .then(dish => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);
                    }, err => next(err));
            }, err => next(err))
            .catch(err => next(err));
    });

module.exports = dishRouter;