import { ReferStarted as ReferStartedEvent, ReferralRecorded as ReferralRecordedEvent } from "../generated/MgvReferral/MgvReferral";
import { getOrCreateAccount } from "./helpers/create";
import { saveAccount } from "./helpers/save";

export function handleReferStarted(event: ReferStartedEvent): void {
  const user = getOrCreateAccount(event.params.owner, event.block, false);

  user.isReferrer = true;
  saveAccount(user, event.block);
}

export function handleReferralRecorded(event: ReferralRecordedEvent): void {
  const user = getOrCreateAccount(event.params.referee, event.block, false);

  user.referrer = event.params.referrer;
  saveAccount(user, event.block);
}
