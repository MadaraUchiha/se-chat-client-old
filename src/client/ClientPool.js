// Created by madara all rights reserved.

export default class ClientPool {
    constructor() {
        this.pool = {};
    }
    add(server, email, client) {
        this.pool[server] = this.pool[server] || {};
        if (this.pool[server][email]) {
            throw new Error('Cannot add client to pool. Client already exists with that server and email.');
        }
        this.pool[server][email] = client;
    }
}