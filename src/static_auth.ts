import {Authenticator} from "./auth";
import {User, RequestOptions} from "./config_types";

export class StaticAuth implements Authenticator {
  public isAuthProvider(user: User): boolean {
    return !!user.token;
  }

  public async applyAuthentication(
    user: User,
    options: RequestOptions
  ) {
    options.headers.authorization = `Bearer ${user.token}`;
  }
}
