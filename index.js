'use strict';

const optionSetup = require('./lib/setup');
const awsWrapper = require('./lib/aws');

module.exports = function(opts, cb) {
    let sets = optionSetup(opts);
  
    awsWrapper.upload(sets).then(function() {
        return awsWrapper.createApplicationVersion(sets);
    }).then(function(version) {
        if (opts.uploadOnly) {
            return;
        }

        return awsWrapper.updateEnvironment(sets, version);
    }).then(function(result) {
        if (opts.uploadOnly) {
            return result;
        }

        if (opts.waitForDeploy === undefined || opts.waitForDeploy === null) {
            opts.waitForDeploy = true;
        }

        if (opts.waitForDeploy) {
            return awsWrapper.waitdeploy(sets, opts.checkIntervalSec || 2000);
        } else {
            return result;
        }
    }).then(function(result) {
        cb(null, result);
    }).catch(function(error) {
        cb(error);
    });
};