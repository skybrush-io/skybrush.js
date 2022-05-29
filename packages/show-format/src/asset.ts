/**
 * Class whose instances are placeholders for binary assets that were <em>not</em>
 * loaded during the parsing of a show file.
 */
class Asset {
  /** Filename of the asset */
  filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }
}

export default Asset;
