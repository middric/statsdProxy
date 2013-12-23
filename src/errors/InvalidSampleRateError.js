function InvalidSampleRateError(message) {
    this.name = 'InvalidSampleRateError';
    this.message = (message || "");
}
InvalidSampleRateError.prototype = Error.prototype;

module.exports = InvalidSampleRateError;
