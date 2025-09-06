# API Endpoint Verification Procedures

**Status**: ✅ **SYSTEMATIC TESTING FRAMEWORK** - Comprehensive validation approach  
**Last Updated**: 2025-09-05  
**Testing Script**: `scripts/comprehensive-endpoint-test.js`  
**Automation Level**: Fully automated with detailed reporting

## 🧪 **Testing Framework Overview**

### Comprehensive Testing Script

**Location**: `scripts/comprehensive-endpoint-test.js`  
**Features**:

- **34 endpoint definitions** with request body examples
- **Automated retry logic** (3 attempts per endpoint)
- **Performance measurement** (response time tracking)
- **Categorized testing** (system, brand-packs, design, etc.)
- **Detailed reporting** (JSON + Markdown output)
- **Error categorization** (404, 500, 400, timeout)

### Test Execution

```bash
# Run comprehensive endpoint testing
cd D:\Projects\Tools\Designs
node scripts/comprehensive-endpoint-test.js

# Output locations:
# reports/endpoint-testing/comprehensive-test-results.json
# reports/endpoint-testing/test-summary.md
```

## 📋 **Testing Categories & Methodology**

### 1. System Health Endpoints

**Purpose**: Verify core system functionality  
**Endpoints**: 2 endpoints  
**Success Rate**: 100% (Perfect)

```bash
# Manual verification
curl http://localhost:3001/api/health
curl http://localhost:3001/api/context
```

### 2. Brand Pack Management

**Purpose**: Test data layer operations  
**Endpoints**: 3 endpoints (1 skipped for file upload)  
**Success Rate**: 100% (Perfect)

```bash
# Manual verification
curl http://localhost:3001/api/brand-packs
curl -X POST http://localhost:3001/api/brand-packs \
  -H "Content-Type: application/json" \
  -d '{"id": "test-brand", "name": "Test Brand", "version": "1.0.0"}'
```

### 3. Design Enhancement

**Purpose**: Test CSS transformation capabilities  
**Endpoints**: 4 endpoints  
**Success Rate**: 75% (3/4 working)

```bash
# Working endpoints
curl -X POST http://localhost:3001/api/design/enhance \
  -H "Content-Type: application/json" \
  -d '{"code": ".btn { color: red; }", "projectPath": "/test"}'

curl -X POST http://localhost:3001/api/design/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": ".btn { color: red; }"}'

# Failing endpoint (500 error)
curl -X POST http://localhost:3001/api/design/enhance-cached \
  -H "Content-Type: application/json" \
  -d '{"code": ".btn { color: red; }", "signature": "test-123"}'
```

### 4. Semantic Analysis

**Purpose**: Test accessibility and HTML analysis  
**Endpoints**: 4 endpoints  
**Success Rate**: 100% (Perfect)

```bash
# All working - excellent category
curl -X POST http://localhost:3001/api/semantic/analyze-accessibility \
  -H "Content-Type: application/json" \
  -d '{"html": "<button>Click me</button>", "projectPath": "/test"}'

curl -X POST http://localhost:3001/api/semantic/detect-component-type \
  -H "Content-Type: application/json" \
  -d '{"html": "<button class=\"btn\">Submit</button>"}'
```

### 5. Layout Intelligence

**Purpose**: Test layout analysis capabilities  
**Endpoints**: 5 endpoints  
**Success Rate**: 40% (2/5 working)

```bash
# Working endpoints
curl -X POST http://localhost:3001/api/layout/analyze \
  -H "Content-Type: application/json" \
  -d '{"html": "<div><h1>Title</h1></div>", "css": "div { padding: 20px; }"}'

curl -X POST http://localhost:3001/api/layout/grid-recommendations \
  -H "Content-Type: application/json" \
  -d '{"requirements": {"columns": 12, "responsive": true}}'
```

### 6. Visual Analysis System

**Purpose**: Test screenshot and AI vision capabilities  
**Endpoints**: 6 endpoints  
**Success Rate**: 50% (3/6 working)

```bash
# Working endpoints
curl http://localhost:3001/api/visual/health
curl http://localhost:3001/api/visual/stats
curl -X POST http://localhost:3001/api/visual/maintenance \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup"}'

# Failing core endpoints (500 errors)
curl -X POST http://localhost:3001/api/visual/analyze \
  -H "Content-Type: application/json" \
  -d '{"html": "<div>test</div>"}'
```

## 📊 **Test Results Analysis**

### Current Status (2025-09-05)

- **Total Endpoints Tested**: 34
- **Working**: 17 (50% success rate)
- **Failed**: 16 (47% failure rate)
- **Skipped**: 1 (3% - file upload)

### Performance Metrics

- **Average Response Time**: 15ms (working endpoints)
- **Fastest Category**: Design analysis (2ms)
- **Slowest Category**: Semantic batch analysis (46ms)
- **Timeout Issues**: Visual validation (30+ seconds)

### Error Distribution

