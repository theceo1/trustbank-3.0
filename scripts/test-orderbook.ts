import dotenv from 'dotenv';
import { QuidaxClient } from '../app/lib/services/quidax-client';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testOrderBook() {
  try {
    console.log('Starting order book test...');
    
    const quidaxSecretKey = process.env.QUIDAX_SECRET_KEY;
    if (!quidaxSecretKey) {
      throw new Error('QUIDAX_SECRET_KEY is not set in .env.local');
    }
    
    const quidaxClient = new QuidaxClient(quidaxSecretKey);
    
    // Test with BTCNGN market
    const market = 'btcngn';
    console.log(`Fetching order book for ${market}...`);
    
    const orderBook = await quidaxClient.fetchOrderBook(market);
    
    console.log('\nOrder Book Data:');
    console.log('Asks (first 5):');
    console.log(orderBook.asks.slice(0, 5));
    
    console.log('\nBids (first 5):');
    console.log(orderBook.bids.slice(0, 5));
    
    // Verify data structure
    const firstAsk = orderBook.asks[0];
    const firstBid = orderBook.bids[0];
    
    console.log('\nVerifying data structure:');
    console.log('First Ask:', {
      price: firstAsk.price,
      volume: firstAsk.volume,
      total: firstAsk.total
    });
    
    console.log('First Bid:', {
      price: firstBid.price,
      volume: firstBid.volume,
      total: firstBid.total
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testOrderBook().catch(console.error); 