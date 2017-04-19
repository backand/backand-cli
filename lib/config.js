module.exports = {
    /*
    backand: {
        protocol:'http',
        host:'localhost',
        port: '4110'
    },
    cloudService:{
        action_url: 'http://localhost:3001/#/app/<appName>/objects/<objectId>/actions'
    }
    */
    backand: {
        protocol:'https',
        host:'api.backand.com',
        port: '443'
    },
    cloudService:{
        action_url: 'https://www.backand.com/apps/#/app/<appName>/objects/<objectId>/actions/<actionId>/true',
        function_url: 'https://www.backand.com/apps/#/app/<appName>/function/<functionId>/true'
    },
    mainAppName: 'bko',
    analytics:{
      //key: 'BDCFyVrRyqjnGE4Cu1xe5ziPErtcPkHj', //test
      key: 'B9HnYlGFEZGQ99PkivFxE4kK4M8PKk3B', //prod
      anonymousId: 'cli@backand.io'
    }
};
