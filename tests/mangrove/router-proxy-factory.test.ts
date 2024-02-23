import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";
import { Address } from "@graphprotocol/graph-ts";
import { createProxyDeployedEvent } from "./router-proxy-factory-utils";
import { handleNewRouterProxy } from "../../src/router-proxy-factory";
import { Account } from "../../generated/schema";

const proxy = Address.fromString("0x0000000000000000000000000000000000000040");
const owner = Address.fromString("0x0000000000000000000000000000000000000041");
const implementation = Address.fromString("0x0000000000000000000000000000000000000042");

describe("Verify proxy owner indexing", () => {
  beforeAll(() => {});

  afterAll(() => {
    clearStore();
  });

  test("Check if proxy is stored on owner account", () => {
    const proxyDeployedEvent = createProxyDeployedEvent(proxy, owner, implementation);
    handleNewRouterProxy(proxyDeployedEvent);

    const account = Account.load(owner);
    assert.assertNotNull(account);
    if (account == null) {
      return;
    }
    assert.fieldEquals("Account", owner.toHexString(), "proxyDeployed", "true");
    assert.fieldEquals("Account", owner.toHexString(), "proxy", proxy.toHexString());
  });
});
