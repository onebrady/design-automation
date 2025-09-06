/**
 * Test Optimized GPT-5 Prompts with XML Structure and Structured Output
 *
 * Tests the enhanced prompt engineering and JSON Schema validation
 * for improved response quality and reliability.
 */

const { VisualAnalysisManager } = require('./packages/visual-analysis');
require('dotenv').config();

// Test HTML with various design issues to test prompt effectiveness
const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design Analysis Test</title>
  <style>
    body {
      font-family: Arial;
      font-size: 12px; /* Too small */
      line-height: 1.2; /* Too tight */
      color: #666; /* Poor contrast */
      background: #fff;
      margin: 0;
      padding: 10px;
    }
    
    h1 {
      font-size: 16px; /* Too small for h1 */
      color: #999; /* Poor contrast */
      margin: 5px 0; /* Inconsistent spacing */
    }
    
    h2 {
      font-size: 14px; /* Too small for h2 */
      color: #777; /* Poor contrast */
      margin: 8px 0; /* Inconsistent spacing */
    }
    
    .button {
      background: #ddd;
      color: #666; /* Poor contrast */
      border: none;
      padding: 5px 10px; /* Too small touch target */
      font-size: 11px; /* Too small */
      margin: 3px; /* Inconsistent spacing */
    }
    
    .card {
      background: #f9f9f9;
      padding: 15px; /* Inconsistent with other spacing */
      margin: 7px 0; /* Random spacing value */
      border: 1px solid #eee;
    }
    
    input {
      font-size: 10px; /* Too small */
      padding: 3px; /* Too small touch target */
      border: 1px solid #ccc;
      margin: 2px; /* Inconsistent spacing */
    }
    
    .error {
      color: #ff6666; /* Using color only for error state */
      font-size: 11px;
    }
  </style>
</head>
<body>
  <h1>Main Heading</h1>
  <p>This design has multiple accessibility and design quality issues including poor contrast, inconsistent spacing, and small touch targets.</p>
  
  <h2>Secondary Heading</h2>
  <div class="card">
    <p>Card content with various design problems</p>
    <button class="button">Small Button</button>
    <button class="button">Another Button</button>
  </div>
  
  <form>
    <label>Email:</label>
    <input type="email" placeholder="Enter email">
    <div class="error">This field is required</div>
  </form>
  
  <div class="card">
    <h2>Another Section</h2>
    <p>More content to test spacing and typography issues</p>
    <button class="button">Action Button</button>
  </div>
