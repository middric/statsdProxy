function InvalidQuerystringError(message) {
    this.name = 'InvalidQuerystringError';
    this.message = (message || "");
}
InvalidQuerystringError.prototype = Error.prototype;

module.exports = InvalidQuerystringError;
