import { SmartRouterProxy } from "../generated/templates";
import { ProxyDeployed } from "../generated/RouterProxyFactory/RouterProxyFactory";
import { getOrCreateAccount } from "./helpers/create";
import { saveAccount } from "./helpers/save";

export function handleNewRouterProxy(event: ProxyDeployed): void {
  SmartRouterProxy.create(event.params.proxy);
  const user = getOrCreateAccount(event.params.owner, event.block, true);
  user.proxyDeployed = true;
  user.proxy = event.params.proxy;
  saveAccount(user, event.block);
}
