import {User, RequestOptions} from "./config_types";

// Some margin for detection of token expiry
export const EXPIRY_MARGIN = 60 * 1000;

export interface Authenticator {
  /**
   * Returns true if `this` is an auth-provider of the user.
   */
  isAuthProvider(user: User): boolean;

  /**
   * Applies the authentication header to the request options.
   */
  applyAuthentication(
    user: User,
    options: RequestOptions
  ): Promise<void>;
}
