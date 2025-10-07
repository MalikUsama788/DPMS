'use strict';

/**
 * user-location service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-location.user-location');
