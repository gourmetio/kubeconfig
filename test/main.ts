import {KubeConfig} from "../src";

(async () => {
  const kc = new KubeConfig();
  kc.loadFromDefault();

  console.log(kc.getCurrentContext().user);
  
  const options = await kc.getRequestOptions();

  console.log(options);
})();
