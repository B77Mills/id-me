const { applicationService } = require('@base-cms/id-me-service-clients');

module.exports = {
  AccessLevel: {
    id: level => level._id,
  },

  Query: {
    /**
     *
     */
    accessLevels: (_, args, { app }) => {
      const id = app.getId();
      return applicationService.request('access-level.listForApp', { id });
    },
  },

  Mutation: {
    /**
     *
     */
    createAccessLevel: (_, { input }, { app }) => {
      const { name } = input;
      const payload = { name };
      const applicationId = app.getId();
      return applicationService.request('access-level.create', {
        applicationId,
        payload,
      });
    },
  },
};
