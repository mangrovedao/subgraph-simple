import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Weigths
} from "../../generated/PointsWeights/PointsWeights"

export function createWeigthsEvent(
  base: Address,
  quote: Address,
  fromBlock: BigInt,
  toBlock: BigInt,
  takerPointsPerDollar: BigInt,
  makerPointsPerDollar: BigInt,
  reffererPointsPerDollar: BigInt
): Weigths {
  let weigthsEvent = changetype<Weigths>(newMockEvent())

  weigthsEvent.parameters = new Array()

  weigthsEvent.parameters.push(
    new ethereum.EventParam("base", ethereum.Value.fromAddress(base))
  )
  weigthsEvent.parameters.push(
    new ethereum.EventParam("quote", ethereum.Value.fromAddress(quote))
  )
  weigthsEvent.parameters.push(
    new ethereum.EventParam(
      "fromBlock",
      ethereum.Value.fromUnsignedBigInt(fromBlock)
    )
  )
  weigthsEvent.parameters.push(
    new ethereum.EventParam(
      "toBlock",
      ethereum.Value.fromUnsignedBigInt(toBlock)
    )
  )
  weigthsEvent.parameters.push(
    new ethereum.EventParam(
      "takerPointsPerDollar",
      ethereum.Value.fromUnsignedBigInt(takerPointsPerDollar)
    )
  )
  weigthsEvent.parameters.push(
    new ethereum.EventParam(
      "makerPointsPerDollar",
      ethereum.Value.fromUnsignedBigInt(makerPointsPerDollar)
    )
  )
  weigthsEvent.parameters.push(
    new ethereum.EventParam(
      "reffererPointsPerDollar",
      ethereum.Value.fromUnsignedBigInt(reffererPointsPerDollar)
    )
  )

  return weigthsEvent
}
