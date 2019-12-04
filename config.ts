import * as path from "https://deno.land/std/path/mod.ts";
import * as yaml from "https://deno.land/std/encoding/yaml.ts";
import {Authenticator} from "./auth";
import {CloudAuth} from "./cloud_auth";
import {
  Cluster,
  Context,
  exportCluster,
  exportContext,
  exportUser,
  newClusters,
  newContexts,
  newUsers,
  User
} from "./config_types";
import {ExecAuth} from "./exec_auth";
import {FileAuth} from "./file_auth";
import {OpenIDConnectAuth} from "./oidc_auth";

function fileExists(filepath: string): boolean {
  try {
    const info = Deno.statSync(filepath);
    return info.isFile();
  } catch (err) {
    if (err.name !== "NotFound")
      throw err;
    return false;
  }
}

function dirExists(dirpath: string): boolean {
  try {
    const info = Deno.statSync(dirpath);
    return info.isDirectory()
  } catch (err) {
    if (err.name !== "NotFound")
      throw err;
      return false;
  }
}

export class KubeConfig {
  private static authenticators: Authenticator[] = [
    new CloudAuth(),
    new ExecAuth(),
    new FileAuth(),
    new OpenIDConnectAuth()
  ];

  // Moved from `Config` class.
  public static SERVICEACCOUNT_ROOT = "/var/run/secrets/kubernetes.io/serviceaccount";
  public static SERVICEACCOUNT_CA_PATH = KubeConfig.SERVICEACCOUNT_ROOT + "/ca.crt";
  public static SERVICEACCOUNT_TOKEN_PATH = KubeConfig.SERVICEACCOUNT_ROOT + "/token";

  /**
   * The list of all known clusters
   */
  public clusters: Cluster[];

  /**
   * The list of all known users
   */
  public users: User[];

  /**
   * The list of all known contexts
   */
  public contexts: Context[];

  /**
   * The name of the current context
   */
  public currentContext: string;

  constructor() {
    this.contexts = [];
    this.clusters = [];
    this.users = [];
  }

  public getContexts() {
    return this.contexts;
  }

  public getClusters() {
    return this.clusters;
  }

  public getUsers() {
    return this.users;
  }

  public getCurrentContext() {
    return this.currentContext;
  }

  public setCurrentContext(context: string) {
    this.currentContext = context;
  }

  public getContextObject(name: string) {
    if (!this.contexts) {
      return null;
    }
    return findObject(this.contexts, name, "context");
  }

  public getCurrentCluster(): Cluster | null {
    const context = this.getCurrentContextObject();
    if (!context) {
      return null;
    }
    return this.getCluster(context.cluster);
  }

  public getCluster(name: string): Cluster | null {
    return findObject(this.clusters, name, "cluster");
  }

  public getCurrentUser(): User | null {
    const ctx = this.getCurrentContextObject();
    if (!ctx) {
      return null;
    }
    return this.getUser(ctx.user);
  }

  public getUser(name: string): User | null {
    return findObject(this.users, name, "user");
  }

  public loadFromFile(filepath: string) {
    const decoder = new TextDecoder("utf-8");
    const rootDirectory = path.dirname(filepath);
    const content = decoder.decode(Deno.readFileSync(filepath));
    this.loadFromString(content);
    this.makePathsAbsolute(rootDirectory);
  }

/*
  public async applytoHTTPSOptions(opts: https.RequestOptions) {
    const user = this.getCurrentUser();

    await this.applyOptions(opts);

    if (user && user.username) {
      opts.auth = `${user.username}:${user.password}`;
    }
  }

  public async applyToRequest(opts: request.Options) {
    const cluster = this.getCurrentCluster();
    const user = this.getCurrentUser();

    await this.applyOptions(opts);

    if (cluster && cluster.skipTLSVerify) {
      opts.strictSSL = false;
    }

    if (user && user.username) {
      opts.auth = {
        password: user.password,
        username: user.username
      };
    }
  }
*/

