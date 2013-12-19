function InvalidRequestError(message) {
    this.name = 'InvalidRequestError';
    this.message = (message || "");
}
InvalidRequestError.prototype = Error.prototype;

module.exports = InvalidRequestError;
