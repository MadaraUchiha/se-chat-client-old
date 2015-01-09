// Created by madara all rights reserved.

'use strict';

/**
 * Error Object for responding with error Http Statuses.
 * @param message - Error message. Will map to the extended key in the error object in the response.
 * @param statusCode - Will be the HTTP status code responded, will be in the object too.
 * @param extra - An extra free parameter to add extra details.
 * @constructor
 */
function HttpError(message, statusCode, extra) {
    this.message = message;
    this.statusCode = statusCode;
    this.extra = extra;
}

HttpError.prototype = new Error();

HttpError.descriptionMap = {
    400: "Bad Request",
    404: "Page Not Found",
    500: "Server Error"
};

module.exports = HttpError;