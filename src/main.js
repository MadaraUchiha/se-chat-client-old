// Created by madara all rights reserved.

'use strict';

var chatBotServer = function() {
    var app = require('express')(),
        bodyParser = require('body-parser'),
        Client = require('./client/Client');

    app.use(bodyParser.json());
    app.post('/login', Client.serverCallback());
    app.use(function Errors(err, request, response, next) {
        var HttpError = require('./errors/HttpError');
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

    var server = app.listen(8080, function serverReady() {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Stack Exchange Bot API listening at http://%s:%s', host, port);
        console.log('To Authenticate, send a POST request to /login with user and pass in a JSON object');

    });
};

module.exports = chatBotServer;