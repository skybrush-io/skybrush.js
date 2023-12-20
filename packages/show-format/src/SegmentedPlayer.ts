import { bisect } from './utils';

export type Segment<Setpoint, Metadata extends unknown[] = []> = [
  startTime: number,
  setpoint: Setpoint,
  ...rest: Metadata
];

/**
 * Class that takes an array of segments and can evaluate the desired state
 * at any time instant by interpolating between the given setpoints.
 */
export class SegmentedPlayerImpl<
  SetpointType,
  EvaluatorType,
  MetadataType extends unknown[] = []
> {
  protected readonly _numSegments: number;
  private readonly _segments: Array<Segment<SetpointType, MetadataType>>;
  protected readonly _startTimes: number[];
  private readonly _specialSegmentFuncs: {
    beforeFirst: EvaluatorType;
    afterLast: EvaluatorType;
  };

  private _segmentFuncs: Array<EvaluatorType | undefined>;

  private _currentSegment: Segment<SetpointType, MetadataType> | undefined;
  protected _currentSegmentFunc: EvaluatorType;
  private _currentSegmentStartTime: number;
  private _currentSegmentEndTime: number;
  private _currentSegmentLength: number;
  private _segmentIndex: number;

  // NOTE: These virtual values / functions NEED to be overridden in subclasses!
  protected _defaultSetpoint?: SetpointType;
  protected _createConstantSegmentFunctions?(at: SetpointType): EvaluatorType;
  protected _createSegmentFunctions?(
    from: Segment<SetpointType, MetadataType>,
    to: Segment<SetpointType, MetadataType>,
    length: number
  ): EvaluatorType;

  /**
   * Constructor.
   *
   * @param segments  the segments to evaluate
   */
  constructor(segments: Array<Segment<SetpointType, MetadataType>>) {
    this._numSegments = segments.length;
    this._startTimes = segments.map((item) => item[0]);
    this._segments = [...segments];

    const firstSetpoint: SetpointType =
      this._numSegments > 0 ? this._segments[0][1] : this._defaultSetpoint!;
    const lastSetpoint: SetpointType =
      this._numSegments > 0
        ? this._segments[this._numSegments - 1][1]
        : this._defaultSetpoint!;

    this._segmentFuncs = [];
    this._segmentFuncs.length = this._numSegments;

    this._specialSegmentFuncs = {
      beforeFirst: this._createConstantSegmentFunctions!(firstSetpoint),
      afterLast: this._createConstantSegmentFunctions!(lastSetpoint),
    };

    this._segmentIndex = 0;
    this._currentSegmentFunc = this._specialSegmentFuncs.beforeFirst;
    this._currentSegmentStartTime = Number.NEGATIVE_INFINITY;
    this._currentSegmentEndTime =
      this._numSegments > 0 ? this._startTimes[0] : Number.POSITIVE_INFINITY;
    this._currentSegmentLength = 0;

    this._reset();
  }

  _reset() {
    this._selectSegment(-1);
  }

  /**
   * Updates the state variables if needed to ensure that
   * the current segment includes the given time.
   *
   * @param  time  the timestamp to seek to
   */
  _seekTo(time: number) {
    let found = false;

    if (time >= this._currentSegmentStartTime) {
      if (time < this._currentSegmentEndTime) {
        // We are done. Note the strict comparison; this is to ensure that we
        // always return the velocity from the right side consistently.
        found = true;
      } else if (this._segmentIndex < this._numSegments - 2) {
        // Maybe we only need to step to the next segment?
        // This is the common case.
        const nextEnd = this._startTimes[this._segmentIndex + 2];
        if (nextEnd > time) {
          // We are done. Note the strict comparison; this is to ensure that we
          // always return the velocity from the right side consistently.
          this._selectSegment(this._segmentIndex + 1);
          found = true;
        }
      } else {
        // Reached the end of the segments
        this._selectSegment(this._numSegments);
        found = true;
      }
    }

    // Do things the hard way, with binary search
    if (!found) {
      const index = bisect(this._startTimes, time);
      this._selectSegment(index - 1);
    }

    // Return the relative time into the current segment
    if (this._currentSegmentLength > 0) {
      return (
        (time - this._currentSegmentStartTime) / this._currentSegmentLength
      );
    }

    return 0;
  }

  /**
   * Updates the state variables if needed to ensure that the segment
   * with the given index is the one that is currently selected.
   */
  _selectSegment(index: number) {
    this._segmentIndex = index;

    if (index < 0) {
      this._currentSegment = undefined;
      this._currentSegmentLength = 0;
      this._currentSegmentStartTime = Number.NEGATIVE_INFINITY;
      this._currentSegmentEndTime =
        this._numSegments > 0 ? this._startTimes[0] : Number.POSITIVE_INFINITY;
      this._currentSegmentFunc = this._specialSegmentFuncs.beforeFirst;
    } else if (index >= this._numSegments) {
      this._currentSegment = undefined;
      this._currentSegmentLength = 0;
      this._currentSegmentEndTime = Number.POSITIVE_INFINITY;
      /* istanbul ignore next */
      this._currentSegmentStartTime =
        this._numSegments > 0
          ? this._startTimes[this._numSegments - 1]
          : Number.NEGATIVE_INFINITY;
      this._currentSegmentFunc = this._specialSegmentFuncs.afterLast;
    } else {
      this._currentSegment = this._segments[index];
      this._currentSegmentStartTime = this._startTimes[index];

      if (index < this._numSegments - 1) {
        this._currentSegmentEndTime = this._startTimes[index + 1];
        this._currentSegmentLength =
          this._currentSegmentEndTime - this._currentSegmentStartTime;
      } else {
        this._currentSegmentEndTime = Number.POSITIVE_INFINITY;
        this._currentSegmentLength = 0;
      }

      if (!this._segmentFuncs[index]) {
        if (index < this._numSegments - 1) {
          this._segmentFuncs[index] = this._createSegmentFunctions!(
            this._segments[index],
            this._segments[index + 1],
            this._currentSegmentLength
          );
        } else {
          this._segmentFuncs[index] = this._createConstantSegmentFunctions!(
            this._currentSegment[1]
          );
        }
      }

      this._currentSegmentFunc = this._segmentFuncs[index]!;
    }
  }
}
