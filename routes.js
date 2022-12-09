/* eslint-disable prettier/prettier */
/*
 * Title: Routes
 * Description: Application Routes
 * Author: Hossain
 *
 */

// dependencies
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');

const routes = {
    sample: sampleHandler,
};

module.exports = routes;
