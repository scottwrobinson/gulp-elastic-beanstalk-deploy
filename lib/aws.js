'use strict';

const fs = require('fs');
const util = require('gulp-util');
const Q = require('q');
const AWS = require('aws-sdk');
const color = util.colors;
const logger = util.log;

function upload(sets) {
    let opts = sets.opts;
    let bucketParam = sets.bucketParam;
    let s3 = new AWS.S3();
    let deferred = Q.defer();

    logger('Start to upload sourceBundle to %s/%s',
        color.cyan(bucketParam.Bucket),
        color.cyan(bucketParam.Key));

    fs.readFile(opts.sourceBundle, function(err, data) {
        if (err) {
            deferred.reject(err);
            return;
        }

        s3.putObject({
            Bucket: bucketParam.Bucket,
            Key: bucketParam.Key,
            Body: new Buffer(data)
        }, function(err, result) {
            if (err) {
                deferred.reject(err);
                return;
            }

            logger('Upload success -> %s/%s ',
                color.cyan(bucketParam.Bucket),
                color.cyan(bucketParam.Key));
            deferred.resolve(result);
    
        });
    });
  
    return deferred.promise;
}

function createApplicationVersion(sets) {
    let eb = sets.eb;
    let opts = sets.opts;
    let bucketParam = sets.bucketParam;
    let deferred = Q.defer();
  
    logger('Start to create application version %s to %s',
        color.cyan(opts.applicationName),
        color.cyan(opts.versionLabel));
  
    eb.createApplicationVersion({
        ApplicationName: opts.applicationName,
        VersionLabel: opts.versionLabel,
        Description: opts.description,
        SourceBundle: {
            S3Bucket: bucketParam.Bucket,
            S3Key: bucketParam.Key
        }
    }, function(error, version) {
        if (error) {
            logger('Fail to create application %s version to %s',
                color.red(opts.applicationName),
                color.red(opts.versionLabel));
            deferred.reject(error);
        } else {
            logger('Create application %s version to %s success',
                color.cyan(opts.applicationName),
                color.cyan(opts.versionLabel));
            deferred.resolve(version);
        }
    });
    return deferred.promise;
}

function updateEnvironment(sets, version) {
    let eb = sets.eb;
    let opts = sets.opts;
    let envSettings = sets.envSettings;
    let versionLabel = version.ApplicationVersion.VersionLabel;
    let deferred = Q.defer();
    let envParameter = {};
  
    logger('Start to update enviroment version %s to %s',
        color.cyan(opts.environmentName),
        color.cyan(versionLabel));
  
    envParameter.EnvironmentName = opts.environmentName;
    envParameter.VersionLabel = versionLabel;
  
    if (envSettings) {
        envParameter.OptionSettings = envSettings;
    }
  
    eb.updateEnvironment(envParameter, function(error, result){
        if (error) {
            logger('Fail to update enviroment %s version to %s',
                color.red(opts.environmentName),
                color.red(versionLabel));
            deferred.reject(error);
        } else {
            logger('Deploying enviroment %s version to %s success',
                color.cyan(opts.environmentName),
                color.cyan(versionLabel));
            deferred.resolve(result);
        }
    });
  
    return deferred.promise;
}

function waitdeploy(sets, interval) {
    let eb = sets.eb;
    let opts = sets.opts;
    let waitState = sets.waitState = sets.waitState || {};
    let deferred = Q.defer();
  
    eb.describeEnvironmentHealth({
        EnvironmentName: opts.environmentName,
        AttributeNames: ['All']
    }, function(error, environment) {
        if (error) {
            return deferred.reject(error);
        }

        waitState.current = environment;
        waitState.current.color = color[environment.Color.toLowerCase()] || color.gray;

        if (waitState.prev) {
            let _p = waitState.prev.color;
            let _c = waitState.current.color;

            logger('Enviroment %s health has transitioned from %s(%s) to %s(%s)',
                color.cyan(opts.environmentName),
                _p(waitState.prev.HealthStatus),
                _p(waitState.prev.Status),
                _c(environment.HealthStatus),
                _c(environment.Status)
            );
        }

        waitState.prev = waitState.current;

        if (environment.Status === 'Ready') {
            deferred.resolve(environment);
            return;
        }

        deferred.resolve(Q.delay(interval).then(function(){
            waitdeploy(sets, interval);
        }));
    });

    return deferred.promise;
}

module.exports = {
    upload: upload,
    createApplicationVersion: createApplicationVersion,
    updateEnvironment: updateEnvironment,
    waitdeploy: waitdeploy
};
