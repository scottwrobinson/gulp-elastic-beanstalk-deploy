'use strict';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const AWS  = require('aws-sdk');

module.exports = function(opts) {
    let sets = {};

    if (opts.accessKeyId && opts.secretAccessKey) {
        AWS.config.credentials = new AWS.Credentials({
            accessKeyId: opts.accessKeyId,
            secretAccessKey: opts.secretAccessKey
        });
    } else if (opts.profile) {
        AWS.config.credentials = new AWS.SharedIniFileCredentials({
            profile: opts.profile
        });
    }

    if (!opts.region) {
        throw new Error('Param missing [region]');
    }
    if (!opts.applicationName) {
        throw new Error('Param missing [applicationName]');
    }
    if (!opts.environmentName) {
        throw new Error('Param missing [environmentName]');
    }
    if (!opts.sourceBundle) {
        throw new Error('Param missing [sourceBundle]');
    }
  
    try {
        fs.statSync(opts.sourceBundle);
    } catch(e) {
        let errorMsg;
        if (e.code === 'ENOENT' ) {
            errorMsg = new Error('Invalid sourceBundle, It is not exist ' + opts.sourceBundle);
        } else {
            errorMsg = e;
        }
        throw errorMsg;
    }
  
    sets.opts = _.pick(opts,[
        'region',
        'applicationName',
        'environmentName',
        'sourceBundle',
        'description'
    ]);
  
    sets.opts.versionLabel = opts.versionLabel || path.basename(opts.sourceBundle, path.extname(opts.sourceBundle));

    sets.bucketParam = {
        Bucket: (opts.s3Bucket && opts.s3Bucket.bucket) || opts.applicationName,
        Key: (opts.s3Bucket && opts.s3Bucket.key) || path.basename(opts.sourceBundle)
    };

    sets.eb = new AWS.ElasticBeanstalk({ region: opts.region });

    sets.envSettings = opts.settings;

    return sets;
};
