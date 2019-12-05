import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import {Authenticator} from "./auth";
import {
  Cluster,
  Context,
  User,
  ResolvedContext,
  RequestOptions
} from "./config_types";
import {CloudAuth} from "./cloud_auth";
import {ExecAuth} from "./exec_auth";
import {FileAuth} from "./file_auth";
//import {OpenIDConnectAuth} from "./oidc_auth";
import {StaticAuth} from "./static_auth";
import {BasicAuth} from "./basic_auth";

export class KubeConfig {
  private static authenticators: Authenticator[] = [
    new CloudAuth(),
    new ExecAuth(),
    new FileAuth(),
    //new OpenIDConnectAuth(),
    new StaticAuth(),
    new BasicAuth()
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
   * The current context with resolved `user` and `cluster`
   */
  private currentContext?: ResolvedContext;

  constructor({
    loadFromDefault=false
  }: {
    loadFromDefault?: boolean
  }={}) {
    this.contexts = [];
    this.clusters = [];
    this.users = [];
    if (loadFromDefault)
      this.loadFromDefault();
  }

  public getCurrentContext(): ResolvedContext {
    if (!this.currentContext)
      throw Error("The current context is not set.");
    return this.currentContext;
  }

  public setCurrentContext(name: string): ResolvedContext {
    const context = getObject(this.contexts, name, "context");
    const rctx = this.currentContext = {
      cluster: getObject(this.clusters, context.cluster, "cluster"),
      user: getObject(this.users, context.user, "user"),
      name,
      namespace: context.namespace
    };
    rctx.cluster.ca = loadFromFileOrString(rctx.cluster.caFile, rctx.cluster.caData);
    rctx.user.cert = loadFromFileOrString(rctx.user.certFile, rctx.user.certData);
    rctx.user.key = loadFromFileOrString(rctx.user.keyFile, rctx.user.keyData);
    return rctx;
  }

  public loadFromFile(filepath: string) {
    const rootDirectory = path.dirname(filepath);
    const content = fs.readFileSync(filepath, "utf8");
    this.loadFromString(content);
    this.makePathsAbsolute(rootDirectory);
  }

  public loadFromString(config: string) {
    const obj = yaml.safeLoad(config) as any;
    if (obj.apiVersion !== "v1") {
      throw new TypeError("unknown version: " + obj.apiVersion);
    }
    this.clusters = newClusters(obj.clusters);
    this.contexts = newContexts(obj.contexts);
    this.users = newUsers(obj.users);
    this.setCurrentContext(obj["current-context"]);
  }

  public loadFromOptions(options: any) {
    this.clusters = options.clusters;
    this.contexts = options.contexts;
    this.users = options.users;
    this.setCurrentContext(options.currentContext);
  }

  public loadFromClusterAndUser(cluster: Cluster, user: User) {
    this.clusters = [cluster];
    this.users = [user];
    this.contexts = [
      {
        cluster: cluster.name,
        user: user.name,
        name: "loaded-context"
      } as Context
    ];
    this.setCurrentContext("loaded-context");
  }

  public loadFromCluster(pathPrefix: string = "") {
    const host = process.env.KUBERNETES_SERVICE_HOST;
    const port = process.env.KUBERNETES_SERVICE_PORT;
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
    this.setCurrentContext(contextName);
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
    const configPath = process.env.KUBECONFIG;
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

  public async getRequestOptions(): Promise<RequestOptions> {
    const context = this.getCurrentContext();
    const cluster = context.cluster;
    const user = context.user;
    const options: RequestOptions = {
      server: cluster.server,
      headers: {}
    };
    if (options.server.startsWith("https://")) {
      options.rejectUnauthorized = !cluster.skipTLSVerify;
      options.ca = cluster.ca;
      options.cert = user.cert;
      options.key = user.key;
    }
    const authenticator = KubeConfig.authenticators.find(
      (item: Authenticator) => {
        return item.isAuthProvider(user);
      }
    );
    if (authenticator) {
      await authenticator.applyAuthentication(user, options);
    }
    return options;
  }
}

function fileExists(filepath: string): boolean {
  try {
    const info = fs.statSync(filepath);
    return info.isFile();
  } catch (err) {
    if (err.code !== "ENOENT")
      throw err;
    return false;
  }
}

function dirExists(dirpath: string): boolean {
  try {
    const info = fs.statSync(dirpath);
    return info.isDirectory();
  } catch (err) {
    if (err.code !== "ENOENT")
      throw err;
    return false;
  }
}

function makeAbsolutePath(root: string, file: string): string {
  if (!root || path.isAbsolute(file)) {
    return file;
  }
  return path.join(root, file);
}

function loadFromFileOrString(file?: string, data?: string): string | undefined {
  if (file) {
    return fs.readFileSync(file, "utf8");
  }
  if (data) {
    return Buffer.from(data, "base64").toString();
  }
}

function findHomeDir(): string | null {
  if (process.env.HOME && dirExists(process.env.HOME)) {
    return process.env.HOME
  }
  if (process.platform === "win32") {
    return null;
  }
  if (process.env.HOMEDRIVE && process.env.HOMEPATH) {
    const dir = path.join(process.env.HOMEDRIVE, process.env.HOMEPATH);
    if (dirExists(dir)) {
      return dir;
    }
  }
  if (process.env.USERPROFILE && dirExists(process.env.USERPROFILE)) {
    return process.env.USERPROFILE;
  }
  return null;
}

interface Named {
  name: string;
}

function getObject<T extends Named>(
  list: T[],
  name: string,
  kind: string
): T {
  for (const obj of list) {
    if (obj.name === name) {
      return obj;
    }
  }
  throw Error(`Invalid ${kind} name: ${name}`);
}

function newClusters(clusters: any[]): Cluster[] {
  return clusters.map((item, i) => {
    if (!item.name) {
      throw new Error(`clusters[${i}].name is missing`);
    }
    if (!item.cluster) {
      throw new Error(`clusters[${i}].cluster is missing`);
    }
    if (!item.cluster.server) {
      throw new Error(`clusters[${i}].cluster.server is missing`);
    }
    return {
      caData: item.cluster["certificate-authority-data"],
      caFile: item.cluster["certificate-authority"],
      name: item.name,
      server: item.cluster.server,
      skipTLSVerify: item.cluster["insecure-skip-tls-verify"] === true
    };
  });
}

function newUsers(users: any[]): User[] {
  return users.map((item, i) => {
    if (!item.name) {
      throw new Error(`users[${i}].name is missing`);
    }
    return {
      authProvider: item.user ? item.user["auth-provider"] : null,
      certData: item.user ? item.user["client-certificate-data"] : null,
      certFile: item.user ? item.user["client-certificate"] : null,
      exec: item.user ? item.user.exec : null,
      keyData: item.user ? item.user["client-key-data"] : null,
      keyFile: item.user ? item.user["client-key"] : null,
      name: item.name,
      token: findToken(item.user),
      password: item.user ? item.user.password : null,
      username: item.user ? item.user.username : null
    };
  });
}

function findToken(user: any | undefined): string | undefined {
  if (user) {
    if (user.token) {
      return user.token;
    }
    if (user["token-file"]) {
      return fs.readFileSync(user["token-file"], "utf8");
    }
  }
}

function newContexts(contexts: any[]): Context[] {
  return contexts.map((item, i) => {
    if (!item.name) {
      throw new Error(`contexts[${i}].name is missing`);
    }
    if (!item.context) {
      throw new Error(`contexts[${i}].context is missing`);
    }
    if (!item.context.cluster) {
      throw new Error(`contexts[${i}].context.cluster is missing`);
    }
    return {
      cluster: item.context.cluster,
      name: item.name,
      user: item.context.user || undefined,
      namespace: item.context.namespace || undefined
    };
  });
}