- **404 Not Found**: 8 endpoints (routes not implemented)
- **500 Server Error**: 4 endpoints (implementation bugs)
- **400 Bad Request**: 2 endpoints (validation issues)
- **Timeouts**: 1 endpoint (performance issue)

## 🔧 **Testing Best Practices**

### Before Testing Any Endpoint

1. **Verify Server Running**: Check `http://localhost:3001/api/health`
2. **Check Dependencies**: Redis, MongoDB, API keys configured
3. **Review Logs**: Clear any previous errors
4. **Set Expectations**: Use previous test results as baseline

### During Testing

1. **Monitor Response Times**: Flag anything >1000ms as concerning
2. **Check Status Codes**: 200-299 success, others require investigation
3. **Validate Response Format**: Ensure JSON structure matches expectations
4. **Log Failures**: Capture exact error messages and request details

### After Testing

1. **Update Documentation**: Reflect actual status in docs/app/
2. **Track Changes**: Note any status changes from previous tests
3. **Report Issues**: Document new failures or improvements
4. **Performance Analysis**: Compare response times over time

## 🛠️ **Manual Testing Procedures**

### Quick Health Check Sequence

```bash
# 1. System health
curl http://localhost:3001/api/health

# 2. Brand pack data layer
curl http://localhost:3001/api/brand-packs

# 3. Basic design enhancement
curl -X POST http://localhost:3001/api/design/enhance \
  -H "Content-Type: application/json" \
  -d '{"code": ".test { color: red; }", "projectPath": "/test"}'

# 4. Semantic analysis
curl -X POST http://localhost:3001/api/semantic/analyze-accessibility \
  -H "Content-Type: application/json" \
  -d '{"html": "<button>Test</button>", "projectPath": "/test"}'

# 5. Visual system health
curl http://localhost:3001/api/visual/health
```

### Individual Endpoint Testing Template

```bash
#!/bin/bash
# Template for testing individual endpoints

ENDPOINT="http://localhost:3001/api/[endpoint-path]"
METHOD="POST"  # or GET
BODY='{"key": "value"}'

echo "Testing: $METHOD $ENDPOINT"
echo "Request Body: $BODY"
echo "---"

RESPONSE=$(curl -X $METHOD "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$BODY" \
  -w "Status: %{http_code}, Time: %{time_total}s\n" \
  --silent)

echo "Response: $RESPONSE"
echo "==="
```

### Performance Testing

```bash
# Test endpoint performance under load
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/design/enhance \
    -H "Content-Type: application/json" \
    -d '{"code": ".test { color: red; }"}' \
    -w "Request $i: %{time_total}s\n" \
    --silent --output /dev/null
done
```

## 📈 **Automated Monitoring**

### Daily Endpoint Health Check

Create a cron job or scheduled task:

```bash
# Daily at 9 AM
0 9 * * * cd /path/to/project && node scripts/comprehensive-endpoint-test.js > logs/daily-endpoint-check.log 2>&1
```

### Continuous Integration Testing

```yaml
# Example CI configuration
name: API Endpoint Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: pnpm install
      - name: Start services
        run: |
          # Start Redis, MongoDB
          PORT=3001 node apps/server/index.js &
          sleep 10
      - name: Run endpoint tests
        run: node scripts/comprehensive-endpoint-test.js
      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: endpoint-test-results
          path: reports/endpoint-testing/
```

## 📋 **Testing Checklist**

### Pre-Test Requirements ✅

- [ ] Server running on port 3001
- [ ] Redis container active in Docker Desktop
- [ ] MongoDB service running on localhost:27017
- [ ] API keys configured in .env file
- [ ] Previous test reports backed up

### Test Execution ✅

- [ ] Run comprehensive testing script
- [ ] Monitor console output for failures
- [ ] Check response times for performance issues
- [ ] Verify test reports generated

### Post-Test Actions ✅

- [ ] Review test summary for changes
- [ ] Update docs/app/api/verified-endpoints.md
- [ ] Document any new failures in issues/
- [ ] Share results with development team

## 🎯 **Success Criteria**

### Minimum Acceptable Standards

- **Core System Health**: 100% (non-negotiable)
- **Brand Pack Management**: 100% (critical for functionality)
- **Basic Design Enhancement**: 75%+ (core feature)
- **Overall Success Rate**: 60%+ (realistic target)

### Performance Standards

- **System Health**: <50ms
- **Data Operations**: <100ms
- **Design Enhancement**: <200ms
- **AI Operations**: <30s (visual analysis)

### Quality Gates

- **No Timeouts**: All endpoints respond within reasonable time
- **Consistent Errors**: 500 errors investigated and fixed
- **Documentation Accuracy**: Docs reflect actual endpoint status

---

**Testing Status**: ✅ **Comprehensive automated testing framework operational**  
**Frequency**: Run before any documentation updates  
**Reliability**: Automated retry logic with detailed error reporting  
**Integration**: Results feed directly into evidence-based documentation
