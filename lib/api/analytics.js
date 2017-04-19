/**
 * Created by itay on 4/19/17.
 */
"use strict";

var config =  require('../config');

var Analytics = require('analytics-node');
var analytics = new Analytics(config.analytics.key, { flushAt: 1 });

module.exports.identify = identify;
module.exports.track = track;

function identify(email, fullName){

  analytics.identify({
    userId: email,
    traits: {
      name: fullName,
      email: email,
      createdAt: new Date().getTime()
    }
  });
}

function track(email, event, properties){

  email = email || config.analytics.anonymousId;

  analytics.track({
    userId: email,
    event: event,
    properties: properties
  });
}