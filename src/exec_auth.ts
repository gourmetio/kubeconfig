// @ts-ignore: disable `noImplicitAny`
import shell from "pshell";
import {Authenticator, EXPIRY_MARGIN} from "./auth";
import {User, RequestOptions} from "./config_types";

export interface CredentialStatus {
  readonly token: string;
  readonly clientCertificateData: string;
  readonly clientKeyData: string;
  readonly expirationTimestamp: string;
}

export interface Credential {
  readonly status: CredentialStatus;
}

export class ExecAuth implements Authenticator {
  private readonly tokenCache: {[key: string]: Credential | null} = {};

  public isAuthProvider(user: User): boolean {
    if (user.exec) {
      return true;
    }
    if (!user.authProvider) {
      return false;
    }
    return (
      user.authProvider.name === "exec" || (user.authProvider.config && user.authProvider.config.exec)
    );
  }

  public async applyAuthentication(
    user: User,
    options: RequestOptions
  ) {
    const credential = await this.getCredential(user);
    if (!credential) {
      return;
    }
    if (credential.status.clientCertificateData) {
      options.cert = credential.status.clientCertificateData;
    }
    if (credential.status.clientKeyData) {
      options.key = credential.status.clientKeyData;
    }
    const token = this.getToken(credential);
    if (token) {
      options.headers.authorization = `Bearer ${token}`;
    }
  }

  private getToken(credential: Credential): string | null {
    if (!credential) {
      return null;
    }
    if (credential.status.token) {
      return credential.status.token;
    }
    return null;
  }

  private async getCredential(user: User): Promise<Credential | null> {
    // TODO: Add a unit test for token caching.
    const cachedToken = this.tokenCache[user.name];
    if (cachedToken) {
      const date = Date.parse(cachedToken.status.expirationTimestamp);
      if (date - EXPIRY_MARGIN > Date.now()) {
        return cachedToken;
      }
      this.tokenCache[user.name] = null;
    }
    let exec: any = null;
    if (user.authProvider && user.authProvider.config) {
      exec = user.authProvider.config.exec;
    }
    if (user.exec) {
      exec = user.exec;
    }
    if (!exec) {
      return null;
    }
    if (!exec.command) {
      throw new Error("No command was specified for exec authProvider!");
    }
    const result = await shell.spawn(exec.command, exec.args, {
      echoCommand: false,
      captureOutput: true,
    }).promise;

    if (result.code === 0) {
      const obj = JSON.parse(result.stdout) as Credential;
      this.tokenCache[user.name] = obj;
      return obj;
    }

    throw new Error("authProvider terminated with a non-zero exit code");
  }
}
