/**
 * Created by itay on 3/24/17.
 */

var innerActions = {
  'create': require('./app/create')
};

module.exports = function (options) {

  // see json upper -> it should be second command -> init, deploy
  var command = options._[1];

  if (!innerActions[command]) {
    logger.error("Could not find app command " + command);
    process.exit(1);
  }

  innerActions[command](options);

};
