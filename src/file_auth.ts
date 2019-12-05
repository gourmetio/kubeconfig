import fs from "fs";
import {Authenticator} from "./auth";
import {User, RequestOptions} from "./config_types";

export class FileAuth implements Authenticator {
  private token?: string;
  private lastRead?: number;

  public isAuthProvider(user: User): boolean {
    return (
      user.authProvider &&
      user.authProvider.config &&
      user.authProvider.config.tokenFile
    );
  }

  public async applyAuthentication(
    user: User,
    options: RequestOptions
  ) {
    if (!this.token) {
      this.refreshToken(user.authProvider.config.tokenFile);
    }
    if (this.isTokenExpired()) {
      this.refreshToken(user.authProvider.config.tokenFile);
    }
    if (this.token) {
      options.headers.authorization = `Bearer ${this.token}`;
    }
  }

  private refreshToken(filePath: string) {
    this.token = fs.readFileSync(filePath, "utf8");
    this.lastRead = Date.now();
  }

  private isTokenExpired(): boolean {
    if (!this.lastRead) {
      return true;
    }
    const delta = (Date.now() - this.lastRead) / 1000;
    // For now just refresh every 60 seconds. This is imperfect since the token
    // could be out of date for this time, but it is unlikely and it's also what
    // the client-go library does.
    // TODO: Use file notifications instead?
    return delta > 60;
  }
}
