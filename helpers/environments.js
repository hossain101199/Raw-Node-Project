/* eslint-disable prettier/prettier */
/*
 * Title: Environments
 * Description: Handle all environment related things
 * Author: Hossain
 *
 */

// depaendencies

// module scaffolding
const environments = {};

// staging environment
environments.staging = {
  port: 3000,
  envName: 'staging',
  secretKey: 'hsjdhsdhsjdhjshdjshd',
  maxChecks: 5,
  twilio: {
    fromPhone: '+12184234217',
    accountSid: 'ACc9f52de2940f9e52c81c1e4555a164ff',
    authToken: 'f0b92dfc035a8128d7378590afa1631d',
  },
};

// production environment
environments.production = {
  port: 6000,
  envName: 'production',
  secretKey: 'djkdjskdjksdjksjdskjd',
  maxChecks: 5,
  twilio: {
    fromPhone: '+12184234217',
    accountSid: 'ACc9f52de2940f9e52c81c1e4555a164ff',
    authToken: 'f0b92dfc035a8128d7378590afa1631d',
  },
};

// determine which environment was passed
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport = typeof environments[currentEnvironment] === 'object'
    ? environments[currentEnvironment]
    : environments.staging;

// export module
module.exports = environmentToExport;
