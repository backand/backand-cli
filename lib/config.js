module.exports = {
    backand: {
        protocol:'http',
        host:'localhost',
        port: '4110'
    },
    cloudService:{
        action_url: 'http://localhost:3001/#/app/<appName>/objects/<objectId>/actions'
    },
    template:{
        url: 'http://s3.amazonaws.com/templates.backand.net/action/nodejs/1.0',
        files:['/debug.js','/handler.js','/index.js']
    }
};
