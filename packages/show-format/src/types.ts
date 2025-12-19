import type { SwarmSpecification } from '@skybrush/file-formats-doc/skyc';

export type {
  DroneSpecification,
  DroneType,
  LightProgram,
  SwarmSpecification,
  PyroProgram,
  Trajectory,
  TrajectoryKeypoint as TrajectorySegment,
  YawControl,
  YawControlSetpoint as YawControlSegment,
} from '@skybrush/file-formats-doc/skyc';

import type Asset from './asset.js';

/**
 * Enum that specifies whether the show is an outdoor or an indoor show
 */
export enum EnvironmentType {
  OUTDOOR = 'outdoor',
  INDOOR = 'indoor',
}

export const ENVIRONMENT_TYPES: EnvironmentType[] = [
  EnvironmentType.OUTDOOR,
  EnvironmentType.INDOOR,
];

/**
 * A single 3D coordinate in .skyc files, in tuple notation.
 */
export type Vector3Tuple = [number, number, number];

/**
 * A single 3D coordinate in .skyc files, in object notation.
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** A single RGB color used by the light program player */
export type Color = [number, number, number];

/**
 * Quaternion in .skyc files, in tuple notation, in JPL order (wxyz).
 */
export type Quaternion = [number, number, number, number];

/**
 * Action to perform when the geofence fence is breached
 */
export enum GeofenceAction {
  REPORT = 'report',
  LAND = 'land',
  RETURN = 'return',
  SMART_LAND = 'smartLand',
  SMART_RETURN = 'smartReturn',
  STOP = 'stop',
  SHUT_DOWN = 'shutDown',
}

/**
 * Show segment IDs that are currently recognized by the Skybrush platform.
 */
export type ShowSegmentId = 'takeoff' | 'show' | 'landing';

/**
 * The definition of a show segment.
 *
 * The first number in the tuple is the start time of the segment in seconds (inclusive),
 * the second number is the end time of the segment in seconds (exclusive).
 */
export type ShowSegment = [number, number];

/**
 * This schema describes the proper usage of the JSON structure inside the Skybrush compiled show file format (.skyc).
 */
export interface ShowSpecification {
  /** Version number of the show specification format */
  version: number;

  /** The environment of the show */
  environment: Environment;

  /** Media settings related to the show */
  media?: MediaSettings;

  /** Additional metadata of the show */
  meta?: ShowMetadata;

  /** General settings of the show */
  settings?: ShowSettings;

  /** Specification of the drone swarm that participates in the show */
  swarm: SwarmSpecification;
}

/**
 * The environment of the show, including important areas, objects, buildings, camera positions etc
 */
export interface Environment {
  /** Type of the environment (indoor or outdoor). */
  type: EnvironmentType;

  /** List of cameras associated to the show */
  cameras?: Camera[];

  /** The proposed show origin and orientation that locate the show in the real world */
  location?: Location;
}

/**
 * Enum speceifying the supported camera types.
 */
export enum CameraType {
  PERSPECTIVE = 'perspective',
}

/**
 * Defines the name, position and orientation of a pre-defined camera
 */
export interface Camera {
  /**
   * The type of the camera. The default is CameraType.PERSPECTIVE.
   */
  type?: CameraType;

  /**
   * An optional, unique, human-readable identifier of the camera.
   */
  name?: string;

  /**
   * The position of the camera. The default position is [0, 0, 0].
   */
  position?: Vector3Tuple;

  /**
   * The orientation of the camera, relative to its base orientation.
   *
   * In the base orientation, the camera points towards the negative Z
   * axis such that the positive X axis is to the _right_. The coordinate
   * system is right-handed. The default orientation is [1, 0, 0, 0].
   */
  orientation?: Quaternion;

  /**
   * The focal length of the camera, in millimeters. The default is 23mm.
   */
  focalLength?: number;

  /**
   * Whether this camera is the default, preferred camera of the show.
   */
  default?: boolean;
}

/**
 * The proposed show origin and orientation that locate the show in the real world
 */
