// ============================================================
// Human Library Configuration — 12 models
// ============================================================

let human = null;

const humanConfig = {
  backend: 'webgl',
  debug: false,
  modelBasePath: './models/',

  face: {
    enabled: true,
    detector: {
      rotation: true,
      maxDetected: 1,
      minConfidence: 0.3,
      return: true
    },
    mesh: {
      enabled: true,
      return: true
    },
    iris: {
      enabled: true,
      return: true
    },
    description: {
      enabled: true,
      return: true
    },
    antispoof: {
      enabled: true,
      return: true
    },
    liveness: {
      enabled: true,
      return: true
    },
    emotion: { enabled: false },
    gear: { enabled: false }
  },

  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },

  filter: { enabled: true },
  cacheSensitivity: 0.7
};