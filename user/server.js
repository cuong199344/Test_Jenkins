import app from "./app.js";

import dbConnection from "./dbConfig/dbConnection.js";

// MONGODB CONNECTION
dbConnection();
// Test 4

const PORT = process.env.PORT || 8800;

const server = app.listen(PORT, () => {
  console.log("testing");
  console.log(`Dev Server running on port test!!! (12/5/2024): ${PORT}`);
});

export default server;
