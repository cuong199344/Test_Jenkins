
module.exports ={
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./test/setup.js"],
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};