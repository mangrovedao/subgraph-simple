import { SmartRouterProxy } from "../generated/templates";
import { ProxyDeployed } from "../generated/RouterProxyFactory/RouterProxyFactory";
import { getOrCreateAccount } from "./helpers";

export function handleNewRouterProxy(event: ProxyDeployed): void {
  SmartRouterProxy.create(event.params.proxy);
  const user = getOrCreateAccount(event.params.owner, event.block.timestamp, true);
  user.proxyDeployed = true;
  user.proxy = event.params.proxy;
  user.save();
}
