import { BigInt } from "@graphprotocol/graph-ts"
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
import { ExampleEntity } from "../generated/schema"

export function handleApproval(event: Approval): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from)

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.outbound_tkn = event.params.outbound_tkn
  entity.inbound_tkn = event.params.inbound_tkn

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.DOMAIN_SEPARATOR(...)
  // - contract.PERMIT_TYPEHASH(...)
  // - contract.allowances(...)
  // - contract.approve(...)
  // - contract.balanceOf(...)
  // - contract.best(...)
  // - contract.config(...)
  // - contract.configInfo(...)
  // - contract.flashloan(...)
  // - contract.governance(...)
  // - contract.isLive(...)
  // - contract.locked(...)
  // - contract.marketOrder(...)
  // - contract.marketOrderFor(...)
  // - contract.nonces(...)
  // - contract.offerDetails(...)
  // - contract.offerInfo(...)
  // - contract.offers(...)
  // - contract.retractOffer(...)
  // - contract.snipes(...)
  // - contract.snipesFor(...)
  // - contract.withdraw(...)
}

export function handleCredit(event: Credit): void {}

export function handleDebit(event: Debit): void {}

export function handleKill(event: Kill): void {}

export function handleNewMgv(event: NewMgv): void {}

export function handleOfferFail(event: OfferFail): void {}

export function handleOfferRetract(event: OfferRetract): void {}

export function handleOfferSuccess(event: OfferSuccess): void {}

export function handleOfferWrite(event: OfferWrite): void {}

export function handleOrderComplete(event: OrderComplete): void {}

export function handleOrderStart(event: OrderStart): void {}

export function handlePosthookFail(event: PosthookFail): void {}

export function handleSetActive(event: SetActive): void {}

export function handleSetDensity(event: SetDensity): void {}

export function handleSetFee(event: SetFee): void {}

export function handleSetGasbase(event: SetGasbase): void {}

export function handleSetGasmax(event: SetGasmax): void {}

export function handleSetGasprice(event: SetGasprice): void {}

export function handleSetGovernance(event: SetGovernance): void {}

export function handleSetMonitor(event: SetMonitor): void {}

export function handleSetNotify(event: SetNotify): void {}

export function handleSetUseOracle(event: SetUseOracle): void {}
