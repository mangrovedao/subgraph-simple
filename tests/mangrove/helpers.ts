import { Address, ethereum } from "@graphprotocol/graph-ts";
import { createMockedFunction } from "matchstick-as";

export const prepareERC20 = (address: Address, name: string, symbol: string, decimals: i32): void => {
  createMockedFunction(address, "name", "name():(string)").returns([ethereum.Value.fromString(name)]);
  createMockedFunction(address, "symbol", "symbol():(string)").returns([ethereum.Value.fromString(symbol)]);
  createMockedFunction(address, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(decimals)]);
};
