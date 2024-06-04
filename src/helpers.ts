import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Account } from "../generated/schema";

export const getOfferId = (olKeyHash: Bytes, id: BigInt): string => {
  return `${olKeyHash.toHex()}-${id.toString()}`;
};

export const getOrCreateAccount = (address: Address, currentDate: BigInt, isAnInteraction: boolean): Account => {
  let account = Account.load(address);

  if (!account) {
    account = new Account(address);
    account.address = address;
    account.proxyDeployed = false;
    account.save();
  }

  return account;
};

export const getEventUniqueId = (event: ethereum.Event): string => {
  return `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;
};
