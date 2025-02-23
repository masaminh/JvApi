module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverage: true,
  coveragePathIgnorePatterns: ['<rootDir>/src/wrapper/'],
  snapshotSerializers: ['<rootDir>/test/snapshot-plugin.ts'],
};
