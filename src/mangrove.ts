import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Mangrove,
  Approval,
  Credit,
  Debit,
  Kill,
  NewMgv,
  OfferFail,
  OfferRetract,
  OfferSuccess,
  OfferWrite,
  OrderComplete,
  OrderStart,
  PosthookFail,
  SetActive,
  SetDensity,
  SetFee,
  SetGasbase,
  SetGasmax,
  SetGasprice,
  SetGovernance,
  SetMonitor,
  SetNotify,
  SetUseOracle
} from "../generated/Mangrove/Mangrove"
import { MarketEntity } from "./entities/market"
import { AccountEntity } from "./entities/account"
import { OfferEntity } from "./entities/offer"
import { log } from "matchstick-as"

const getOrCreateAccount = (address: Address): AccountEntity => {
  let account = AccountEntity.load(address);

  if (!account) {
    account = new AccountEntity(address, address);
    account.save();
  }

  return account;
}

export function handleApproval(event: Approval): void {}

export function handleCredit(event: Credit): void {}

export function handleDebit(event: Debit): void {}

export function handleKill(event: Kill): void {}

export function handleNewMgv(event: NewMgv): void {}

export function handleOfferFail(event: OfferFail): void {}

export function handleOfferRetract(event: OfferRetract): void {}

export function handleOfferSuccess(event: OfferSuccess): void {}

export function handleOfferWrite(event: OfferWrite): void {
  const owner = getOrCreateAccount(event.params.maker);
  const market = MarketEntity.load(event.params.outbound_tkn, event.params.inbound_tkn)!;

  const offer = new OfferEntity(
    Bytes.fromUTF8(`${event.transaction.hash.toHex()}-${event.logIndex}`),
    owner,
    market
  );
 
  offer.save();
}

export function handleOrderComplete(event: OrderComplete): void {}

export function handleOrderStart(event: OrderStart): void {}

export function handlePosthookFail(event: PosthookFail): void {}

export function handleSetActive(event: SetActive): void {
  let market = MarketEntity.load(event.params.outbound_tkn, event.params.inbound_tkn);

  if (!market) {
    market = new MarketEntity(event.params.outbound_tkn, event.params.inbound_tkn);
  }

  market.active = event.params.value;

  market.save();
}

export function handleSetDensity(event: SetDensity): void {}

export function handleSetFee(event: SetFee): void {}

export function handleSetGasbase(event: SetGasbase): void {}

export function handleSetGasmax(event: SetGasmax): void {}

export function handleSetGasprice(event: SetGasprice): void {}

export function handleSetGovernance(event: SetGovernance): void {}

export function handleSetMonitor(event: SetMonitor): void {}

export function handleSetNotify(event: SetNotify): void {}

export function handleSetUseOracle(event: SetUseOracle): void {}
