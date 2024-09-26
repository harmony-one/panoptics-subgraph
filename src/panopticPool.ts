import { AccountLiquidated, ForcedExercised, OptionMinted, OptionBurnt, OptionRolled, } from "../generated/templates/PanopticPool/PanopticPool"
import { Position, Liquidation, ForcedExercise, Pool } from "../generated/schema"

export function handleAccountLiquidation(event: AccountLiquidated): void {
  let liquidation = new Liquidation(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  liquidation.liquidator = event.params.liquidator
  liquidation.liquidatee = event.params.liquidatee
  liquidation.bonusAmounts = event.params.bonusAmounts
  liquidation.tick = event.params.tickAt

  liquidation.blockNumber = event.block.number
  liquidation.blockTimestamp = event.block.timestamp
  liquidation.transactionHash = event.transaction.hash

  // account liquidation calls _burnOptions, which emits OptionBurnt
  // the option status update will happen upon that emitted event

  let pool = Pool.load(event.address.toHex())
  if (pool != null) {
    liquidation.pool = pool.id
  }

  liquidation.save()
}

export function handleForcedExercised(event: ForcedExercised): void {
  let exercise = new ForcedExercise(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  exercise.exercisor = event.params.exercisor
  exercise.user = event.params.user
  exercise.tokenId = event.params.tokenId
  exercise.exerciseFee = event.params.exerciseFee
  exercise.tick = event.params.tickAt

  exercise.blockNumber = event.block.number
  exercise.blockTimestamp = event.block.timestamp
  exercise.transactionHash = event.transaction.hash

  // forced exercise calls _burnOptions, which emits OptionBurnt
  // the option status update will happen upon that emitted event

  let pool = Pool.load(event.address.toHex())
  if (pool != null) {
    exercise.pool = pool.id
  }

  exercise.save()
}

export function handleOptionMinted(event: OptionMinted): void {
  let position = new Position(event.params.tokenId.toHex())
  position.owner = event.params.recipient
  position.size = event.params.positionSize
  position.poolUtilizations = event.params.poolUtilizations
  position.tick = event.params.tickAtMint
  position.active = true

  position.blockNumber = event.block.number
  position.blockTimestamp = event.block.timestamp
  position.transactionHash = event.transaction.hash

  let pool = Pool.load(event.address.toHex())
  if (pool != null) {
    position.pool = pool.id
  }

  position.save()
}

export function handleOptionBurnt(event: OptionBurnt): void {
  let position = Position.load(event.params.tokenId.toHex())
  if (position != null) {
    position.active = false
    position.blockNumber = event.block.number
    position.blockTimestamp = event.block.timestamp
    position.transactionHash = event.transaction.hash

    position.save()
  }
}

export function handleOptionRolled(event: OptionRolled): void {
  let oldPosition = Position.load(event.params.oldTokenId.toHex())
  if (oldPosition != null) {
    // essentially, rolling an option burns the option. however, OptionBurnt event 
    // is not emitted. thus, have to manually set the option as inactive (burnt).
    oldPosition.active = false
    oldPosition.blockNumber = event.block.number
    oldPosition.blockTimestamp = event.block.timestamp
    oldPosition.transactionHash = event.transaction.hash

    oldPosition.save()
  }

  let newPosition = new Position(event.params.newTokenId.toHex())
  newPosition.owner = event.params.recipient
  newPosition.size = event.params.positionSize
  newPosition.tick = event.params.tickAtRoll
  newPosition.poolUtilizations = event.params.poolUtilizations
  newPosition.active = true

  newPosition.blockNumber = event.block.number
  newPosition.blockTimestamp = event.block.timestamp
  newPosition.transactionHash = event.transaction.hash

  newPosition.save()
}