export interface Location {
  /**
   * Geodetic location of the show coordinate system
   */
  origin: [number, number, number?];

  /**
   * Angle of the X+ axis of the show coordinate system in degrees relative to North
   */
  orientation: number;
}

/**
 * Media settings associated with the show
 */
export interface MediaSettings {
  /**
   * Audio data (i.e. background music) associated with the show. May be embedded
   * in base64 format or may be an external reference to a binary file.
   */
  audio?: {
    /** The audio data. */
    data: Uint8Array | Asset;

    /** The name of the file that the audio data came from */
    filename?: string;

    /** MIME media type of the audio data */
    mediaType: 'audio/mpeg';
  };
}

/**
 * Metadata of the show, such as a unique ID or title.
 */
export interface ShowMetadata {
  /** The title of the show */
  title?: string;

  /**  Unique short string ID associated with the show */
  id?: string;

  /**
   * Names of the input files, directories or URLs that the .skyc file was
   * created from, if relevant
   */
  sources?: string[];

  /**
   * Number of seconds to add to every timestamp in the show file; used when
   * the trajectories in the show file represent only a part of the full
   * trajectory.
   */
  timestampOffset?: number;

  /**
   * Known show segments.
   */
  segments?: Partial<Record<ShowSegmentId, ShowSegment>>;
}

/**
 * General settings associated with a drone show
 */
export interface ShowSettings {
  /** List of cues associated to the show */
  cues?: CueSheet;

  /** Definition of the preferred geofence of the show */
  geofence?: Geofence;

  /** Safety validation settings of the show */
  validation?: ValidationSettings;
}

/**
 * Interface specification of a cue sheet for the show.
 */
export interface CueSheet {
  /**
   * The version of the cue sheet format. This definition is for version 1.
   */
  version: number;

  /**
   * The list of cues in the show.
   */
  items: Cue[];
}

/**
 * Interface specification of a single cue in the show.
 */
export interface Cue {
  /**
   * A human-readable name of the cue, used in plots and 3D animation software
   */
  name: string;

  /**
   * The time corresponding to the cue, in seconds
   */
  time: number;
}

/**
 * Specification of a proposed geofence for the show
 */
export interface Geofence {
  /**
   * The version of the geofence format. This definition is for version 1.
   */
  version: number;

  /** The list of polygons that constitute the geofence */
  polygons: GeofencePolygon[];

  /** Action to perform when the geofence is breached */
  action?: GeofenceAction;
}

/**
 * Interface specification of a single inclusion or exclusion polygon in the
 * geofence.
 */
export interface GeofencePolygon {
  /** Specifies whether the polygon is an inclusion or an exclusion polygon */
  isInclusion: boolean;

  /** The points of the polygon */
  points: Vector3Tuple[];
}

/**
 * Specification of the safety validation parameters for the show
 */
export interface ValidationSettings {
  /** The maximum allowed altitude for drones, in meters, above ground level */
  maxAltitude?: number;

  /** The maximum horizontal velocity allowed for drones, in meters per second */
  maxVelocityXY?: number;

  /** The maximum vertical velocity allowed for drones, in meters per second */
  maxVelocityZ?: number;

  /**
   * The maximum vertical velocity allowed for drones, upwards, in meters per
   * second. Takes precedence over maxVelocityZ when specified.
   */
  maxVelocityZUp?: number;

  /** The minimum allowed distance between drones, in meters */
  minDistance?: number;
}

/**
 * Time window.
 *
 * `duration` must not be negative. The end time of the time window (`startTime + duration`)
 * is not part of the time window, so it is closed from the left and open from the right.
 */
export type TimeWindow = {
  startTime: number;
  duration: number;
};

/**
 * Helper type that fully represents a trajectory segment, including its start
 * and end timestamps and points, and any additional intermediate control points.
 *
 * Bezier curve with time information.
 *
 * `points` contains all the control points of the curve, including the start and end points.
 */
export type TimedBezierCurve = TimeWindow & {
  points: Vector3Tuple[];
};
