export interface IDefaultRoleProvider {
  /**
   * Returns the id of the role that should be auto-assigned to newly
   * registered users (e.g. the seeded "User" role), or null if RBAC
   * hasn't been seeded yet / no default role is configured.
   */
  getDefaultRoleId(): Promise<string | null>;
}
