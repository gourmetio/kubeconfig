import path from "path";
import test from "tape";
import {KubeConfig} from "../src";

test("Loading kubeconfig file", async t => {
  const kc = new KubeConfig({loadFromDefault: false});
  kc.loadFromFile(path.join(__dirname, "fixture/kubeconfig.yaml"));

  let context = kc.getCurrentContext();

  t.deepEqual(context.cluster, {
    caData: "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURDekNDQWZPZ0F3SUJBZ0lRR01QcEpEUFpJajBiOEFLT2IvVnIvVEFOQmdrcWhraUc5dzBCQVFzRkFEQXYKTVMwd0t3WURWUVFERXlRMU5USXdNbUppWlMwMFpHVm1MVFJtWlRndE9UVmlOeTB5Tm1ZeU1qTTVNak00TjJFdwpIaGNOTVRreE1qQTFNREF3T1RNeldoY05NalF4TWpBek1ERXdPVE16V2pBdk1TMHdLd1lEVlFRREV5UTFOVEl3Ck1tSmlaUzAwWkdWbUxUUm1aVGd0T1RWaU55MHlObVl5TWpNNU1qTTROMkV3Z2dFaU1BMEdDU3FHU0liM0RRRUIKQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUM5V0JMeFlLa3RZNjV4YXRNQkUxajd2eFdlbkovNk83akpOSTFISm84RApjVUdiYlZqV2RENDJVbG1uQmVZQTFSaFh1U2c3dHV4VEFHMkpuSDh3N0RzblN0by92OU00RG5zR0Q3QStpZzhPCmtZSWpSTHBqTDQxWkgvQnduaS9FRVp6ckoyNUJyeW9KOU9CTU9wbnVXbllWdHU3dng2S3NKWEpqeG5OYWhqNkYKNnh4d3ZEaWQrMGV3aDRreHlkU0NtK0J1QnlIdmEzNzFCQ2R6YkpNTGhsa25XTmg3SjA5TktrTVQzazBpVHZmKwpIMDVEZUxPVzhGMGJmYzRYUUpxbUs4K2VpSzMvVVJzenlVejdwcXlzZ2RSUXgvUDRKbHJCbFVEcU51eWxjSW15ClVkdzdzR01rQUxCcyt0WjVrTFQvbEFZL2JWSUpQOWxEdmNJT1krWHRhVmhWQWdNQkFBR2pJekFoTUE0R0ExVWQKRHdFQi93UUVBd0lDQkRBUEJnTlZIUk1CQWY4RUJUQURBUUgvTUEwR0NTcUdTSWIzRFFFQkN3VUFBNElCQVFCRQptSnRmYldjeldydVpaTWR4ajAxYW5SVkQzQWYzRmFXT3lVSm5ac0MwWHRMZWR6eUprQUxZV2E4bEJUN0c0S3hQCkdmbmVFbkprV3RWaVZEdFBiWFlIYjR5SXNpOHBYckVnUG5PbVpNcWNBZzQyMHYzSWJKSDBsWXQ2a1REK0dBYTAKbUw0UGFSY055dFRoQ20zWkVUM2ZaelJ6NTA3MXZCZ09KMlUydHpnUmpZQThsamwwRzJzaXNTeXJEVnlRQ0FTcQpEWm9HQUErNFAzS1gwaDlqbERxY2FRK1Q5SCtYdVIva3AzeVRVb1NMMTdSRGhaS0ZjdERiKzJJRzJOTXBKeDhuCmNOcndJYzhUYU1wazNIQmVhUVVCTTJrTGpLa2IzZmlPL0VEdC9Na0lXaEVmaTJwcXVjYjhGTENaWTdrellJdG0KLzkwd294K3pQQXF1ZFlrUDlzS1IKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=",
    caFile: undefined,
    name: "gke_gke-test-123456_us-central1-a_your-first-cluster-1",
    server: "https://35.223.88.1",
    skipTLSVerify: false
  });

  t.deepEqual(context.user, {
    authProvider: {
      config: {
        "access-token": "ya29.ImezB_UjKzNPsqIdkJnlD6GO0FbB18-zC1hmPt6xG4IcLYnCUOL5dGmUtM-ScrYlZJVYtuRkABKAqRlfBEDijC4p_1L8yFFtwHPYmeTBq_iatgcSfTcbAvIUBU1axnAHweceu6NuBvRp",
        "cmd-args": "test/fixture/cat.js test/fixture/cloud/result.json",
        "cmd-path": "node",
        "expiry": "2019-12-05T03:03:20Z",
        "expiry-key": "{.credential.token_expiry}",
        "token-key": "{.credential.access_token}"
      },
      name: "gcp"
    },
    name: "gke_gke-test-123456_us-central1-a_your-first-cluster-1",
    certData: undefined,
    certFile: undefined,
    exec: undefined,
    keyData: undefined,
    keyFile: undefined,
    token: undefined,
    username: undefined,
    password: undefined
  });

  let options = await kc.getRequestOptions();

  t.deepEqual(options, {
    server: "https://35.223.88.1",
    headers: {
      authorization: "Bearer ya29.ImezB_UjKzNPsqIdkJnlD6GO0FbB18-zC1hmPt6xG4IcLYnCUOL5dGmUtM-ScrYlZJVYtuRkABKAqRlfBEDijC4p_1L8yFFtwHPYmeTBq_iatgcSfTcbAvIUBU1axnAHweceu6NuBvRp"
    },
    rejectUnauthorized: true,
    ca: "-----BEGIN CERTIFICATE-----\nMIIDCzCCAfOgAwIBAgIQGMPpJDPZIj0b8AKOb/Vr/TANBgkqhkiG9w0BAQsFADAv\nMS0wKwYDVQQDEyQ1NTIwMmJiZS00ZGVmLTRmZTgtOTViNy0yNmYyMjM5MjM4N2Ew\nHhcNMTkxMjA1MDAwOTMzWhcNMjQxMjAzMDEwOTMzWjAvMS0wKwYDVQQDEyQ1NTIw\nMmJiZS00ZGVmLTRmZTgtOTViNy0yNmYyMjM5MjM4N2EwggEiMA0GCSqGSIb3DQEB\nAQUAA4IBDwAwggEKAoIBAQC9WBLxYKktY65xatMBE1j7vxWenJ/6O7jJNI1HJo8D\ncUGbbVjWdD42UlmnBeYA1RhXuSg7tuxTAG2JnH8w7DsnSto/v9M4DnsGD7A+ig8O\nkYIjRLpjL41ZH/Bwni/EEZzrJ25BryoJ9OBMOpnuWnYVtu7vx6KsJXJjxnNahj6F\n6xxwvDid+0ewh4kxydSCm+BuByHva371BCdzbJMLhlknWNh7J09NKkMT3k0iTvf+\nH05DeLOW8F0bfc4XQJqmK8+eiK3/URszyUz7pqysgdRQx/P4JlrBlUDqNuylcImy\nUdw7sGMkALBs+tZ5kLT/lAY/bVIJP9lDvcIOY+XtaVhVAgMBAAGjIzAhMA4GA1Ud\nDwEB/wQEAwICBDAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBE\nmJtfbWczWruZZMdxj01anRVD3Af3FaWOyUJnZsC0XtLedzyJkALYWa8lBT7G4KxP\nGfneEnJkWtViVDtPbXYHb4yIsi8pXrEgPnOmZMqcAg420v3IbJH0lYt6kTD+GAa0\nmL4PaRcNytThCm3ZET3fZzRz5071vBgOJ2U2tzgRjYA8ljl0G2sisSyrDVyQCASq\nDZoGAA+4P3KX0h9jlDqcaQ+T9H+XuR/kp3yTUoSL17RDhZKFctDb+2IG2NMpJx8n\ncNrwIc8TaMpk3HBeaQUBM2kLjKkb3fiO/EDt/MkIWhEfi2pqucb8FLCZY7kzYItm\n/90wox+zPAqudYkP9sKR\n-----END CERTIFICATE-----\n",
    cert: undefined,
    key: undefined
  });

  context = kc.setCurrentContext("arn:aws:eks:us-west-2:123456789012:cluster/eks-test");

  t.deepEqual(context.cluster, {
    caData: "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN5RENDQWJDZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQjRYRFRFNU1USXdOVEF4TVRVMU5sb1hEVEk1TVRJd01qQXhNVFUxTmxvd0ZURVRNQkVHQTFVRQpBeE1LYTNWaVpYSnVaWFJsY3pDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBSyswCjA2Nmp6eDRsWkNnQUl5YXVCSVlqc2pIR0J2RU5YL1dTNlVoY29MRmdoVnU1MmN2dEJhRDNqSGo4VHI5dmE3N2MKSld0VnZTYVk1Z3NYR0h3bWlEbDN3MU1qVC9CcUdqaGZadmltY1UwQXhCU0F6ODYxWmdES2w3MVU5NnlyZEwvMgptNFRWcVhReE9HYzU1dUFZRm1RNndlOXk3RXZsK3JEQzFNMGw0R3ptSVNyODM4eU5GQWFQMHZTTHh4WDlFd1RNCkM4WCtlazlXci85RE0xVGtjWFpLY2xrU0swdWhocHNaOVhacGc0Sk1TNU1FenhZQ3MrNkhTa051UW81Q0MzNnQKdHQwMFRlQWIwODN5bFFhU2xZa1B3Rk8zaGc1Y3o2clJzYnhMN3B1V2pub0krVjlUMVEwV01YTllETjBxSnB6MQpLeElIa2o3WHV2eUVoclBVdTlFQ0F3RUFBYU1qTUNFd0RnWURWUjBQQVFIL0JBUURBZ0trTUE4R0ExVWRFd0VCCi93UUZNQU1CQWY4d0RRWUpLb1pJaHZjTkFRRUxCUUFEZ2dFQkFCOEQ1QjFYSzQxQllTc3JHZTI4YWROZHc1bGcKcHFoWlpjREh1WmhWWWt5bXZVZ2NQL2hhQk1MYnB5MHYyZlVQYXRKZWRDVDNUcHk2Tms4MUx3OVMzYlpDdmhMMgp0cklWQTU0NUx2K2NFbVVJdXNMYkpDaDI0dVdjNld1Tk5BeTB6WXFDa3o4OHlCenpoUk5NTitUeEhHazJkdXZBCmNlZllndHF4YkZmOTd4Smx1YndZRW9rWEp4L2FDMHdzR0RmTXljRVZnekpTc3VBT1B1VUt0MTlNZHZHRC81K1gKUnNPczdjWEZrWko3YjJEMXlqUnIxMnJ2YmFEMlYxTTZpdDNZMnlEc3l5Y0pXeUxHVkZnSndyVzQwZXBYOHJtSgpVRSthNkk1TjZwa29VMGFLQ2ZSbXJoQ2Q2MTNDMHRZWkJCZG54QTByVWFPa0ZleFlPbGQzeHRLUys2bz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=",
    caFile: undefined,
    name: "arn:aws:eks:us-west-2:123456789012:cluster/eks-test",
    server: "https://5FA46EC62CC97F6EDECC4B3143C42A69.gr7.us-west-2.eks.amazonaws.com",
    skipTLSVerify: false
  });

  t.deepEqual(context.user, {
    authProvider: undefined,
    certData: undefined,
    certFile: undefined,
    exec: {
       apiVersion: "client.authentication.k8s.io/v1alpha1",
       args: ["test/fixture/cat.js", "test/fixture/exec/result.json"],
       command: "node",
       env: null
    },
    keyData: undefined,
    keyFile: undefined,
    name: "arn:aws:eks:us-west-2:123456789012:cluster/eks-test",
    token: undefined,
    password: undefined,
    username: undefined
  });

  options = await kc.getRequestOptions();

  t.deepEqual(options, {
    server: "https://5FA46EC62CC97F6EDECC4B3143C42A69.gr7.us-west-2.eks.amazonaws.com",
    headers: {
      authorization: "Bearer k8s-aws-v1.aHR0cHM6Ly9zdHMuYW1hem9uYXdzLmNvbS8_QWN0aW9uPUdldENhbGxlcklkZW50aXR5JlZlcnNpb249MjAxMS0wNi0xNSZYLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFJWEFWQ09GRlpWRUVHT0dBJTJGMjAxOTEyMDUlMkZ1cy1lYXN0LTElMkZzdHMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDE5MTIwNVQwMjAwNDJaJlgtQW16LUV4cGlyZXM9NjAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JTNCeC1rOHMtYXdzLWlkJlgtQW16LVNpZ25hdHVyZT1jY2RmZGU2MDUwNmRkZmU5ZTg0YTNmMmM3ZWFkZjU5MzVlYTIxNzc1ZjAyMWQ5YWY0OGNmM2JkODcwOWMzNzA1"
    },
    rejectUnauthorized: true,
    ca: "-----BEGIN CERTIFICATE-----\nMIICyDCCAbCgAwIBAgIBADANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwprdWJl\ncm5ldGVzMB4XDTE5MTIwNTAxMTU1NloXDTI5MTIwMjAxMTU1NlowFTETMBEGA1UE\nAxMKa3ViZXJuZXRlczCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAK+0\n066jzx4lZCgAIyauBIYjsjHGBvENX/WS6UhcoLFghVu52cvtBaD3jHj8Tr9va77c\nJWtVvSaY5gsXGHwmiDl3w1MjT/BqGjhfZvimcU0AxBSAz861ZgDKl71U96yrdL/2\nm4TVqXQxOGc55uAYFmQ6we9y7Evl+rDC1M0l4GzmISr838yNFAaP0vSLxxX9EwTM\nC8X+ek9Wr/9DM1TkcXZKclkSK0uhhpsZ9XZpg4JMS5MEzxYCs+6HSkNuQo5CC36t\ntt00TeAb083ylQaSlYkPwFO3hg5cz6rRsbxL7puWjnoI+V9T1Q0WMXNYDN0qJpz1\nKxIHkj7XuvyEhrPUu9ECAwEAAaMjMCEwDgYDVR0PAQH/BAQDAgKkMA8GA1UdEwEB\n/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAB8D5B1XK41BYSsrGe28adNdw5lg\npqhZZcDHuZhVYkymvUgcP/haBMLbpy0v2fUPatJedCT3Tpy6Nk81Lw9S3bZCvhL2\ntrIVA545Lv+cEmUIusLbJCh24uWc6WuNNAy0zYqCkz88yBzzhRNMN+TxHGk2duvA\ncefYgtqxbFf97xJlubwYEokXJx/aC0wsGDfMycEVgzJSsuAOPuUKt19MdvGD/5+X\nRsOs7cXFkZJ7b2D1yjRr12rvbaD2V1M6it3Y2yDsyycJWyLGVFgJwrW40epX8rmJ\nUE+a6I5N6pkoU0aKCfRmrhCd613C0tYZBBdnxA0rUaOkFexYOld3xtKS+6o=\n-----END CERTIFICATE-----\n",
    cert: undefined,
    key: undefined
  });

  context = kc.setCurrentContext("minikube");

  t.deepEqual(context.cluster, {
    caData: undefined,
    caFile: path.join(__dirname, "fixture/minikube/ca.crt"),
    name: "minikube",
    server: "https://172.17.240.206:8443",
    skipTLSVerify: false
  });

  t.deepEqual(context.user, {
    authProvider: undefined,
    certData: undefined,
    certFile: path.join(__dirname, "fixture/minikube/client.crt"),
    exec: undefined,
    keyData: undefined,
    keyFile: path.join(__dirname, "fixture/minikube/client.key"),
    name: "minikube",
    token: undefined,
    password: undefined,
    username: undefined
  });

  options = await kc.getRequestOptions();

  t.deepEqual(options, {
    server: "https://172.17.240.206:8443",
    headers: {},
    rejectUnauthorized: true,
    ca: "-----BEGIN CERTIFICATE-----\nMIIC5zCCAc+gAwIBAgIBATANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwptaW5p\na3ViZUNBMB4XDTE5MTExODIzMDY1MloXDTI5MTExNjIzMDY1MlowFTETMBEGA1UE\nAxMKbWluaWt1YmVDQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJ/u\nDdgUiwCn8d3FSPMF8HcFO2Y3aaIqTVUf+PupFw1pvIFKNfW9X630OPPr5j2MBSPb\nDnl1xFLRrI8A+dKWnsWWw9ksgFJ0YULAxgAfRdsNR/klW+9pye6/WQZd+ti2I1PF\nhD3lWOlLcbWPupKbpjPP8vsbWjam2nki7365E+h2Ope0BmtQroClRQJxZxQvMw6p\nPk/gNWOF1HHfB9ea+r6H8oPj03CItZr5pqrgF9nWu6Pj6SwBJNmfdUd265gsiWT9\nZuIGQliKtUALdCXsqBrhpWk3FtLQ4MW7fGk7ynGu33vVwF4gGRjSReqwZ/A52s5Y\nMYUdLPGY0wApTewtqXECAwEAAaNCMEAwDgYDVR0PAQH/BAQDAgKkMB0GA1UdJQQW\nMBQGCCsGAQUFBwMCBggrBgEFBQcDATAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3\nDQEBCwUAA4IBAQCMGDDkZ8cHZbXOCRMM7kSPSHDkke3BUUe8T7jQaWOJ4sBJf6Zf\nNL8QAWXRjMVHX81zwXYNTABP0Rx4T/F/aM2sZS6nFw+fWOTXzsHI132+RwACHjIs\n7J+QcKUJzSWRoyglO7ZVwkwDTAu9LYTw8Shn0EboatKeijAlenGMhoPo5rtibHor\nYaPGMT/5R7VbXbFQuus1EgH5gGLq7i2qAgFPaFITGGphgsze+LAXBfUHprcnKZgu\nGR+5w7oVPh0uzbSwyOzs8lmA8as6eW/6Ici4jZeL8By2iFK+oDOLix3sLXWqzhe3\nvwGVQaVIm9Omq3686c9DnMxsm6PptCrXenl+\n-----END CERTIFICATE-----\n",
    cert: "-----BEGIN CERTIFICATE-----\nMIIDADCCAeigAwIBAgIBAjANBgkqhkiG9w0BAQsFADAVMRMwEQYDVQQDEwptaW5p\na3ViZUNBMB4XDTE5MTEyNTE2NDUxOVoXDTIwMTEyNTE2NDUxOVowMTEXMBUGA1UE\nChMOc3lzdGVtOm1hc3RlcnMxFjAUBgNVBAMTDW1pbmlrdWJlLXVzZXIwggEiMA0G\nCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDqAbJdT7tFwdrXmE+UhKmux4QnHpo2\ngvBvebBBTyVkZgWkYczIb94ptPeWh0mFu6UsDdOPIABbQWRClx7ygNvtxefyp7IS\njtS1bekSNcSgk23UFvRqfu6/oTDCArBjuTCiy5gGUxnnRm7mSESIu3qha5UekGmD\n0RFrVLKfafhLop5VcVqYfmxs6nXh5xr+uE/ei3+NEtvH0Zj+z/Ax91QmLBdyOXA9\ni8Dx/e/zMvYOypG5dg35wC8jdfQQ8qSZAYXb+0Jed8JIWr9IFU2vMjHshPPGyqVy\n+33f+KgC4YSQ/bzUHBLVcrmdu2DDt0TT7A4MYJ3RzfGk5tn+Yvrje98vAgMBAAGj\nPzA9MA4GA1UdDwEB/wQEAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUH\nAwIwDAYDVR0TAQH/BAIwADANBgkqhkiG9w0BAQsFAAOCAQEACxMBTASmArhk+I8a\nL2HDM5dBoKwsl/9hJUh9x3PBH81s0TjDEzAPI4nyzpXF9GwHyqUlr0ln1q16D2bq\nLqCUfiprEuN7LafSqaSYgUB7PO7QfidocdkxqmkCIXVjAnnyXT1sdyq9+Vb53dtI\njHO233feskNRtZ4rviijJSdstfn4ezj7J3514vELvPor3ewDLRr6RLBEJf+O8oJJ\nqK+9RHYwlxTCtnlX2L2Odn5R27c/R272HPUXvxnXXx/wtDd+KCecVZlTvlPeTBtd\nRzZQg4LPh2WrsY5YNnmbAmbuB9t9e+33a2/29NtJs8MGpJNnN+MUw+RUf5BVxMo9\nfz43fA==\n-----END CERTIFICATE-----\n",
    key: "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA6gGyXU+7RcHa15hPlISprseEJx6aNoLwb3mwQU8lZGYFpGHM\nyG/eKbT3lodJhbulLA3TjyAAW0FkQpce8oDb7cXn8qeyEo7UtW3pEjXEoJNt1Bb0\nan7uv6EwwgKwY7kwosuYBlMZ50Zu5khEiLt6oWuVHpBpg9ERa1Syn2n4S6KeVXFa\nmH5sbOp14eca/rhP3ot/jRLbx9GY/s/wMfdUJiwXcjlwPYvA8f3v8zL2DsqRuXYN\n+cAvI3X0EPKkmQGF2/tCXnfCSFq/SBVNrzIx7ITzxsqlcvt93/ioAuGEkP281BwS\n1XK5nbtgw7dE0+wODGCd0c3xpObZ/mL643vfLwIDAQABAoIBACVrgApL5baR+Vzg\njllBnaDFZuyaiC6PYcNxwi2valtTtTNEMGsc+HnS5oS7vZYVG6Sf0WThySzOmCnN\n4LUGxiSPsTeseV1eWcVpfgvbbUYATV/NC+i7w5IBRLrBk1NfGdfulrDsOQgyyyko\nBU2YLVQC0CXDEhxyIkb3lFjJqVrup/ETbFEMPGNlM1lnKT4RxGQwqS5KlSLhb18f\n+tYhsMeZBb0p97GM2V1r4s6ktX+OxXU4tRpMGnhmKgrhvzeg1raGuV9txqYNOztd\nlB31i1qe0p+PHH23CyklbBYqYjzZXgZLsHG9FJRhCPaVwdpdxpEefxF91x6VQDux\npunO7QECgYEA/Nua24XIPfVOos2bJO18lgv2s9q6BKuRBuo+RbkG3g9wzoZ2uhxQ\nPueRP7HON0muWOGfu8liCMqGyUVwcfP92FS2Sj/i9GcTjqKOb4MmrHYjUMs0QhBL\n1e9iJo0EkxRI1W400Og0kMT2OTw1dhB0s0qAb95pi5joDao3TPUrR8kCgYEA7Oof\nQZofxVchU7Mcmt+38+mEcdRCFn0FG6Rp8qDjyRxa0AAXZ6428S3c2pmKKiWLGRZq\nloMyQmC8TGGxojIbKzLpH9W14Iv68eb5AXTlYeRZfxCmglbf50BOEpHYcFVW1jWX\nwJ8ipX0tLsTmcC1kkkiXeo49fsHTDZNwy1rTWzcCgYEA1FyXjWCpUSfx2Bd4AiaW\naOo5UsoTSpLQ5Y7bp/ECjINJSZpyolHfL0WKnoT1XUe7bphnb+5tMFbvpqB0FLBH\ndGWJB4jqUjszmKp7l7n9RACgHl3bUNSg7Fb1Bs2OlvwFQ4MgRoeOhjt1U5J2j+a4\nLFAY2FtiJ0TPN5LKiQ6rP8kCgYA/7VzJwuDXyw7/GtGZKMzmUBig7nl2v/1k3BSK\nl8dfOPt4LM4j9+pzYcC6a7vQa5kBB/9y5avmJVwp8CKSdZrHKVGmeXA+SwdHxt9h\n+Tz8ETXlB4UmnnKEX+GxORGCHkT0QDnWjBo5NXG/sPnNQzJkFpppQ4Bsd7iPbT1+\nYd+uOQKBgQDE02gGgpoTxjDET6RRhnhUyduVlukCWg5XGaMEWDoJwaInYs5aV61P\n0XzC81L5hZPVl7Silt0RFh/0BHQSiNpJh/P4OC4BNu+ktfBZt4Ktp3kCDp6qJezN\niHZcKQf5QnG8SxGFGse3jAdPplyyvcvxPKvKoUJUPZpxB2EHwlIwqw==\n-----END RSA PRIVATE KEY-----\n"
  });

  t.end();
});
