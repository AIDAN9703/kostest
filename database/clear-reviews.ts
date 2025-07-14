import { db } from './db';
import { reviews } from './schema';

async function clearReviews() {
  try {
    console.log('🗑️  Clearing all reviews...');
    
    const result = await db.delete(reviews);
    
    console.log('✅ All reviews cleared successfully!');
    console.log(`Deleted all review records.`);
    
  } catch (error) {
    console.error('❌ Error clearing reviews:', error);
    throw error;
  }
}

// Run the function
clearReviews()
  .then(() => {
    console.log('🎉 Review clearing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Review clearing failed:', error);
    process.exit(1);
  }); 