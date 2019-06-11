import Route from '@ember/routing/route';
import query from '@base-cms/id-me-manage/gql/queries/organization/users-and-invitations';
import OrgQueryMixin from '@base-cms/id-me-manage/mixins/org-query';

export default Route.extend(OrgQueryMixin, {
  model() {
    return this.query({ query });
  },
});
