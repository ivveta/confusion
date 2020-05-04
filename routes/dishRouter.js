const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');

        next();
    })
    .get((req, res) => {
        res.end('Will send all the dishes to you!');
    })
    .post((req, res) => {
        res.end(`Will add the dish: ${req.body.name} with details: ${req.body.description}`);
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('Put operations is not supported on /dishes');
    })
    .delete((req, res) => {
        res.end('Will delete all the dishes!');
    });

dishRouter.route('/:dishId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end(`Will send details of the dish: ${req.params.dishId} to you!`);
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`Post operations is not supported on /dishes/${req.params.dishId}`);
    })
    .put((req, res) => {
        res.write(`Will update the dish: ${req.params.dishId} \n`);
        res.end(`Dish name: ${req.body.name}, details: ${req.body.description}`);
    })
    .delete((req, res) => {
        res.end(`Will delete the dish ${req.params.dishId}!`);
    });

module.exports = dishRouter;