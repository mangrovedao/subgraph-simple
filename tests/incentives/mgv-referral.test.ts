import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";
import { Address } from "@graphprotocol/graph-ts";
import { createReferStartedEvent, createReferralRecordedEvent } from "./mgv-referral-utils";
import { handleReferStarted, handleReferralRecorded } from "../../src/mgv-referral";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0
const alice = Address.fromString("0x0000000000000000000000000000000000000000");
const bob = Address.fromString("0x0000000000000000000000000000000000000001");

describe("Incentives: Referrals", () => {
  beforeAll(() => {});

  afterAll(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Referral, become a referee", () => {
    const aliceStartReferringEvent = createReferStartedEvent(alice);
    handleReferStarted(aliceStartReferringEvent);

    assert.fieldEquals("Account", alice.toHex(), "isReferrer", "true");

    const bobReferAliceEvent = createReferralRecordedEvent(alice, bob);
    handleReferralRecorded(bobReferAliceEvent);

    assert.fieldEquals("Account", bob.toHex(), "isReferrer", "false");
    assert.fieldEquals("Account", bob.toHex(), "referrer", alice.toHex());
  });
});
