// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // si tus tests son de React, usar jsdom
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
