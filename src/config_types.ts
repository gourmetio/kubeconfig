export interface Cluster {
  readonly name: string;
  readonly caData?: string;
  caFile?: string;
  ca?: string;
  readonly server: string;
  readonly skipTLSVerify: boolean;
}

export interface User {
  readonly name: string;
  readonly certData?: string;
  certFile?: string;
  cert?: string;
  readonly exec?: any;
  readonly keyData?: string;
  keyFile?: string;
  key?: string;
  readonly authProvider?: any;
  readonly token?: string;
  readonly username?: string;
  readonly password?: string;
}

export interface Context {
  readonly cluster: string;
  readonly user: string;
  readonly name: string;
  readonly namespace?: string;
}

export interface ResolvedContext {
  readonly cluster: Cluster;
  readonly user: User;
  readonly name: string;
  readonly namespace?: string;
}

/**
 * An object containing HTTP request information for calling Kubernetes API server.
 * This module is not bound to a specific HTTP client. You can use any HTTP client by converting
 * these options to the format that the client understands.
 */
export interface RequestOptions {
  /**
   * `${schema}://${host}:${port}` format
   */
  server: string;

  /**
   * HTTP headers. Typically, `authorization: Bearer ...` is set.
   */
  headers: {
    [name: string]: string
  };

  /**
   * If true, server certificate will not be verified. HTTPS only option.
   */
  rejectUnauthorized?: boolean;

  /**
   * CA bundle for the self-signed server certificate. HTTPS only option.
   */
  ca?: Buffer | string;

  /**
   * Client certificate for TLS client authentication. HTTPS only option.
   */
  cert?: Buffer | string;

  /**
   * Client private key for TLS client authentication. HTTPS only option.
   */
  key?: Buffer | string;
}