  public loadFromString(config: string) {
    const obj = yaml.safeLoad(config) as any;
    if (obj.apiVersion !== "v1") {
      throw new TypeError("unknown version: " + obj.apiVersion);
    }
    this.clusters = newClusters(obj.clusters);
    this.contexts = newContexts(obj.contexts);
    this.users = newUsers(obj.users);
    this.currentContext = obj["current-context"];
  }

  public loadFromOptions(options: any) {
    this.clusters = options.clusters;
    this.contexts = options.contexts;
    this.users = options.users;
    this.currentContext = options.currentContext;
  }

  public loadFromClusterAndUser(cluster: Cluster, user: User) {
    this.clusters = [cluster];
    this.users = [user];
    this.currentContext = "loaded-context";
    this.contexts = [
      {
        cluster: cluster.name,
        user: user.name,
        name: this.currentContext
      } as Context
    ];
  }

  public loadFromCluster(pathPrefix: string = "") {
    const host = Deno.env("KUBERNETES_SERVICE_HOST");
    const port = Deno.env("KUBERNETES_SERVICE_PORT");
    const clusterName = "inCluster";
    const userName = "inClusterUser";
    const contextName = "inClusterContext";

    let scheme = "https";
    if (port === "80" || port === "8080" || port === "8001") {
      scheme = "http";
    }

    this.clusters = [
      {
        name: clusterName,
        caFile: `${pathPrefix}${KubeConfig.SERVICEACCOUNT_CA_PATH}`,
        server: `${scheme}://${host}:${port}`,
        skipTLSVerify: false
      }
    ];
    this.users = [
      {
        name: userName,
        authProvider: {
          name: "tokenFile",
          config: {
            tokenFile: `${pathPrefix}${KubeConfig.SERVICEACCOUNT_TOKEN_PATH}`
          }
        }
      }
    ];
    this.contexts = [
      {
        cluster: clusterName,
        name: contextName,
        user: userName
      }
    ];
    this.currentContext = contextName;
  }

  public mergeConfig(config: KubeConfig) {
    this.currentContext = config.currentContext;
    config.clusters.forEach((cluster: Cluster) => {
      this.addCluster(cluster);
    });
    config.users.forEach((user: User) => {
      this.addUser(user);
    });
    config.contexts.forEach((ctx: Context) => {
      this.addContext(ctx);
    });
  }

  public addCluster(cluster: Cluster) {
    if (!this.clusters) {
      this.clusters = [];
    }
    this.clusters.forEach((c: Cluster, ix: number) => {
      if (c.name === cluster.name) {
        throw new Error(`Duplicate cluster: ${c.name}`);
      }
    });
    this.clusters.push(cluster);
  }

  public addUser(user: User) {
    if (!this.users) {
      this.users = [];
    }
    this.users.forEach((c: User, ix: number) => {
      if (c.name === user.name) {
        throw new Error(`Duplicate user: ${c.name}`);
      }
    });
    this.users.push(user);
  }

  public addContext(ctx: Context) {
    if (!this.contexts) {
      this.contexts = [];
    }
    this.contexts.forEach((c: Context, ix: number) => {
      if (c.name === ctx.name) {
        throw new Error(`Duplicate context: ${c.name}`);
      }
    });
    this.contexts.push(ctx);
  }

  public loadFromDefault() {
    const configPath = Deno.env("KUBECONFIG");
    if (configPath) {
      const files = configPath.split(path.delimiter);
      this.loadFromFile(files[0]);
      for (let i = 1; i < files.length; i++) {
        const kc = new KubeConfig();
        kc.loadFromFile(files[i]);
        this.mergeConfig(kc);
      }
      return;
    }
    const home = findHomeDir();
    if (home) {
      const config = path.join(home, ".kube", "config");
      if (fileExists(config)) {
        this.loadFromFile(config);
        return;
      }
    }

    if (fileExists(KubeConfig.SERVICEACCOUNT_TOKEN_PATH)) {
      this.loadFromCluster();
      return;
    }

    this.loadFromClusterAndUser(
      { name: "cluster", server: "http://localhost:8080" } as Cluster,
      { name: "user" } as User
    );
  }

