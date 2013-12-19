function InvalidRefererError(message) {
    this.name = 'InvalidRefererError';
    this.message = (message || "");
}
InvalidRefererError.prototype = Error.prototype;

module.exports = InvalidRefererError;
