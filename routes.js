/* eslint-disable prettier/prettier */
/*
 * Title: Routes
 * Description: Application Routes
 * Author: Hossain
 *
 */

// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
};

module.exports = routes;
