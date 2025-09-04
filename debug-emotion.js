const emotionCode = `import { css } from '@emotion/css';

const buttonStyle = css\`
  color: #1B3668;
  background: #F8FAFC;
  margin: 8px;
  padding: 16px;
\`;

export default function Button() {
  return <button className={buttonStyle}>Click me</button>;
}`;

// Test pattern detection
function containsCSSinJS(code) {
  return /styled\.[a-zA-Z]+`/.test(code) ||
         /css`/.test(code) ||
         /\bcss\s*\(/.test(code) ||
         /@emotion\/styled|@emotion\/css|styled-components/.test(code) ||
         /import.*styled.*from/.test(code) ||
         /import.*css.*from.*@emotion/.test(code);
}

console.log('Contains CSS-in-JS:', containsCSSinJS(emotionCode));
console.log('CSS backtick test:', /css`/.test(emotionCode));
console.log('Emotion import test:', /@emotion\/css/.test(emotionCode));

// Test actual transformation
const { enhanceCSSinJS } = require('./packages/engine/css-in-js');
const tokens = {
  colors: { roles: { primary: '#1B3668', surface: '#F8FAFC' }},
  spacing: { tokens: { sm: '8px', md: '16px' }}
};

const result = enhanceCSSinJS({ code: emotionCode, tokens, filePath: 'test.jsx' });
console.log('Enhancement result:', JSON.stringify(result, null, 2));