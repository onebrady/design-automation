/**
 * Debug GPT-4 Turbo Response - Focused Test
 */

const { VisualAnalysisManager } = require('./packages/visual-analysis');
require('dotenv').config();

// Simple test HTML with obvious violations
const testHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-size: 12px; color: #999; }
    h1 { font-size: 16px; color: #777; }
    button { font-size: 10px; padding: 2px; }
  </style>
</head>
<body>
  <h1>Small Heading</h1>
  <p>Small gray text that's hard to read</p>
  <button>Tiny Button</button>
</body>
</html>`;

async function debugResponse() {
  console.log('🔍 Debug GPT-4 Turbo Response Test\n');

  try {
    const visualAnalysisManager = new VisualAnalysisManager({
      vision: { model: 'gpt-4-turbo' },
    });

    const result = await visualAnalysisManager.analyzeCode(testHTML, {
      analysisType: 'comprehensive',
    });

    console.log('✅ Raw Analysis Result:');
    console.log('- Success:', result.success);
    console.log('- Overall Score:', result.analysis.overallScore);
    console.log('- Critical Issues Count:', result.analysis.criticalIssues?.length || 0);
    console.log(
      '- Improvement Opportunities:',
      result.analysis.improvementOpportunities?.length || 0
    );

    if (result.analysis.criticalIssues?.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND:');
      result.analysis.criticalIssues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.issue || issue.violation}`);
        console.log(`   Severity: ${issue.severity}`);
        console.log(`   Location: ${issue.location}`);
      });
    } else {
      console.log('\n❌ NO CRITICAL ISSUES IN FINAL RESULT');
      console.log('Raw analysis object keys:', Object.keys(result.analysis || {}));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugResponse().catch(console.error);
