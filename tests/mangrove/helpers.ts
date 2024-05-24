import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { createMockedFunction, log } from "matchstick-as";
import { MgvReader__offerListResult, MgvReader__offerListResultValue2Struct, MgvReader__offerListResultValue3Struct } from "../../generated/Mangrove/MgvReader";

export const prepareERC20 = (address: Address, name: string, symbol: string, decimals: i32): void => {
  createMockedFunction(address, "name", "name():(string)").returns([ethereum.Value.fromString(name)]);
  createMockedFunction(address, "symbol", "symbol():(string)").returns([ethereum.Value.fromString(symbol)]);
  createMockedFunction(address, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(decimals)]);
};

export const mockOfferList = (address: Address): void => {
  const currentId = BigInt.fromU32(0);
  const offerIds: BigInt[] = new Array();
  const offers: Array<MgvReader__offerListResultValue2Struct> = new Array();
  const details: Array<MgvReader__offerListResultValue3Struct> = new Array();
  const values = new ethereum.Tuple();
  values.push(ethereum.Value.fromUnsignedBigInt(currentId));
  values.push(ethereum.Value.fromUnsignedBigIntArray(new Array()));
  values.push(ethereum.Value.fromTupleArray(new Array()));
  values.push(ethereum.Value.fromTupleArray(new Array()));

  const marketOLKeyStruct = new ethereum.Tuple(3);
  marketOLKeyStruct[0] = ethereum.Value.fromAddress(Address.fromString("0x4300000000000000000000000000000000000004"));
  marketOLKeyStruct[1] = ethereum.Value.fromAddress(Address.fromString("0x4300000000000000000000000000000000000003"));
  marketOLKeyStruct[2] = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1));

  const x = createMockedFunction(
    address,
    "offerList",
    "offerList((address,address,uint256),uint256,uint256):(uint256,uint256[],(uint256,uint256,int256,uint256)[],(address,uint256,uint256,uint256)[])"
  ).withArgs([
    ethereum.Value.fromTuple(marketOLKeyStruct),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))
  ]);

  log.info("{}", ["hello"]);
  x.returns(values);
  log.info("Mocking offerList for {}", [address.toHex()]);
};
