function getTimeMSFloat() {
    var hrtime = process.hrtime();
    return Math.round(( hrtime[0] * 1000000 + hrtime[1] / 1000 ) / 1000);
}

module.exports.getTimeMSFloat = getTimeMSFloat;