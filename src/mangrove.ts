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
import { Market } from "./entities/market"
import { Account } from "./entities/account"
import { Offer } from "./entities/offer"

const getOrCreateAccount = (address: Address): Account => {
  let account = Account.load(address);

  if (!account) {
    account = new Account(address, address);
    account.save();
  }

  return account;
}

export function handleApproval(event: Approval): void {}

export function handleCredit(event: Credit): void {}

export function handleDebit(event: Debit): void {}

export function handleKill(event: Kill): void {}

export function handleNewMgv(event: NewMgv): void {}

export function handleOfferFail(event: OfferFail): void {
  const offer = Offer.load(event.params.id, event.params.outbound_tkn, event.params.inbound_tkn)!; 

  offer.isOpen = false;
  offer.isFailed = false;

  offer.failedReason = event.params.mgvData.toString();

  offer.save();
}

export function handleOfferRetract(event: OfferRetract): void {
  const offer = Offer.load(event.params.id, event.params.outbound_tkn, event.params.inbound_tkn)!; 

  offer.isOpen = false;

  offer.save();
}

export function handleOfferSuccess(event: OfferSuccess): void {
  const offer = Offer.load(event.params.id, event.params.outbound_tkn, event.params.inbound_tkn)!;

  offer.wants = offer.wants.minus(event.params.takerWants);
  offer.gives = offer.gives.minus(event.params.takerGives);

  const BN_0 = BigInt.fromI32(0);
  if (offer.wants == BN_0 && offer.gives == BN_0) {
    offer.isOpen = false;
    offer.isFilled = false;
  }

  offer.save();
}

export function handleOfferWrite(event: OfferWrite): void {
  const offer = new Offer(
      event.params.id,
      event.params.outbound_tkn,
      event.params.inbound_tkn,
  );

  const owner = getOrCreateAccount(event.params.maker);
  offer.setMaker(owner);

  const market = Market.load(event.params.outbound_tkn, event.params.inbound_tkn)!;
  offer.setMarket(market)

  offer.wants = event.params.wants,
  offer.initialWants = event.params.wants;

  offer.gives = event.params.gives,
  offer.initialGives = event.params.gives;

  offer.gasprice = event.params.gasprice,
  offer.gasreq = event.params.gasreq,
  offer.prev = event.params.prev,
  offer.isOpen = true;
  offer.isFailed = false;
  offer.isFilled = true;
 
  offer.save();
}

export function handleOrderComplete(event: OrderComplete): void {}

export function handleOrderStart(event: OrderStart): void {}

export function handlePosthookFail(event: PosthookFail): void {}

export function handleSetActive(event: SetActive): void {
  let market = Market.load(event.params.outbound_tkn, event.params.inbound_tkn);

  if (!market) {
    market = new Market(event.params.outbound_tkn, event.params.inbound_tkn);
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
