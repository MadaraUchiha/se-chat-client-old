// Created by madara all rights reserved.

import HttpError from '../errors/HttpError.js';
import Promise from 'bluebird';
import request from 'request';
import Authenticator from './authentication/chatAuthenticator';

var coroutine = Promise.coroutine;

function Client(authenticator, defaultRoom) {
    this.authenticator = authenticator;
    this.defaultRoom = defaultRoom;

    this.fkey = '';

    this.rooms = [];

    this.cookieJar = request.jar();
    this.request = Promise.promisify(request.defaults({jar: this.cookieJar}));
}

Client.prototype.authenticate = function(email, password) {
    //I'm not sure I need to keep the authenticator, but I might so meh.
    return this.authenticator.authenticate(email, password, this.server);
};

Client.clientPool = [];

export default Client;