</body>
</html>
`;

async function testOptimizedPrompts() {
  console.log('🧪 Testing GPT-5 Optimized Prompts with XML Structure\n');

  try {
    // Initialize visual analysis manager with optimized GPT-5 settings
    const visualAnalysisManager = new VisualAnalysisManager({
      screenshot: {
        viewport: { width: 1200, height: 800 },
        cleanup: { autoCleanup: true, maxAge: 60000 }, // 1 minute cleanup for testing
      },
      vision: {
        model: 'gpt-4-turbo', // Switch to GPT-4 Turbo for better analysis
        maxTokens: 4096,
        temperature: 0.1, // Maximum consistency
        top_p: 0.9, // Focused analysis
        frequency_penalty: 0.3, // Reduce repetitive feedback
        retryAttempts: 2,
      },
    });

    console.log('📊 Configuration:');
    console.log('- Model: GPT-4 Turbo with aggressive failure detection prompts');
    console.log('- Multi-pass analysis framework (Element → Violation → Scoring)');
    console.log('- Ruthless system auditor personality with hard thresholds');
    console.log('- Optimized parameters: temp=0.1, top_p=0.9, freq_penalty=0.3');
    console.log('- Expected: Much lower scores and specific violation detection\n');

    const startTime = Date.now();

    console.log('🔍 Starting comprehensive design analysis...\n');

    // Test the optimized comprehensive analysis
    const analysisResult = await visualAnalysisManager.analyzeCode(testHTML, {
      analysisType: 'comprehensive',
      designPrinciples: ['hierarchy', 'spacing', 'typography', 'color', 'accessibility', 'brand'],
      viewport: { width: 1200, height: 800 },
    });

    const duration = Date.now() - startTime;

    if (!analysisResult.success) {
      console.error('❌ Analysis failed:', analysisResult.error);
      return;
    }

    const analysis = analysisResult.analysis;

    console.log('✅ Analysis completed successfully!\n');
    console.log(`⏱️  Duration: ${duration}ms (${(duration / 1000).toFixed(1)}s)`);
    console.log(`📸 Screenshot: ${analysisResult.screenshot.id}`);
    console.log(`🎯 Analysis ID: ${analysisResult.analysisId}\n`);

    // Display results
    console.log('📈 DESIGN QUALITY SCORES:');
    console.log(`Overall Score: ${analysis.overallScore}/100`);
    console.log('Individual Scores:');
    Object.entries(analysis.designScores).forEach(([dimension, score]) => {
      const emoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
      console.log(`  ${emoji} ${dimension}: ${score}/100`);
    });

    console.log('\n🚨 CRITICAL ISSUES:');
    if (analysis.criticalIssues.length === 0) {
      console.log('  ✅ No critical issues detected');
    } else {
      analysis.criticalIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.issue}`);
        console.log(`     → Endpoint: ${issue.recommendedEndpoint}`);
        console.log(`     → Expected: ${issue.expectedImprovement}`);
        console.log(`     → Confidence: ${issue.confidence || 'N/A'}%\n`);
      });
    }

    console.log('💡 IMPROVEMENT OPPORTUNITIES:');
    if (analysis.improvementOpportunities.length === 0) {
      console.log('  ✅ No additional improvements suggested');
    } else {
      analysis.improvementOpportunities.slice(0, 3).forEach((opportunity, index) => {
        console.log(`  ${index + 1}. [${opportunity.severity.toUpperCase()}] ${opportunity.issue}`);
        console.log(`     → Endpoint: ${opportunity.recommendedEndpoint}`);
        console.log(`     → Expected: ${opportunity.expectedImprovement}\n`);
      });

      if (analysis.improvementOpportunities.length > 3) {
        console.log(
          `  ... and ${analysis.improvementOpportunities.length - 3} more opportunities\n`
        );
      }
    }

    console.log('🎯 ENDPOINT RECOMMENDATIONS:');
    if (analysis.endpointRecommendations && analysis.endpointRecommendations.length > 0) {
      analysis.endpointRecommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.endpoint}`);
        console.log(`     → Goal: ${rec.visualGoal}`);
        console.log(`     → Priority: ${rec.priority}`);
        console.log(`     → Confidence: ${rec.confidence}%\n`);
      });
    }

    console.log('🔄 EXECUTION ORDER:');
    if (analysis.executionOrder && analysis.executionOrder.length > 0) {
      analysis.executionOrder.forEach((endpoint, index) => {
        console.log(`  ${index + 1}. ${endpoint}`);
      });
    }

    console.log(`\n📊 Estimated Quality Gain: +${analysis.estimatedQualityGain} points\n`);

    // Test prompt effectiveness metrics
    console.log('🎯 PROMPT EFFECTIVENESS METRICS:');

    const hasStructuredOutput =
      analysis.overallScore !== undefined &&
      analysis.designScores !== undefined &&
      Array.isArray(analysis.criticalIssues);

    const hasValidEndpoints = analysis.criticalIssues.every(
      (issue) => issue.recommendedEndpoint && issue.recommendedEndpoint.startsWith('/api/')
    );

    const hasDetailedIssues =
      analysis.criticalIssues.length > 0 &&
      analysis.criticalIssues.every((issue) => issue.issue && issue.expectedImprovement);

    const hasConfidenceScores = analysis.criticalIssues.every(
      (issue) => issue.confidence !== undefined
    );

    console.log(`  ✅ Structured Output: ${hasStructuredOutput ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Valid Endpoints: ${hasValidEndpoints ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Detailed Issues: ${hasDetailedIssues ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Confidence Scores: ${hasConfidenceScores ? 'PASS' : 'FAIL'}`);

    const xmlPromptSuccess = hasStructuredOutput && hasValidEndpoints && hasDetailedIssues;
    console.log(
      `\n🏆 XML Prompt Optimization: ${xmlPromptSuccess ? 'SUCCESS' : 'NEEDS IMPROVEMENT'}`
    );

    // Expected improvements for our test HTML
    const expectedIssues = [
      'contrast',
      'typography',
      'font-size',
      'spacing',
      'touch-target',
      'accessibility',
      'hierarchy',
    ];

    const detectedRelevantIssues = analysis.criticalIssues
      .concat(analysis.improvementOpportunities)
      .filter((issue) =>
        expectedIssues.some((expected) => issue.issue.toLowerCase().includes(expected))
      ).length;

    console.log(
      `\n🎯 Relevant Issue Detection: ${detectedRelevantIssues}/${expectedIssues.length} categories detected`
    );

    if (detectedRelevantIssues >= 4) {
      console.log('✅ Excellent issue detection - prompts are working effectively!');
    } else if (detectedRelevantIssues >= 2) {
      console.log('⚠️  Good issue detection - prompts show promise but could be refined');
    } else {
      console.log('❌ Limited issue detection - prompts need optimization');
    }

    console.log('\n🎉 GPT-5 Optimized Prompt Test Complete!');

    // Display metadata
    if (analysisResult.metadata) {
      console.log('\n📋 Analysis Metadata:');
      console.log(`- Timestamp: ${analysisResult.metadata.timestamp}`);
      console.log(`- Model: ${analysisResult.metadata.model}`);
      console.log(
        `- Analysis Context: ${JSON.stringify(analysisResult.metadata.analysisContext, null, 2)}`
      );
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testOptimizedPrompts().catch(console.error);
}

module.exports = { testOptimizedPrompts };
