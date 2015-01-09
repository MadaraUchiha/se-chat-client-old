// Created by madara all rights reserved.

'use strict';

var Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request')),
    cheerio = require('cheerio');


var cookieJar;
Promise.longStackTraces();

var serversMap = {
    so: {formPage: 'http://stackoverflow.com/users/login', formSubmit: "http://stackoverflow.com/users/login"},
    se: {formPage: 'http://stackexchange.com/users/login', formSubmit: "http://stackexchange.com/affiliate/form/login/submit"}
};

function Authenticator() {
    this.cookieJar = request.jar();
    request.defaults({jar: this.cookieJar});
    cookieJar = this.cookieJar;
}

Authenticator.prototype.serverCallback = function () {
    return function (request, response, next) {
        var requiredFields = [ 'email', 'password', 'server', 'default-room' ];
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
        login(request.body.email, request.body.password, request.body.server)
            .then(function () {
                response.send(request.body);
            }.bind(this))
            .catch(next);
    };
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

function login(email, password, server) {
    return loginSEOpenID(email, password)
        .then(loginSO(server));
}

var loginSEOpenID = function (email, password) {
    return initLogin(
        'https://openid.stackexchange.com/account/login',
        'https://openid.stackexchange.com/account/login/submit/',
        { email: email, password: password })
        .then(function () {
            console.log('Logged in to StackExchange OpenId');
        });
};

var loginSO = function (server) {
    return function () {
        initLogin(
            serversMap[server].formPage,
            serversMap[server].formSubmit,
            { openid_identifier: 'https://openid.stackexchange.com' })
            .then(function () {
                console.log('Logged in to Chat %s', server);
            });
    };
};

// Similarly, the initLogin function here visits the login page, gets the fkey, and passes it all to auth, which does the authentication
// using a POST request with all the details
var initLogin = function (getURL, formURL, formObj) {
    console.log('Getting', getURL);

    return request.getAsync({ url: getURL })
        .spread(function (res, body) {
            console.log('Got url');
            var $ = cheerio.load(body);
            console.log('Parsed response');

            return auth($, formURL, formObj);
        });
};

// Note that the auth function does append the fkey to the formObj sent in the POST request
var auth = function ($, formURL, formObj) {
    formObj.fkey = $('input[name="fkey"]').val();

    console.log('Submitting to', formURL);

    return request.postAsync({
        followAllRedirects: true,
        url: formURL,
        form: formObj
    }).spread(function (response, body) {
        if (response.statusCode > 399) {
            throw new Error("Bad status code! " + response.statusCode + " when trying to post to " + formURL);
        }
        return cheerio.load(body);
    });
};

module.exports = Authenticator;
