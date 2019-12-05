import {Authenticator} from "./auth";
import {User, RequestOptions} from "./config_types";

export class BasicAuth implements Authenticator {
  public isAuthProvider(user: User): boolean {
    return !!user.username;
  }

  public async applyAuthentication(
    user: User,
    options: RequestOptions
  ) {
    const encoded = Buffer.from(`${user.username}:${user.password}`).toString("base64");
    options.headers.authorization = `Basic ${encoded}`;
  }
}
