import app from "./app.js";
import dbConnection from "./dbConfig/dbConnection.js";

// MONGODB CONNECTION
dbConnection();

const PORT = process.env.PORT || 8800;

const server = app.listen(PORT, () => {
  console.log(`Dev Server running on port: ${PORT}`);
});

export default server;
