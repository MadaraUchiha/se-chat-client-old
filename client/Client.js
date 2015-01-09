// Created by madara all rights reserved.

'use strict';

var HttpError = require('../errors/HttpError'),
    Promise = require('bluebird');

function Client(server, defaultRoom) {
    this.server = server;
    this.defaultRoom = defaultRoom;

    this.fkey = '';

    this.rooms = [];

    this.request = require('request');
    this.request = Promise.promisifyAll(this.request.defaults({jar: this.request.jar()}));
}

Client.prototype.authenticate = function(email, password) {
    var Authenticator = require('./authentication/chatAuthenticator');
    //I'm not sure I need to keep the authenticator, but I might so meh.
    this.authenticator = new Authenticator(this.request);

    return this.authenticator.login(email, password, this.server);
};

Client.serverCallback = function() {
    return function (request, response, next) {
        var requiredFields = [ 'email', 'password', 'server', 'default-room' ];
        var allFieldsPresent = requiredFields.every(presentIn(request.body));
        if (!allFieldsPresent) {
            throw new HttpError(
                'Request must include the following missing parameters (see extra)',
                400,
                requiredFields.filter(not(presentIn(request.body)))
            );
        }
        var client = new Client(request.body.server, request.body["default-room"]);
        client.authenticate(request.body.email, request.body.password, request.body.server)
            .then(function loginSuccessful() {
                Client.clientPool.push(client);
                response.send(request.body);
            }.bind(this))
            .catch(next);
    }.bind(this);
};

var presentIn = function (inWhat) {
    return function presentInBody(field) {
        return Boolean(inWhat[field]);
    };
};

var not = function (callback) {
    return function () {
        return !callback.apply(this, arguments);
    };
};

Client.clientPool = [];

module.exports = Client;