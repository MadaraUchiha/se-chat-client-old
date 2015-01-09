// Created by madara all rights reserved.

'use strict';

var Promise = require('bluebird'),
    cheerio = require('cheerio'),
    HttpError = require('../../errors/HttpError');


Promise.longStackTraces();

var serversMap = {
    stackoverflow: {formPage: 'http://stackoverflow.com/users/login', formSubmit: "http://stackoverflow.com/users/login"},
    stackexchange: {formPage: 'http://stackexchange.com/users/login', formSubmit: "http://stackexchange.com/affiliate/form/login/submit"}
};

/**
 * The Authenticator object is responsible for authenticating the chat Client with the Stack Exchange chat server.
 * @param {Request} request Request instance with cookies enabled.
 * @param cookieJar
 * @constructor
 */
function Authenticator(request, cookieJar) {
    this.request = request;
    this.cookieJar = cookieJar;
}

Authenticator.prototype.login = function (email, password, server) {
    return this.validateDetails(server)
        .then(this.loginSEOpenID(email, password))
        .then(this.loginSO(server));
};

Authenticator.prototype.validateDetails = function (server) {
    return new Promise(function (resolve, reject) {
        if (!serversMap[server]) {
            reject(new HttpError(
                'Unsupported server ' + server + '. Please review the list of supported servers in the extra field.',
                400,
                Object.keys(serversMap)
            ));
            return;
        }
        resolve();
    });
};

Authenticator.prototype.loginSEOpenID = function (email, password) {
    return function() {
        return this.initLogin(
            'https://openid.stackexchange.com/account/login',
            'https://openid.stackexchange.com/account/login/submit/',
            { email: email, password: password })
            .then(function () {
                console.log('Logged in to StackExchange OpenId');
            });
    }.bind(this);
};

Authenticator.prototype.loginSO = function (server) {
    return function () {
        return this.initLogin(
            serversMap[server].formPage,
            serversMap[server].formSubmit,
            { openid_identifier: 'https://openid.stackexchange.com' })
            .then(function () {
                console.log('Logged in to Chat', server);
            });
    }.bind(this);
};

// Similarly, the initLogin function here visits the login page, gets the fkey, and passes it all to auth, which does the authentication
// using a POST request with all the details
Authenticator.prototype.initLogin = function (getURL, formURL, formObj) {
    console.log('Getting', getURL);

    return this.request({ url: getURL })
        .spread(function (res, body) {
            console.log('Got url');
            var $ = cheerio.load(body);
            console.log('Parsed response');

            return this.auth($, formURL, formObj);
        }.bind(this));
};

// Note that the auth function does append the fkey to the formObj sent in the POST request
Authenticator.prototype.auth = function ($, formURL, formObj) {
    formObj.fkey = $('input[name="fkey"]').val();

    console.log('Submitting to', formURL);

    return this.request({
        method: 'post',
        followAllRedirects: true,
        url: formURL,
        form: formObj
    }).spread(function (response, body) {
        if (response.statusCode > 399) {
            throw new HttpError("Bad status code! " + response.statusCode + " when trying to post to " + formURL, 500, null);
        }
        return cheerio.load(body);
    });
};

module.exports = Authenticator;
