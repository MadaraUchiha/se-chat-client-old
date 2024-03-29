import Client from '../client/Client.js';
import HttpError from '../errors/HttpError.js';
import AuthenticatorFactory from '../client/authentication/AuthenticatorFactory.js';
import { presentIn, not } from '../utils/functional.js';
import httpRequest from 'request';
import Promise from 'bluebird';
import ClientPool from '../client/ClientPool.js';

let cookieJar = httpRequest.jar();
httpRequest = Promise.promisify(httpRequest.defaults({jar: cookieJar}));

var pool = new ClientPool();

export default (request, response, next) => {
    let requiredFields = [ 'email', 'password', 'server', 'defaultRoom' ];
    let allFieldsPresent = requiredFields.every(presentIn(request.body));
    if (!allFieldsPresent) {
        throw new HttpError(
            'Request must include the following missing parameters (see extra)',
            400,
            requiredFields.filter(not(presentIn(request.body)))
        );
    }
    let {server, email, password, defaultRoom} = request.body;
    console.info(`All validations pass! Let's see if there's an existing client at ${server}#${email}...`);
    let existingClient = Client.clientPool[server + '#' + email];
    if (existingClient) {
        console.info(`Yup! Let me send you the existing client...`);
        response.json({
            httpStatus: 200,
            description: 'OK',
            webSocket: existingClient.getChatWebSocket()
        });
        return;
    }
    console.info(`Nope! Let's make one!`);
    let authenticator = AuthenticatorFactory.make(server);
    let client = new Client(authenticator, defaultRoom);
    console.info(`Client succesfully created. Authenticating...`);
    client.authenticate(email, password)
        .then(function loginSuccessful(url) {
            console.log(url);
            pool.add(server, email, client);
            return client;
        })
        .then(client => client.getChatWebSocket())
        .then(webSocket => {
            response.json({
                httpStatus: 200,
                description: 'OK',
                webSocket: webSocket
            });
        })
        .catch(next);
};