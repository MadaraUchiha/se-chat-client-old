import request from 'request';
import Promise from 'bluebird';

//Promise.promisifyAll(request);

export class HttpClient {
    constructor() {
        this.jar = request.jar();
        this.request = request.defaults({jar: this.jar});
    }

    get(uri) {
        return Promise.fromNode(cb => this.request(uri, cb));
    }

    post(uri, params, options) {
        return Promise.fromNode(cb => this.request.post(uri, Object.assign({form: params}, options), cb));
    }
}
