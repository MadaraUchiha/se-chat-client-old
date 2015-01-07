// Created by madara all rights reserved.

'use strict';

var app = require('express')(),
    bodyParser = require('body-parser'),
    chatAuthenticator = require('./client/authentication/chatAuthenticator');
app.use(bodyParser.json());
app.post('/login', chatAuthenticator.serverCallback());

var server = app.listen(8080, function serverReady() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Stack Exchange Bot API listening at http://%s:%s', host, port);
    console.log('To Authenticate, send a POST request to /login with user and pass in a JSON object');

});