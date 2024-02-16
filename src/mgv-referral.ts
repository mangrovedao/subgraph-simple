import {
  ReferStarted as ReferStartedEvent,
  ReferralRecorded as ReferralRecordedEvent
} from "../generated/MgvReferral/MgvReferral"
import { getOrCreateAccount } from "./helpers"

export function handleReferStarted(event: ReferStartedEvent): void {
  const user = getOrCreateAccount(event.params.owner, event.block.timestamp, false);

  user.isReferrer = true;

  user.save();
};

export function handleReferralRecorded(event: ReferralRecordedEvent): void {
  const user = getOrCreateAccount(event.params.referee, event.block.timestamp, false);

  user.referrer = event.params.referrer; 
  user.save();
};