  public makePathsAbsolute(rootDirectory: string) {
    this.clusters.forEach((cluster: Cluster) => {
      if (cluster.caFile) {
        cluster.caFile = makeAbsolutePath(rootDirectory, cluster.caFile);
      }
    });
    this.users.forEach((user: User) => {
      if (user.certFile) {
        user.certFile = makeAbsolutePath(rootDirectory, user.certFile);
      }
      if (user.keyFile) {
        user.keyFile = makeAbsolutePath(rootDirectory, user.keyFile);
      }
    });
  }

  public exportConfig(): string {
    const configObj = {
      apiVersion: "v1",
      kind: "Config",
      clusters: this.clusters.map(exportCluster),
      users: this.users.map(exportUser),
      contexts: this.contexts.map(exportContext),
      preferences: {},
      "current-context": this.getCurrentContext()
    };

    return JSON.stringify(configObj);
  }

  private getCurrentContextObject() {
    return this.getContextObject(this.currentContext);
  }

  /*
  private applyHTTPSOptions(opts: request.Options | https.RequestOptions) {
    const cluster = this.getCurrentCluster();
    const user = this.getCurrentUser();
    if (!user) {
      return;
    }

    if (cluster != null && cluster.skipTLSVerify) {
      opts.rejectUnauthorized = false;
    }
    const ca =
      cluster != null
        ? bufferFromFileOrString(cluster.caFile, cluster.caData)
        : null;
    if (ca) {
      opts.ca = ca;
    }
    const cert = bufferFromFileOrString(user.certFile, user.certData);
    if (cert) {
      opts.cert = cert;
    }
    const key = bufferFromFileOrString(user.keyFile, user.keyData);
    if (key) {
      opts.key = key;
    }
  }

  private async applyAuthorizationHeader(
    opts: request.Options | https.RequestOptions
  ) {
    const user = this.getCurrentUser();
    if (!user) {
      return;
    }
    const authenticator = KubeConfig.authenticators.find(
      (elt: Authenticator) => {
        return elt.isAuthProvider(user);
      }
    );

    if (!opts.headers) {
      opts.headers = [];
    }
    if (authenticator) {
      await authenticator.applyAuthentication(user, opts);
    }

    if (user.token) {
      opts.headers.Authorization = `Bearer ${user.token}`;
    }
  }

  private async applyOptions(opts: request.Options | https.RequestOptions) {
    this.applyHTTPSOptions(opts);
    await this.applyAuthorizationHeader(opts);
  }
*/
}

export function makeAbsolutePath(root: string, file: string): string {
  if (!root || path.isAbsolute(file)) {
    return file;
  }
  return path.join(root, file);
}

// Only public for testing.
export function findHomeDir(): string | null {
  const env = Deno.env();
  if (env.HOME && dirExists(env.HOME)) {
    return env.HOME
  }
  if (Deno.build.os !== "win") {
    return null;
  }
  if (env.HOMEDRIVE && env.HOMEPATH) {
    const dir = path.join(env.HOMEDRIVE, env.HOMEPATH);
    if (dirExists(dir)) {
      return dir;
    }
  }
  if (env.USERPROFILE && dirExists(env.USERPROFILE)) {
    return env.USERPROFILE;
  }
  return null;
}

export interface Named {
  name: string;
}

// Only really public for testing...
export function findObject<T extends Named>(
  list: T[],
  name: string,
  key: string
): T | null {
  for (const obj of list) {
    if (obj.name === name) {
      if (obj[key]) {
        return obj[key];
      }
      return obj;
    }
  }
  return null;
}
