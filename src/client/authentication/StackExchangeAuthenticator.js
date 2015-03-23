// Created by madara all rights reserved.

import {Authenticator} from './Authenticator';
import Promise from 'bluebird';
import cheerio from 'cheerio';

export default class StackExchangeAuthenticator extends Authenticator {
    /**
     * @param request Promisified, cookie enabled request instance.
     */
    constructor(request) {
        this.request = request;
    }

    authenticate(email, password) {
        var that = this;
        return Promise.coroutine(function*(email, password) {
            let loginFormUrl = yield that.getLoginFormUrl();
            let formDocument = cheerio.load(yield that.getBody(loginFormUrl));
            return loginFormUrl;
        })(email, password);
    }

    getLoginFormUrl() {
        return this.getBody('https://stackexchange.com/users/signin');
    }

    getBody(url) {
        return this.request(url)
            .then(([res, body]) => body);
    }
}