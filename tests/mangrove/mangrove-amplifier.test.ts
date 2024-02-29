import { assert, describe, test, clearStore, beforeAll, afterAll, beforeEach, afterEach } from "matchstick-as/assembly/index";
import { BigInt, Bytes, Address, ethereum } from "@graphprotocol/graph-ts";
import { handleEndBundle, handleInitBundle, handleNewOwnedOffer } from "../../src/mangrove-amplifier";
import { createEndBundleEvent, createInitBundleEvent, createNewOwnedOfferEvent } from "../mangrove/mangrove-amplifier-utils";
import { createOfferWriteEvent, createSetActiveEvent } from "./mangrove-utils";
import { handleOfferWrite, handleSetActive } from "../../src/mangrove";
import { prepareERC20 } from "./helpers";
import { createDummyOffer, getEventUniqueId, getOfferId } from "../../src/helpers";
import { getLatestBundleFromStack } from "../../src/stack";
import { createMangroveOrderStartEvent } from "./mangrove-order-utils";
import { handleMangroveOrderStart } from "../../src/mangrove-order";
import { Offer } from "../../generated/schema";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

const bundleId = BigInt.fromI32(1);

const token0 = Address.fromString("0x0000000000000000000000000000000000000000");
const token1 = Address.fromString("0x0000000000000000000000000000000000000001");
prepareERC20(token0, "token0", "tkn0", 18);
prepareERC20(token1, "token1", "tkn1", 6);

const maker = Address.fromString("0x0000000000000000000000000000000000000002");
const taker = Address.fromString("0x0000000000000000000000000000000000000003");
const owner = Address.fromString("0x0000000000000000000000000000000000000004");
const mgv = Address.fromString("0x0000000000000000000000000000000000000005");
const olKeyHash01 = Bytes.fromHexString("0x" + token0.toHex().slice(2) + token1.toHex().slice(2));
const olKeyHash10 = Bytes.fromHexString("0x" + token1.toHex().slice(2) + token0.toHex().slice(2));

const inboundLogic = Address.fromString("0x0000000000000000000000000000000000000006");
const outboundLogic = Address.fromString("0x0000000000000000000000000000000000000007");

describe("Describe entity assertions", () => {
  beforeEach(() => {
    const setActiveEvent = createSetActiveEvent(olKeyHash01, token0, token1, BigInt.fromI32(1), true);
    handleSetActive(setActiveEvent);
    assert.entityCount("Market", 1);
  });

  afterEach(() => {
    clearStore();
  });

  test("EndBundle removes bundle from stack", () => {
    const createBundleEvent = createInitBundleEvent(bundleId, token0);
    handleInitBundle(createBundleEvent);

    const endBundleEvent = createEndBundleEvent();
    handleEndBundle(endBundleEvent);

    const bundle = getLatestBundleFromStack();

    assert.assertNull(bundle);
  });

  test("InitBundle created and stored", () => {
    const createBundleEvent = createInitBundleEvent(bundleId, token0);

    handleInitBundle(createBundleEvent);

    // Added to stack
    const bundle = getLatestBundleFromStack();
    assert.assertNotNull(bundle);

    const initId = getEventUniqueId(createBundleEvent);

    assert.entityCount("AmplifiedOfferBundle", 1);
    assert.fieldEquals("AmplifiedOfferBundle", initId, "id", initId);
    assert.fieldEquals("AmplifiedOfferBundle", initId, "bundleId", bundleId.toString());
    assert.fieldEquals("AmplifiedOfferBundle", initId, "creationDate", createBundleEvent.block.timestamp.toString());
  });

  test("Offers are added to the current bundle", () => {
    const createBundleEvent = createInitBundleEvent(bundleId, token0);
    handleInitBundle(createBundleEvent);

    const offerId = BigInt.fromI32(1);

    let offerWrite = createOfferWriteEvent(olKeyHash01, maker, BigInt.fromI32(1000), BigInt.fromI32(2000), BigInt.fromI32(0), BigInt.fromI32(0), offerId);
    handleOfferWrite(offerWrite);

    const offerIdString = getOfferId(olKeyHash01, offerId);
    const offer = Offer.load(offerIdString)!;

    const bundle = getLatestBundleFromStack();
    assert.assertNotNull(bundle);

    if (bundle !== null) {
      assert.equals(ethereum.Value.fromI32(bundle.offers.length), ethereum.Value.fromI32(1));
      const offerOut = bundle.offers[0];
      assert.assertNotNull(offerOut);
      assert.equals(ethereum.Value.fromString(offerOut), ethereum.Value.fromString(offerIdString));
      // assert.fieldEquals("AmplifiedOffer", offerOut, "id", offerId.toString());
    }
  });

  test("NewOwnedOffer updates owner of bundle and offers", () => {
    const createBundleEvent = createInitBundleEvent(bundleId, token0);
    handleInitBundle(createBundleEvent);

    const offerId = BigInt.fromI32(1);

    let offerWrite = createOfferWriteEvent(olKeyHash01, maker, BigInt.fromI32(1000), BigInt.fromI32(2000), BigInt.fromI32(0), BigInt.fromI32(0), offerId);
    handleOfferWrite(offerWrite);

    const offerIdString = getOfferId(olKeyHash01, offerId);

    const newOwnedOfferEvent = createNewOwnedOfferEvent(olKeyHash01, offerId, owner);
    handleNewOwnedOffer(newOwnedOfferEvent);

    const bundle = getLatestBundleFromStack();
    assert.assertNotNull(bundle);
    if (bundle !== null) {
      assert.fieldEquals("AmplifiedOfferBundle", bundle.id, "owner", owner.toHex());
    }

    assert.fieldEquals("AmplifiedOffer", offerIdString, "owner", owner.toHex());
  });
});
