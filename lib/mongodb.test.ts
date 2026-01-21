import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('connectDB', () => {
  let connectDB: () => Promise<typeof mongoose>;
  let originalEnv: NodeJS.ProcessEnv;
  let mockGlobal: any;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    
    // Reset modules to get a fresh instance
    jest.resetModules();
    
    // Clear mongoose mock
    jest.clearAllMocks();
    
    // Reset global mongoose cache
    mockGlobal = global as any;
    mockGlobal.mongoose = undefined;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Environment variable validation', () => {
    it('should throw an error if MONGODB_URI environment variable is not defined', () => {
      // Remove MONGODB_URI from environment
      delete process.env.MONGODB_URI;

      // Expect the module to throw when loaded without MONGODB_URI
      expect(() => {
        jest.isolateModules(() => {
          require('./mongodb');
        });
      }).toThrow('Please define the MONGODB_URI environment variable inside .env.local');
    });
  });

  describe('Connection management', () => {
    beforeEach(() => {
      // Set MONGODB_URI for connection tests
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
      
      // Import connectDB after setting env var
      jest.isolateModules(() => {
        connectDB = require('./mongodb').default;
      });
    });

    it('should return the existing mongoose connection if already connected', async () => {
      const mockMongoose = { connection: { readyState: 1 } } as any;
      
      // Mock successful connection
      (mongoose.connect as jest.Mock).mockResolvedValueOnce(mockMongoose);

      // First call - establishes connection
      const firstConnection = await connectDB();
      
      // Second call - should return cached connection
      const secondConnection = await connectDB();

      // Should return the same connection
      expect(firstConnection).toBe(secondConnection);
      
      // mongoose.connect should only be called once
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });

    it('should create a new mongoose connection if one does not exist', async () => {
      const mockMongoose = { connection: { readyState: 1 } } as any;
      
      // Mock successful connection
      (mongoose.connect as jest.Mock).mockResolvedValueOnce(mockMongoose);

      // Call connectDB
      const connection = await connectDB();

      // Should have called mongoose.connect with correct parameters
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/test',
        { bufferCommands: false }
      );
      
      // Should return the connection
      expect(connection).toBe(mockMongoose);
    });

    it('should throw an error and reset the cached promise when connection fails', async () => {
      const connectionError = new Error('Connection failed');
      
      // Mock failed connection
      (mongoose.connect as jest.Mock).mockRejectedValueOnce(connectionError);

      // First call - should fail
      await expect(connectDB()).rejects.toThrow('Connection failed');

      // Mock successful connection for retry
      const mockMongoose = { connection: { readyState: 1 } } as any;
      (mongoose.connect as jest.Mock).mockResolvedValueOnce(mockMongoose);

      // Second call - should retry and succeed
      const connection = await connectDB();

      // Should have called mongoose.connect twice (once failed, once succeeded)
      expect(mongoose.connect).toHaveBeenCalledTimes(2);
      
      // Should return the connection after retry
      expect(connection).toBe(mockMongoose);
    });

    it('should cache the connection promise to prevent multiple connections during development hot reloads', async () => {
      const mockMongoose = { connection: { readyState: 1 } } as any;
      
      // Mock a delayed connection to simulate real-world async behavior
      let resolveConnection: (value: any) => void;
      const connectionPromise = new Promise((resolve) => {
        resolveConnection = resolve;
      });
      
      (mongoose.connect as jest.Mock).mockReturnValueOnce(connectionPromise);

      // Start multiple concurrent connections
      const promise1 = connectDB();
      const promise2 = connectDB();
      const promise3 = connectDB();

      // Resolve the connection
      resolveConnection!(mockMongoose);

      // Wait for all promises
      const [conn1, conn2, conn3] = await Promise.all([promise1, promise2, promise3]);

      // All should return the same connection
      expect(conn1).toBe(mockMongoose);
      expect(conn2).toBe(mockMongoose);
      expect(conn3).toBe(mockMongoose);
      
      // mongoose.connect should only be called once despite multiple concurrent calls
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });
  });
});
