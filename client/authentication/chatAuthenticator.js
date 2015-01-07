// Created by madara all rights reserved.

'use strict';

var authenticator = (function (Promise) {
    /**
     * Attempts to sign in to Stack Exchange chat
     * @param username
     * @param password
     */
    var signIn = function (username, password) {

    };
    var getServerCallback = function () {
        return function (request, response) {
            var requiredFields = [ 'username', 'password', 'server', 'default-room' ];
            var allFieldsPresent = requiredFields.every(presentIn(request.body));
            if (!allFieldsPresent) {
                response.status(400).json({
                    statusCode: 400,
                    description: "Bad Request",
                    extended: "Request must include the following missing parameters",
                    missing: requiredFields.filter(not(presentIn(request.body)))
                });
                return;
            }
            response.send(request.body);
        };

    };

    var presentIn = function(inWhat) {
        return function presentInBody(field) {
            return Boolean(inWhat[field]);
        };
    };

    var not = function(callback) {
        return function() {
            return !callback.apply(null, arguments);
        };
    };

    return {
        serverCallback: getServerCallback
    };
})(require('bluebird'));

module.exports = authenticator;