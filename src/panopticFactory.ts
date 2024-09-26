import { PoolDeployed as PoolDeployedEvent } from "../generated/PanopticFactory/PanopticFactory"
import { Pool } from "../generated/schema"
import { PanopticPool } from "../generated/templates";

export function handlePoolDeployed(event: PoolDeployedEvent): void {
  let pool = new Pool(event.params.poolAddress.toHex())
  pool.poolAddress = event.params.poolAddress
  pool.uniswapPool = event.params.uniswapPool
  pool.collateralTracker0 = event.params.collateralTracker0
  pool.collateralTracker1 = event.params.collateralTracker1
  pool.rareNftId = event.params.rareNftId
  pool.rarity = event.params.rarity
  pool.amount0 = event.params.amount0
  pool.amount1 = event.params.amount1

  pool.blockNumber = event.block.number
  pool.blockTimestamp = event.block.timestamp
  pool.transactionHash = event.transaction.hash

  pool.save()

  // dynamically track the newly deployed panoptic pool
  PanopticPool.create(event.params.poolAddress);
}

