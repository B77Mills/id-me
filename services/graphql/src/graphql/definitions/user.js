const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  activeUser: User! @requiresAuth
  userOrganizations(input: UserOrganizationsQueryInput = {}): [OrganizationMembership]! @requiresAuth
  userInvitations(input: UserInvitationQueryInput = {}): [OrganizationInvitation]! @requiresAuth
}

extend type Mutation {
  registerNewUser(input: RegisterNewUserMutationInput!): UserRegistration!
  inviteUserToOrg(input: InviteUserToOrgMutationInput!): String @requiresOrgRole(roles: [Owner, Administrator])
  removeUserInvite(input: RemoveUserInviteMutationInput!): String @requiresOrgRole(roles: [Owner, Administrator])
  updateUserOrgRole(input: UpdateUserOrgRoleMutationInput!): OrganizationMembership! @requiresOrgRole(roles: [Owner])
  sendUserLoginLink(input: SendUserLoginLinkMutationInput!): String
  userLogin(input: UserLoginMutationInput!): UserAuthentication!
  userLogout: String! @requiresAuth
  setActiveUserGivenName(input: SetActiveUserGivenNameMutationInput!): User! @requiresAuth
  setActiveUserFamilyName(input: SetActiveUserFamilyNameMutationInput!): User! @requiresAuth
}

type UserAuthentication {
  user: User!
  token: UserAuthToken!
}

type User {
  id: String!
  email: String!
  givenName: String
  familyName: String
}

type UserAuthToken {
  id: String!
  value: String!
}

type UserRegistration {
  user: User!
  organization: Organization!
}

input InviteUserToOrgMutationInput {
  email: String!
  role: OrganizationRole = Member
}

input RegisterNewUserMutationInput {
  email: String!
  givenName: String!
  familyName: String!
  orgName: String!
}

input SendUserLoginLinkMutationInput {
  email: String!
}

input RemoveUserInviteMutationInput {
  email: String!
}

input SetActiveUserFamilyNameMutationInput {
  value: String!
}

input SetActiveUserGivenNameMutationInput {
  value: String!
}

input UpdateUserOrgRoleMutationInput {
  email: String!
  role: OrganizationRole!
}

input UserInvitationQueryInput {
  sort: Boolean # @todo Implement this input.
}

input UserLoginMutationInput {
  token: String!
}

input UserOrganizationsQueryInput {
  sort: Boolean # @todo Implement this input.
}

`;
