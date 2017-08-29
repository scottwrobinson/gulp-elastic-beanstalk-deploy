gulp-elastic-beanstalk-deploy
=====

> A Gulp module for deploying to AWS Elastic Beanstalk

This plugin helps you to integrate your deployment task on the Amazon AWS Elasticbeanstalk service into gulp. Your deployment job will be more mainatainable and efficient, so that you can increase productivity.

_Based on [gulp-beanstalk-deploy](https://github.com/a0ly/gulp-beanstalk-deploy) by SeungJae Lee._

## Getting Started

You can install plugin by this command:

```shell
npm install gulp-elastic-beanstalk-deploy
```

## Overview

```javascript
gulp.task('deploy', function(cb) {
  eb({
    // options here
  }, cb)
});
```

### Options

A * indicates a mandatory option.

##### accessKeyId

* Type: `string`
* Default: `~/.aws/credentials`

The aws access key id. If nothing passwed, it will use your local aws profile credential.

##### secretAccessKey

* Type: `string`
* Default: `~/.aws/credentials`

The aws access secret access key. If nothing passwed, it will use your local aws profile credential.

##### region *
* Type: `string`

Your application region. It must be provided.

##### applicationName *
* Type: `string`

Your application name. It must be provided.

##### environmentName *
* Type: `string`

Your application enviroment name. It must be provided.

##### versionLabel
* Type: `string`
* Default: sourceBundle file name without the extension

##### description
* Type: `string`

Your deployment description.

##### settings
* Type: `Array`

Your environment setting parameters.

##### waitForDeploy
* Type: `boolean`
* Default: true

##### checkIntervalSec
* Type: `number`
* Default: 2sec

Interval time to check deploying status. (sec)

##### s3Bucket
* Type: `object`
* Default:
```javascript
{
    bucket: // applicationName
    key: // sourceBundle basename
}
```

##### sourceBundle *
* Type: `string`

archive file path to upload. It must exists in your local file system, which means the archive file must be prepared before deployment task.

## Usage Example
``` javascript
var gulp = require('gulp');
var eb = require('gulp-elastic-beanstalk-deploy');

gulp.task('deploy', function(cb) {
  eb({
    accessKeyId: 'Your AWS accessKeyId', // optional
    secretAccessKey: 'Your AWS secretAccessKey', // optional
    region: 'us-west-1', // required
    applicationName:'gulp-elastic-beanstalk-deploy',
    environmentName: 'gulp-elastic-beanstalk-deploy-env',
    versionLabel: '1.0.0',
    sourceBundle: './archive.zip',
    description: 'description here'
  }, cb);
});
```

## License
MIT
