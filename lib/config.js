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
        action_url: 'https://www.backand.com/apps/#/app/<appName>/objects/<objectId>/actions'
    },
    mainAppName: 'bko'
};
