// Created by madara all rights reserved.

import {Authenticator} from './Authenticator.js';

export class StackOverflowAuthenticator extends Authenticator {
    constructor() {
        throw new Error('Stack Overflow is not supported yet.');
    }
}