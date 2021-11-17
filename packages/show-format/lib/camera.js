function getCamerasFromShowSpecification(spec) {
  const cameras = spec?.environment?.cameras;

  if (cameras && !Array.isArray(cameras)) {
    throw new Error('environment.cameras must be an array');
  }

  return cameras || [];
}

module.exports = {
  getCamerasFromShowSpecification,
};
