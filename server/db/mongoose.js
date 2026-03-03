import mongoose from 'mongoose';

// NOTE: dotenv must be loaded by the caller (server/index.js) BEFORE importing this module.
// Do NOT call dotenv.config() here – it would read a stale env snapshot.

const MONGO_URI = () => process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rfptrackerpro';

// Use a getter so the exported value is always live (not a snapshot)
const state = { connected: false };

export function isConnected() { return state.connected; }

export async function connectDB() {
    if (state.connected) return;

    const uri = MONGO_URI();
    console.log('🔌 Connecting to MongoDB:', uri.replace(/:\/\/[^@]+@/, '://***@'));

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,  // 10s timeout for Atlas
            socketTimeoutMS: 45000,
        });
        state.connected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        state.connected = false;
        console.error('❌ MongoDB connection failed:', err.message);
        console.warn('⚠  Running in demo mode (no DB). Set MONGODB_URI in server/.env to enable live data.');
    }
}
