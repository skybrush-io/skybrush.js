type PathDurationEstimationOptions = {
  distance: number;
  targetVelocity: number;
  acceleration: number;
};

/**
 * Estimate the amount of time it takes to traverse a path with a given target
 * speed and acceleration, starting from and ending with zero velocity.
 *
 * @param distance - the distance to travel
 * @param targetVelocity - the target velocity to achieve while traversing the path
 * @param acceleration - acceleration while traversing the path. We assume that this
 *        acceleration can be reached in an instantaneous manner from a standstill.
 */
export const estimatePathDuration = ({
  distance,
  targetVelocity,
  acceleration,
}: PathDurationEstimationOptions): number => {
  const maxAccelerationDuration = targetVelocity / acceleration;
  const maxAccelerationDistance =
    maxAccelerationDuration * (targetVelocity / 2);

  if (distance > 2 * maxAccelerationDistance) {
    // The target speed is achieved
    const constantSpeedDistance = distance - 2 * maxAccelerationDistance;
    const constantSpeedDuration = constantSpeedDistance / targetVelocity;
    return 2 * maxAccelerationDuration + constantSpeedDuration;
  } else {
    // Target speed will not be reached
    const accelerationDistance = distance / 2;
    const maxSpeed = Math.sqrt(2 * accelerationDistance * acceleration);
    const accelerationDuration = maxSpeed / acceleration;
    return 2 * accelerationDuration;
  }
};
