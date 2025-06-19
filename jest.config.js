module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/db/seed.js', // Exclude seed file from coverage
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};