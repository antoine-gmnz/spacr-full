/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const RoverImagesController = () => import('#controllers/rover-images.controller')
const SpaceTelescopeImagesController = () =>
  import('#controllers/space-telescope-images-scraping.controller')
const NasaRoverScrapingController = () => import('#controllers/nasa-rover-scraping.controller')
const NasaRssApiController = () => import('#controllers/nasa-rss-api.controller')
const ApodController = () => import('#controllers/apod.controller')
const RoverController = () => import('#controllers/rover.controller')
const ESASpaceTelescopeImageController = () =>
  import('#controllers/space_telescope_image.controller')
const LaunchesController = () => import('#controllers/launches.controller')
const AuroraController = () => import('#controllers/aurora.controller')
const SpaceExplorerController = () => import('#controllers/space-explorer.controller')

// Optimized API routes
router
  .group(() => {
    // Rover images
    router.get('/rover-image/search', [RoverImagesController, 'searchImages'])
    router.get('rover-image', [RoverImagesController, 'getImages'])
    router.get('/rover-image/latest', [RoverImagesController, 'getLatestRoverImages'])

    // ESA telescope images
    router.get('/esa-images', [ESASpaceTelescopeImageController, 'getImages'])
    router.get('/esa-images/search', [ESASpaceTelescopeImageController, 'searchImages'])

    // ESA scraping endpoints
    router.post('/esa-scraping/start-initial', [
      SpaceTelescopeImagesController,
      'startInitialScraping',
    ])
    router.post('/esa-scraping/trigger-update', [SpaceTelescopeImagesController, 'triggerUpdate'])
    router.get('/esa-scraping/status', [SpaceTelescopeImagesController, 'getScrapingStatus'])
    router.get('/esa-scraping/stats', [SpaceTelescopeImagesController, 'getScrapingStats'])

    // NASA rover scraping endpoints
    router.post('/nasa/rover-scraping/start', [NasaRoverScrapingController, 'startScraping'])

    // NASA RSS API endpoints
    router.post('/nasa/rss/start-extraction', [NasaRssApiController, 'startExtraction'])
    router.get('/nasa/rss/feed-page', [NasaRssApiController, 'getFeedPage'])
    router.get('/nasa/rss/stats', [NasaRssApiController, 'getExtractionStats'])

    // APOD endpoints
    router.get('/apod', [ApodController, 'getApod'])

    // Rover endpoints
    router.get('/rovers', [RoverController, 'getRovers'])

    // Launches endpoints
    router.get('/launches', [LaunchesController, 'getLaunches'])
    router.get('/launches/upcoming', [LaunchesController, 'getUpcomingLaunches'])
    router.get('/launches/search', [LaunchesController, 'searchLaunches'])

    // Aurora endpoints
    router.get('/aurora', [AuroraController, 'getAuroraData'])
    router.get('/aurora/visibility', [AuroraController, 'getVisibility'])

    // Space Explorer endpoints
    router.get('/space-explorer/positions', [SpaceExplorerController, 'getPositions'])
    router.get('/space-explorer/body/:name', [SpaceExplorerController, 'getBody'])
  })
  .prefix('/api/v1')
