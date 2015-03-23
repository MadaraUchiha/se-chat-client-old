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
        return Promise.coroutine(function*(email, password) {
            let i = console.info;
            i(`Stack Exchange Authentication starting...`);
            i(`Hitting https://stackexchange.com/users/signin to get form URL`);
            let loginFormUrl = yield this.getLoginFormUrl();
            i(`Got it! Hitting ${loginFormUrl}...`);
            let loginFormBody = yield this.getBody(loginFormUrl);
            let formDocument = cheerio.load(loginFormBody);
            let fkey = formDocument('input[name="fkey"]').val();
            let affId = formDocument('input[name="affId"]').val();
            let loginFormSubmitUrl = 'https://openid.stackexchange.com' + formDocument('form').eq(0).attr('action');
            i(`Got it! Submitting to ${loginFormSubmitUrl}...`);
            let [formPostedResponse, formPosted] = yield this.http.post(loginFormSubmitUrl, { fkey, email, password, affId});
            console.error(formPostedResponse.request.headers.cookie);
            i(`Done! now just to access the link to complete logging in...`);
            let finishLoginLink = cheerio.load(formPosted)('a').attr('href');
            let [finishLoginResponse, finishLoginBody] = yield this.http.get(finishLoginLink);
            console.error(finishLoginResponse.request.headers.cookie);

            i(`Done! Now I'm logged into Stack Exchange!`);

            // At this point, I'm authenticated against Stack Exchange. Now let's access chat!

            i('Hitting chat frontpage...');
            yield this.http.get('http://chat.stackexchange.com');

            i('Asking for chat auth parameters...');
            let [chatLoginResponse, chatLoginBody] = yield this.http.post('http://stackexchange.com/users/chat-login');
            let chatLoginDoc = cheerio.load(chatLoginBody);
            let loginUrl = chatLoginDoc('#chat-login-form').attr('action');
            let token = chatLoginDoc('#authToken').val();
            let nonce = chatLoginDoc('#nonce').val();

            i(`Got it! Posting to ${loginUrl}...`);
            let [loginFallbackResponse, loginFallbackBody] = yield this.http.post(loginUrl, {token, nonce}, {headers: {'Referer': 'http://stackexchange.com/users/chat-login'}});
            console.log(loginFallbackBody);
            debugger;
            return Promise.reject(new Error('Not yet implemented!'));
        }.bind(this))(email, password);
    }

    getLoginFormUrl() {
        return this.getBody('https://stackexchange.com/users/signin');
    }

    getBody(url) {
        return this.http.get(url)
            .then(([res, body]) => body);
    }
}