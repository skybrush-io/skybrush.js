import type Asset from './asset';

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
 * Interface specification of the drone swarm that participates in the show.
 */
export interface SwarmSpecification {
  /** The array of drones that constitute the swarm */
  drones: DroneSpecification[];
}

export enum DroneType {
  GENERIC = 'generic',
}

/**
 * Data that belongs to a single drone
 */
export interface DroneSpecification {
  /**
   * The type of the drone as an optional parameter. Use DroneType.GENERIC
   * as the default.
   */
  type?: DroneType;

  settings?: {
    /** An optional, unique, human-readable identifier of the drone. */
    name?: string;

    /** The trajectory of the drone during the show */
    trajectory: Trajectory;

    /** The light program of the drone during the show */
    lights?: LightProgram;

    /** The yaw control of the drone during the show */
    yawControl?: YawControl;

    /**
     * The home position of the drone. It is inferred from the first point of
     * the trajectory when omitted.
     */
    home?: Vector3Tuple;

    /** The landing position of the drone. */
    landAt?: Vector3Tuple;
  };
}

/**
 * A single segment in the trajectory definition of a drone.
 *
 * The first item of this triplet is the timestamp of the _endpoint_ of the
 * segment, relative to the takeoff time. The second is the _endpoint_ itself.
 * The start point is inferred from the endpoint of the previous segment in a
 * segment array. The third member is a list of additional control points if the
 * segment is not a straight line but a Bézier curve.
 */
export type TrajectorySegment = [number, Vector3Tuple, Vector3Tuple[]];

/**
 * The trajectory definition of a single drone
 */
export interface Trajectory {
  /** The version of the trajectory format */
  version: number;

  /**
   * The list of segments in the trajectory. The first item is the start point
   * of the trajectory and it must have no additional control points.
   */
  points: TrajectorySegment[];

  /**
   * The takeoff time of the drone in seconds; zero if missing. Timestamps in
   * the trajectory segments are relative to the takeoff time.
   */
  takeoffTime?: number;

  /** The landing time of the drone in seconds */
  landingTime?: number;
}

/**
 * The light program of a single drone
 */
export interface LightProgram {
  /** The version of the light program format */
  version: number;

  /** Light program as ledctrl bytecode, encoded as a base64 string */
  data: string;
}

/**
 * A single segment in the yaw control definition of a drone.
 *
 * The first item of this tuple is the timestamp of the target rotation of the
 * segment. The second is the yaw value itself, in degrees. The start point is
 * inferred from the value of the previous segment in a segment array.
 */
export type YawControlSegment = [number, number];

/**
 * The yaw control definition of a single drone
 */
export interface YawControl {
  /** The version of the yaw control format */
  version: number;

  /**
   * The list of segments in the yaw control.
   * The first item is the starting rotation of the yaw control.
   */
  setpoints: YawControlSegment[];

  /**
   * Whether to change yaw automatically based
   * on the momentary direction of motion
   */
  autoYaw?: boolean;

  /**
   * The yaw offset to use relative to front when in auto-yaw mode, in degrees
   */
  autoYawOffset?: number;
}
