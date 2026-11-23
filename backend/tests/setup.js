import { setupMockMongoose, resetMockDb } from "./mockDb.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_key_123456789";
process.env.PORT = "5001";

setupMockMongoose();

export { resetMockDb };
export default resetMockDb;
