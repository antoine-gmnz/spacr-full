# Background Tasks Implementation with AdonisJS Jobs

## Overview

This document outlines the implementation plan for migrating heavy background tasks from NestJS to AdonisJS using the `adonisjs-jobs` package (BullMQ integration). The solution handles:

- **Heavy initial task**: Multi-hour data scraping operation
- **Light recurring tasks**: Quick updates every few minutes
- **Database integration**: Full access to PostgreSQL via Lucid ORM
- **Production deployment**: Scalable worker processes

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AdonisJS Web  │    │  Redis Queue    │    │ Worker Process  │
│     Server      │───▶│    (BullMQ)     │───▶│   (Jobs)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │                                              │
         ▼                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│                      (Lucid ORM)                               │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Setup and Configuration

#### 1.1 Install Dependencies
```bash
cd apps/backend
npm install adonisjs-jobs ioredis
node ace configure adonisjs-jobs
```

#### 1.2 Environment Configuration
Add to `.env`:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Job Queue Configuration
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=
```

#### 1.3 Update adonisrc.ts
Add jobs provider:
```typescript
providers: [
  // ... existing providers
  () => import('adonisjs-jobs/build/providers/jobs_provider')
]
```

### Phase 2: Core Services Implementation

#### 2.1 Base Scraping Service
Create `app/services/scraping_service.ts`:
```typescript
import logger from '@adonisjs/core/services/logger'
import RoverImage from '#models/rover_image'
import ESASpaceTelescopeImage from '#models/ESASpaceTelescopeImage'
import puppeteer, { Browser, Page } from 'puppeteer'

export default class ScrapingService {
  private browser: Browser | null = null

  /**
   * Heavy initial scraping - can run for hours
   */
  async performInitialHeavyScraping(): Promise<void> {
    logger.info('Starting heavy initial scraping task...')
    
    try {
      await this.initBrowser()
      
      // Port logic from NestJS scraping services
      const roverData = await this.scrapeAllRoverImages()
      const telescopeData = await this.scrapeAllTelescopeImages()
      
      // Batch save to database
      await this.batchSaveRoverImages(roverData)
      await this.batchSaveTelescopeImages(telescopeData)
      
      logger.info(`Initial scraping completed: ${roverData.length + telescopeData.length} items processed`)
      
    } finally {
      await this.closeBrowser()
    }
  }

  /**
   * Light recurring update - should complete in minutes
   */
  async performLightUpdate(): Promise<void> {
    logger.info('Running light update task...')
    
    try {
      await this.initBrowser()
      
      // Scrape only recent updates
      const recentRoverData = await this.scrapeRecentRoverImages()
      const recentTelescopeData = await this.scrapeRecentTelescopeImages()
      
      // Save recent data
      await this.saveRecentRoverImages(recentRoverData)
      await this.saveRecentTelescopeImages(recentTelescopeData)
      
      logger.info(`Light update completed: ${recentRoverData.length + recentTelescopeData.length} new items`)
      
    } finally {
      await this.closeBrowser()
    }
  }

  private async initBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  // TODO: Port from NestJS services
  private async scrapeAllRoverImages(): Promise<any[]> {
    // Implementation from apps/back/src/scrapper/services/perseveranceScrapping.service.ts
    return []
  }

  private async scrapeAllTelescopeImages(): Promise<any[]> {
    // Implementation from apps/back/src/scrapper/services/jwstScrapping.service.ts
    // Implementation from apps/back/src/scrapper/services/hubbleScrapping.service.ts
    return []
  }

  private async scrapeRecentRoverImages(): Promise<any[]> {
    // Light version - only recent data
    return []
  }

  private async scrapeRecentTelescopeImages(): Promise<any[]> {
    // Light version - only recent data
    return []
  }

  private async batchSaveRoverImages(data: any[]): Promise<void> {
    if (data.length > 0) {
      await RoverImage.createMany(data)
    }
  }

  private async batchSaveTelescopeImages(data: any[]): Promise<void> {
    if (data.length > 0) {
      await ESASpaceTelescopeImage.createMany(data)
    }
  }

  private async saveRecentRoverImages(data: any[]): Promise<void> {
    for (const item of data) {
      await RoverImage.updateOrCreate(
        { img_src: item.img_src }, // Unique constraint
        item
      )
    }
  }

