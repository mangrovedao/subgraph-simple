import { newMockEvent } from "matchstick-as";
import { ethereum, Address } from "@graphprotocol/graph-ts";
import { EIP712DomainChanged, OwnershipTransferred, ReferStarted, ReferralRecorded } from "../../generated/MgvReferral/MgvReferral";

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent());

  eip712DomainChangedEvent.parameters = new Array();

  return eip712DomainChangedEvent;
}

export function createOwnershipTransferredEvent(previousOwner: Address, newOwner: Address): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(newMockEvent());

  ownershipTransferredEvent.parameters = new Array();

  ownershipTransferredEvent.parameters.push(new ethereum.EventParam("previousOwner", ethereum.Value.fromAddress(previousOwner)));
  ownershipTransferredEvent.parameters.push(new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner)));

  return ownershipTransferredEvent;
}

export function createReferStartedEvent(owner: Address): ReferStarted {
  let referStartedEvent = changetype<ReferStarted>(newMockEvent());

  referStartedEvent.parameters = new Array();

  referStartedEvent.parameters.push(new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner)));

  return referStartedEvent;
}

export function createReferralRecordedEvent(referrer: Address, referee: Address): ReferralRecorded {
  let referralRecordedEvent = changetype<ReferralRecorded>(newMockEvent());

  referralRecordedEvent.parameters = new Array();

  referralRecordedEvent.parameters.push(new ethereum.EventParam("referrer", ethereum.Value.fromAddress(referrer)));
  referralRecordedEvent.parameters.push(new ethereum.EventParam("referee", ethereum.Value.fromAddress(referee)));

  return referralRecordedEvent;
}
