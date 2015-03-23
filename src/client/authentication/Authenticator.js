// Created by madara all rights reserved.

export class Authenticator {
    constructor() {
        throw new Error('Authenticator is an abstract class, it cannot be instantiated.');
    }

    authenticate(email, password) {
        throw new Error('authenticate must be implemented');
    }
}