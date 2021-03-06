import proc from "child_process";
import fastpath from "./fastpath";
import {Authenticator, EXPIRY_MARGIN} from "./auth";
import {User, RequestOptions} from "./config_types";

/* FIXME: maybe we can extend the User and User.authProvider type to have a proper type.
Currently user.authProvider has `any` type and so we don't have a type for user.authProvider.config.
We therefore define its type here
*/
interface Config {
  expiry: string;
  ["cmd-args"]?: string;
  ["cmd-path"]?: string;
  ["token-key"]: string;
  ["expiry-key"]: string;
  ["access-token"]?: string;
}
export class CloudAuth implements Authenticator {
  public isAuthProvider(user: User): boolean {
    if (!user || !user.authProvider) {
      return false;
    }
    return (
      user.authProvider.name === "azure" || user.authProvider.name === "gcp"
    );
  }

  public async applyAuthentication(
    user: User,
    options: RequestOptions
  ) {
    const token = this.getToken(user);
    if (token) {
      options.headers.authorization = `Bearer ${token}`;
    }
  }

  private getToken(user: User): string | null {
    const config = user.authProvider.config;
    if (this.isExpired(config)) {
      this.updateAccessToken(config);
    }
    return config["access-token"];
  }

  private isExpired(config: Config) {
    const token = config["access-token"];
    const expiry = config.expiry;
    if (!token) {
      return true;
    }
    if (!expiry) {
      return false;
    }

    const expiration = Date.parse(expiry);
    if (expiration - EXPIRY_MARGIN < Date.now()) {
      return true;
    }
    return false;
  }

  private updateAccessToken(config: Config) {
    let cmd = config["cmd-path"];
    if (!cmd) {
      throw new Error("Token is expired!");
    }
    // Wrap cmd in quotes to make it cope with spaces in path
    cmd = `"${cmd}"`;
    const args = config["cmd-args"];
    if (args) {
      cmd = cmd + " " + args;
    }
    // TODO: Cache to file?
    // TODO: do this asynchronously
    let output: any;
    try {
      output = proc.execSync(cmd);
    } catch (err) {
      throw new Error("Failed to refresh token: " + err.message);
    }

    const resultObj = JSON.parse(output);

    const tokenPathKeyInConfig = config["token-key"];
    const expiryPathKeyInConfig = config["expiry-key"];

    // Format in file is {<query>}, so slice it out and add '$'
    const tokenPathKey = "$" + tokenPathKeyInConfig.slice(1, -1);
    const expiryPathKey = "$" + expiryPathKeyInConfig.slice(1, -1);

    // We use `fastpath` instead of `jsonpath-plus` for a small package size.
    config["access-token"] = fastpath(tokenPathKey).evaluate(resultObj);
    config.expiry = fastpath(expiryPathKey).evaluate(resultObj);
  }
}
