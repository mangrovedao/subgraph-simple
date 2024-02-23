import { newMockEvent } from "matchstick-as";
import { ethereum, Address } from "@graphprotocol/graph-ts";
import { ProxyDeployed } from "../../generated/RouterProxyFactory/RouterProxyFactory";

export function createProxyDeployedEvent(proxy: Address, owner: Address, implementation: Address): ProxyDeployed {
  let proxyDeployedEvent = changetype<ProxyDeployed>(newMockEvent());

  proxyDeployedEvent.parameters = new Array();

  proxyDeployedEvent.parameters.push(new ethereum.EventParam("proxy", ethereum.Value.fromAddress(proxy)));
  proxyDeployedEvent.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)));
  proxyDeployedEvent.parameters.push(new ethereum.EventParam("implementation", ethereum.Value.fromAddress(implementation)));

  return proxyDeployedEvent;
}
