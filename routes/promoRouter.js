const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');

        next();
    })
    .get((req, res) => {
        res.end('Will send all the promotions to you!');
    })
    .post((req, res) => {
        res.end(`Will add the promotion: ${req.body.name} with details: ${req.body.description}`);
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('Put operations is not supported on /promotions');
    })
    .delete((req, res) => {
        res.end('Will delete all the promotions!');
    });

promoRouter.route('/:promoId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        res.end(`Will send details of the promotion: ${req.params.promoId} to you!`);
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`Post operations is not supported on /promotions/${req.params.promoId}`);
    })
    .put((req, res) => {
        res.write(`Will update the promotion: ${req.params.promoId} \n`);
        res.end(`Promotion name: ${req.body.name}, details: ${req.body.description}`);
    })
    .delete((req, res) => {
        res.end(`Will delete the promotion ${req.params.promoId}!`);
    });

module.exports = promoRouter;