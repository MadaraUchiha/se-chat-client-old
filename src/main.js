// Created by madara all rights reserved.

import Client from './client/Client.js';
import express from 'express';
import bodyParser from 'body-parser';

var app = express();

app.use(bodyParser.json());
app.post('/login', Client.serverCallback());
app.use(function ErrorHandler(err, request, response, next) {
    import HttpError from './errors/HttpError.js';
    if (!(err instanceof  HttpError)) {
        next(err);
    }
    response.status(err.statusCode).json({
        statusCode: err.statusCode,
        description: HttpError.descriptionMap[err.statusCode],
        extended: err.message,
        extra: err.extra
    });
});

var server = app.listen(5050, function serverReady() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Stack Exchange Bot API listening at http://%s:%s', host, port);
    console.log('To Authenticate, send a POST request to /login with user and pass in a JSON object');

});