// Created by madara all rights reserved.

import Client from './client/Client.js';
import express from 'express';
import bodyParser from 'body-parser';
import loginCallback from './routes/loginCallback';
import HttpError from './errors/HttpError.js';

var app = express();

app.use(bodyParser.json());
app.post('/login', loginCallback);
app.use(function HttpErrorHandler(err, request, response, next) {
    if (!(err instanceof HttpError)) {
        next(err);
        return;
    }
    var errorResponse = {
        statusCode: err.statusCode,
        description: HttpError.descriptionMap[err.statusCode],
        extended: err.message,
        extra: err.extra
    };
    console.error(errorResponse, err.stack);
    response.status(err.statusCode).json(errorResponse);
});
app.use(function GeneralErrorHandler(err, request, response, next) {
    let errorResponse = {
        statusCode: 500,
        description: 'Internal Server Error',
        extended: err.message,
        extra: null
    };
    console.error(errorResponse, err.stack);
    response.status(500).json(errorResponse);
});

var server = app.listen(5050, function serverReady() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Stack Exchange Bot API listening at http://%s:%s', host, port);
    console.log('To Authenticate, send a POST request to /login with user and pass in a JSON object');

});