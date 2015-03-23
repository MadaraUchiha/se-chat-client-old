// Created by madara all rights reserved.

import {Authenticator} from './Authenticator';
import Promise from 'bluebird';
import cheerio from 'cheerio';
import {HttpClient} from '../../utils/HttpClient';

export class StackExchangeAuthenticator extends Authenticator {
    static inject() { return [HttpClient]; }
    /**
     * @param  {HttpClient} httpClient Promisified, cookie enabled request instance.
     */
    constructor(httpClient) {
        this.http = httpClient;
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
        return this.http.get(url)
            .then(([res, body]) => body);
    }
}