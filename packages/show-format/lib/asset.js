/**
 * Class whose instances are placeholders for binary assets that were <em>not</em>
 * loaded during the parsing of a show file.
 */
class Asset {
  constructor(filename) {
    this.filename = filename;
  }
}

module.exports = Asset;
