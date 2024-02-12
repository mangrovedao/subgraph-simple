import { log } from "@graphprotocol/graph-ts";
import {
  Weigths as WeigthsEvent
} from "../generated/PointsWeights/PointsWeights"
import { Weight } from "../generated/schema"

export const getWeightId = (event: WeigthsEvent): string => { 
  return `${event.params.base.toHex()}-${event.params.quote.toHex()}-${event.params.fromBlock.toHex()}`; 
} 
 
export function handleWeigths(event: WeigthsEvent): void {
  const weigthsId = getWeightId(event); 

  let weigths = Weight.load(weigthsId);
  if (!weigths) {
    weigths = new Weight(weigthsId);
  }
  
  weigths.base = event.params.base;
  weigths.quote = event.params.quote;
  weigths.fromBlock = event.params.fromBlock;
  weigths.toBlock = event.params.toBlock;
  weigths.takerPointsPerDollar = event.params.takerPointsPerDollar;
  weigths.makerPointsPerDollar = event.params.makerPointsPerDollar;
  weigths.reffererPointsPerDollar = event.params.reffererPointsPerDollar;

  weigths.save()
}
