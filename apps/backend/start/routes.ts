/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const RoverImageController = () => import('#controllers/rover_image')
const OptimizedImagesController = () => import('#controllers/optimized_images_controller')
const ESAScrapingController = () => import('#controllers/esa_scraping_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Legacy routes (keep for backward compatibility)
router.get('rover_image/search', [RoverImageController, 'searchImages'])
router.get('rover_image', [RoverImageController, 'getImages'])

// Optimized API routes
router.group(() => {
  // Rover images
  router.get('/rover-images', [OptimizedImagesController, 'getRoverImages'])
  router.get('/rover-images/search', [OptimizedImagesController, 'searchRoverImages'])
  router.get('/rover-images/:id', [OptimizedImagesController, 'getRoverImage'])
  
  // ESA telescope images
  router.get('/esa-images', [OptimizedImagesController, 'getEsaImages'])
  router.get('/esa-images/search', [OptimizedImagesController, 'searchEsaImages'])
  router.get('/esa-images/:id', [OptimizedImagesController, 'getEsaImage'])
  
  // Lookup data
  router.get('/cameras', [OptimizedImagesController, 'getCameras'])
  router.get('/constellations', [OptimizedImagesController, 'getConstellations'])
  
  // Statistics and analytics
  router.get('/stats', [OptimizedImagesController, 'getStats'])
  router.get('/storage-savings', [OptimizedImagesController, 'getStorageSavings'])
  
  // Data management (admin endpoints)
  router.post('/migrate-data', [OptimizedImagesController, 'migrateData'])
  router.get('/validate-integrity', [OptimizedImagesController, 'validateDataIntegrity'])
  
  // ESA scraping endpoints
  router.post('/esa-scraping/start-initial', [ESAScrapingController, 'startInitialScraping'])
  router.post('/esa-scraping/trigger-update', [ESAScrapingController, 'triggerUpdate'])
  router.get('/esa-scraping/status', [ESAScrapingController, 'getScrapingStatus'])
  router.get('/esa-scraping/stats', [ESAScrapingController, 'getScrapingStats'])
}).prefix('/api/v1')
