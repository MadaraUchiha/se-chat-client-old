// Created by madara all rights reserved.

import Promise from 'bluebird';
import cheerio from 'cheerio';
import HttpError from '../../errors/HttpError.js';

Promise.longStackTraces();

var serversMap = {
    stackoverflow: {formPage: 'http://stackoverflow.com/users/login', formSubmit: 'http://stackoverflow.com/users/login'},
    stackexchange: {formPage: 'http://stackexchange.com/users/login', formSubmit: 'http://stackexchange.com/affiliate/form/login/submit'}
};

/**
 * The Authenticator object is responsible for authenticating the chat Client with the Stack Exchange chat botServer.
 * @param {Request} request Request instance with cookies enabled.
 * @param cookieJar
 * @constructor
 */
function Authenticator(request, cookieJar) {
    this.request = request;
    this.cookieJar = cookieJar;
}

Authenticator.prototype.login = Promise.coroutine(function*(email, password, server) {
    this.validateDetails(server);
    yield this.loginSEOpenID(email, password);
    console.log('Logged into StackExchange openId');
    yield this.loginSO(server);
    console.log('Logged into chat', server);

    return this.request;
});

Authenticator.prototype.validateDetails = function (server) {
    if (!serversMap[server]) {
        throw new HttpError(
            'Unsupported server ' + server + '. Please review the list of supported servers in the extra field.',
            400,
            Object.keys(serversMap)
        );
    }
};

Authenticator.prototype.loginSEOpenID = function (email, password) {
    return this.initLogin(
        'https://openid.stackexchange.com/account/login',
        'https://openid.stackexchange.com/account/login/submit/',
        { email: email, password: password });
};

Authenticator.prototype.loginSO = function (server) {
    return this.initLogin(
        serversMap[server].formPage,
        serversMap[server].formSubmit,
        { openid_identifier: 'https://openid.stackexchange.com' });
};

// Similarly, the initLogin function here visits the login page, gets the fkey, and passes it all to auth, which does the authentication
// using a POST request with all the details
Authenticator.prototype.initLogin = function (getURL, formURL, formObj) {
    var self = this;
    console.log('Getting', getURL);

    return this.request({ url: getURL })
        .spread((res, body) => {
            console.log('Got url');
            var $ = cheerio.load(body);
            console.log('Parsed response');

            return self.auth($, formURL, formObj);
        });
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
    }).spread((response, body) => {
        if (response.statusCode > 399) {
            throw new HttpError('Bad status code! ' + response.statusCode + ' when trying to post to ' + formURL, 500, null);
        }
        return cheerio.load(body);
    });
};

export default Authenticator;