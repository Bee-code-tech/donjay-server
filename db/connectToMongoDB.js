import mongoose from "mongoose";

// check if i changed anything from the previous code
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🎯 MongoDB Connected`);

    // Clean up any problematic indexes (one-time cleanup)
    try {
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      const indexes = await usersCollection.indexes();

      console.log('Current indexes:', indexes.map(idx => idx.name));

      // Drop any username-related indexes
      const problematicIndexes = indexes.filter(index =>
        index.name.includes('username') ||
        (index.name !== '_id_' && index.name !== 'name_1')
      );

      for (const index of problematicIndexes) {
        try {
          await usersCollection.dropIndex(index.name);
          console.log(`✅ Dropped problematic index: ${index.name}`);
        } catch (dropError) {
          console.log(`Could not drop index ${index.name}:`, dropError.message);
        }
      }

      // Ensure the correct index exists
      try {
        await usersCollection.createIndex({ name: 1 }, { unique: true, name: 'name_1' });
        console.log('✅ Created name_1 index');
      } catch (createError) {
        if (!createError.message.includes('already exists')) {
          console.log('Index creation info:', createError.message);
        }
      }

    } catch (indexError) {
      console.log('Index cleanup skipped:', indexError.message);
    }

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;
