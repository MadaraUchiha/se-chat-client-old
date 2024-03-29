// Created by madara all rights reserved.

import {StackOverflowAuthenticator} from './StackOverflowAuthenticator.js';
import {StackExchangeAuthenticator} from './StackExchangeAuthenticator.js';
import {MetaStackExchangeAuthenticator} from './MetaStackExchangeAuthenticator.js';

import HttpError from '../../errors/HttpError.js';

import {Chusha} from 'chusha';

export default class AuthenticatorFactory {
    static make(server) {
        let dispatchTable = {
            so: StackOverflowAuthenticator,
            se: StackExchangeAuthenticator,
            mse: MetaStackExchangeAuthenticator
        };

        if (!dispatchTable[server]) {
            throw new HttpError(
                server + 'is not a valid server. See extra for list of valid servers.',
                400,
                Object.keys(dispatchTable)
            );
        }
        return Chusha.get(dispatchTable[server]);
    }
}