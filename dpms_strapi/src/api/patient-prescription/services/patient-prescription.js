'use strict';

/**
 * patient-prescription service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::patient-prescription.patient-prescription');