  private async saveRecentTelescopeImages(data: any[]): Promise<void> {
    for (const item of data) {
      await ESASpaceTelescopeImage.updateOrCreate(
        { esa_id: item.esa_id }, // Unique constraint
        item
      )
    }
  }
}
```

#### 2.2 Job Classes
Create `app/jobs/scraping_job.ts`:
```typescript
import { Job } from 'adonisjs-jobs'
import logger from '@adonisjs/core/services/logger'
import ScrapingService from '#services/scraping_service'

export default class ScrapingJob extends Job {
  static get $$filepath() {
    return import.meta.url
  }

  /**
   * Job payload preparation
   */
  async prepare(payload: { 
    taskType: 'initial' | 'update'
    source?: 'rover' | 'telescope' | 'all'
  }) {
    this.payload = payload
  }

  /**
   * Job execution handler
   */
  async handle() {
    const scrapingService = new ScrapingService()
    
    try {
      if (this.payload.taskType === 'initial') {
        logger.info('Executing heavy initial scraping job...')
        await scrapingService.performInitialHeavyScraping()
        
        // Schedule recurring light tasks after initial completion
        await this.scheduleRecurringTasks()
        
      } else if (this.payload.taskType === 'update') {
        logger.info('Executing light update job...')
        await scrapingService.performLightUpdate()
      }
      
      logger.info(`Scraping job completed successfully: ${this.payload.taskType}`)
      
    } catch (error) {
      logger.error(`Scraping job failed: ${this.payload.taskType}`, error)
      throw error
    }
  }

  /**
   * Schedule recurring light update tasks
   */
  private async scheduleRecurringTasks() {
    logger.info('Scheduling recurring light update tasks...')
    
    await ScrapingJob.dispatch(
      { taskType: 'update' },
      { 
        repeat: { 
          pattern: '*/5 * * * *' // Every 5 minutes
        },
        jobId: 'recurring-light-scraping',
        removeOnComplete: 10,
        removeOnFail: 5
      }
    )
  }

  /**
   * Job failure handler
   */
  async rescue(error: Error) {
    logger.error('Scraping job rescue handler triggered', {
      payload: this.payload,
      error: error.message,
      stack: error.stack
    })
    
    // Implement retry logic or notification system
    // Could send alerts, log to external service, etc.
  }
}
```

### Phase 3: API Controllers

#### 3.1 Scraping Controller
Create `app/controllers/scraping_controller.ts`:
```typescript
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ScrapingJob from '#jobs/scraping_job'
import logger from '@adonisjs/core/services/logger'

export default class ScrapingController {
  /**
   * Trigger initial heavy scraping task
   */
  @inject()
  async startInitialScraping({ response }: HttpContext) {
    try {
      const job = await ScrapingJob.dispatch(
        { taskType: 'initial' },
        {
          attempts: 3,
          backoff: 'exponential',
          removeOnComplete: 5,
          removeOnFail: 3
        }
      )
      
      logger.info(`Initial scraping job queued: ${job.id}`)
      
      return response.json({
        success: true,
        message: 'Heavy scraping task queued successfully',
        jobId: job.id,
        status: 'queued'
      })
      
    } catch (error) {
      logger.error('Failed to queue initial scraping job', error)
      
      return response.status(500).json({
        success: false,
        message: 'Failed to queue scraping task',
        error: error.message
      })
    }
  }

  /**
   * Trigger immediate light update
   */
  @inject()
  async triggerUpdate({ response }: HttpContext) {
    try {
      const job = await ScrapingJob.dispatch(
        { taskType: 'update' },
        {
          attempts: 2,
          removeOnComplete: 10
        }
      )
      
      logger.info(`Update job queued: ${job.id}`)
      
      return response.json({
        success: true,
        message: 'Update task queued successfully',
        jobId: job.id,
        status: 'queued'
      })
      
    } catch (error) {
      logger.error('Failed to queue update job', error)
      
      return response.status(500).json({
        success: false,
        message: 'Failed to queue update task',
        error: error.message
      })
    }
  }

  /**
   * Get job status
   */
  @inject()
  async getJobStatus({ params, response }: HttpContext) {
    try {
      const { jobId } = params
      
      // Implementation depends on adonisjs-jobs API
      // This is a placeholder for job status checking
      
      return response.json({
        success: true,
        jobId,
        status: 'active', // or 'completed', 'failed', 'waiting'
        progress: 75
      })
      
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Job not found',
        error: error.message
      })
    }
  }
}
```

#### 3.2 Routes Configuration
Update `start/routes.ts`:
```typescript
import router from '@adonisjs/core/services/router'

// Existing routes...

// Scraping routes
router.group(() => {
  router.post('/scraping/start-initial', 'scraping_controller.startInitialScraping')
  router.post('/scraping/trigger-update', 'scraping_controller.triggerUpdate')
  router.get('/scraping/job/:jobId/status', 'scraping_controller.getJobStatus')
}).prefix('/api/v1')
```

### Phase 4: Migration from NestJS

#### 4.1 Data Migration Checklist
- [ ] Port Puppeteer browser service from `apps/back/src/scrapper/services/browser.service.ts`
- [ ] Migrate Perseverance scraping logic from `apps/back/src/scrapper/services/perseveranceScrapping.service.ts`
- [ ] Migrate JWST scraping logic from `apps/back/src/scrapper/services/jwstScrapping.service.ts`
- [ ] Migrate Hubble scraping logic from `apps/back/src/scrapper/services/hubbleScrapping.service.ts`
- [ ] Update database models to match Lucid ORM patterns
- [ ] Replace Prisma calls with Lucid ORM equivalents

#### 4.2 Database Schema Updates
Ensure models match existing Prisma schema:
- `RoverImage` model (apps/backend/app/models/rover_image.ts)
- `ESASpaceTelescopeImage` model (apps/backend/app/models/ESASpaceTelescopeImage.ts)
- `Rover` model (apps/backend/app/models/rover.ts)

### Phase 5: Production Deployment

#### 5.1 Docker Configuration
Update `docker-compose.yaml`:
```yaml
version: '3.8'
services:
  web:
    build: ./apps/backend
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  worker:
    build: ./apps/backend
    command: node ace jobs:listen
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    deploy:
      replicas: 2

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    # Existing postgres configuration

volumes:
  redis_data:
  # Existing volumes
```

#### 5.2 Environment Variables
Production `.env` additions:
```env
# Job Queue Configuration
REDIS_HOST=redis
REDIS_PORT=6379
QUEUE_REDIS_HOST=redis
QUEUE_REDIS_PORT=6379

# Job Settings
JOB_ATTEMPTS=3
JOB_BACKOFF=exponential
JOB_REMOVE_ON_COMPLETE=10
JOB_REMOVE_ON_FAIL=5
```

### Phase 6: Monitoring and Maintenance

#### 6.1 Job Monitoring
- Use BullMQ Dashboard for job monitoring
- Implement custom logging for job progress
- Set up alerts for job failures

#### 6.2 Performance Optimization
- Configure job concurrency based on server resources
- Implement job prioritization
- Add job progress tracking for long-running tasks

#### 6.3 Error Handling
- Implement comprehensive error logging
- Set up job retry mechanisms
- Create dead letter queue handling

## Commands Reference

### Development
```bash
# Start development server
npm run dev

# Start job worker
node ace jobs:listen

# Clear all jobs
node ace jobs:clear

# Monitor jobs
node ace jobs:monitor
```

### Production
```bash
# Build application
npm run build

# Start production server
npm run start

# Start job workers
node ace jobs:listen --workers=4
```

## Testing Strategy

### Unit Tests
- Test scraping service methods
- Test job execution logic
- Test database operations

### Integration Tests
- Test complete job workflow
- Test API endpoints
- Test error scenarios

### Load Testing
- Test heavy job performance
- Test concurrent job execution
- Test database performance under load

## Security Considerations

- Validate job payloads
- Implement rate limiting for job creation
- Secure Redis connection
- Monitor resource usage
- Implement job timeouts

## Future Enhancements

- [ ] Add job progress tracking UI
- [ ] Implement job scheduling dashboard
- [ ] Add metrics and analytics
- [ ] Implement job result caching
- [ ] Add support for job chaining
- [ ] Implement job priority queues

---

## Migration Timeline

1. **Week 1**: Setup and basic job infrastructure
2. **Week 2**: Port scraping services from NestJS
3. **Week 3**: Implement controllers and API endpoints
4. **Week 4**: Production deployment and monitoring setup
5. **Week 5**: Testing and optimization

---

*This document will be updated as implementation progresses.*
