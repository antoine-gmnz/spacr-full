# Redis Database Configuration Guide

## 🗄️ **Redis Database Numbers (0-15)**

Redis supports 16 databases by default. Here are the recommended assignments:

### **Recommended Configuration:**

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0                    # Default database for general use
REDIS_CACHE_DB=1              # Database for application caching
REDIS_SESSION_DB=2            # Database for session storage
REDIS_PREFIX=

# Job Queue Configuration
QUEUE_CONNECTION=redis
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=
QUEUE_REDIS_DB=3              # Database for job queues (BullMQ)
```

## 📊 **Database Usage Breakdown:**

| Database | Purpose | Usage |
|----------|---------|-------|
| **0** | Default/General | General Redis operations, fallback |
| **1** | Application Cache | API response caching, query results |
| **2** | Session Storage | User sessions, authentication tokens |
| **3** | Job Queues | ESA scraping jobs, BullMQ queues |
| **4-15** | Reserved | Future use, other services |

## 🚀 **Why This Separation?**

### **1. Isolation**
- **Job queues** won't interfere with **caching**
- **Sessions** are separate from **application data**
- **Easy monitoring** per database

### **2. Performance**
- **Smaller datasets** per database = faster operations
- **Targeted cleanup** (e.g., clear cache without affecting jobs)
- **Better memory management**

### **3. Monitoring**
- **Track usage** per database
- **Identify bottlenecks** (e.g., cache vs jobs)
- **Selective backups**

## 🔧 **Quick Setup:**

### **Option 1: Copy to your .env file**
```bash
# Add these to your apps/backend/.env file
REDIS_DB=0
REDIS_CACHE_DB=1
REDIS_SESSION_DB=2
QUEUE_REDIS_DB=3
```

### **Option 2: Use defaults (if not specified)**
The configuration files already have sensible defaults:
- `REDIS_DB=0` (default)
- `REDIS_CACHE_DB=1` (default)
- `REDIS_SESSION_DB=2` (default)
- `QUEUE_REDIS_DB=3` (default)

## 📈 **Monitoring Your Databases:**

### **Via Redis Commander (http://localhost:8082):**
1. Open Redis Commander
2. Switch between databases using the dropdown
3. Monitor key counts and memory usage per database

### **Via Redis CLI:**
```bash
# Connect to Redis
docker exec -it redis_container redis-cli

# Switch to database 3 (job queues)
SELECT 3

# Check key count
DBSIZE

# List all keys
KEYS *

# Switch to database 1 (cache)
SELECT 1

# Check cache usage
DBSIZE
```

## 🎯 **For ESA Scraping:**

The **QUEUE_REDIS_DB=3** will store:
- **Job queues**: ESA scraping tasks
- **Job data**: Scraping progress, results
- **Failed jobs**: Retry information
- **Job history**: Completed/failed job records

## 💡 **Pro Tips:**

1. **Start with these defaults** - they're well-tested
2. **Monitor usage** in Redis Commander
3. **Adjust if needed** based on your specific requirements
4. **Keep job queues separate** from other data for better reliability

---

*This configuration provides optimal separation of concerns and performance for your ESA scraping system.*
