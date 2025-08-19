#!/usr/bin/env node

/**
 * Test script for ESA scraping implementation (without jobs)
 * Run with: node test_esa_scraping.js
 */

import { ESAScrapingService } from './app/services/esa_scraping_service.js'

async function testESAScraping() {
  console.log('🚀 Testing ESA Scraping Service (Direct Execution)...')
  
  const scrapingService = new ESAScrapingService()
  
  try {
    console.log('📡 Testing light update (recent pages only)...')
    await scrapingService.performLightUpdate()
    console.log('✅ Light update test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
testESAScraping()
  .then(() => {
    console.log('🎉 Test completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })
