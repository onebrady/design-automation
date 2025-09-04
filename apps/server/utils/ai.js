const { Anthropic } = require('@anthropic-ai/sdk');

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateBrandPackFromLogo(imageBuffer, mimeType, brandName, description = '') {
  console.log('=== generateBrandPackFromLogo ===');
  console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not configured');
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  console.log('Converting image to base64...');
  const base64Image = imageBuffer.toString('base64');
  const mediaType = mimeType === 'image/svg+xml' ? 'image/svg+xml' : 
                   mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 'image/jpeg' : 'image/png';
  
  console.log('Media type determined:', mediaType);
  console.log('Base64 image length:', base64Image.length);

  // Create the AI prompt (simplified version to avoid syntax issues)
  const prompt = [
    'You are an expert brand designer and design system architect.',
    'Please analyze this logo image and create a comprehensive brand pack schema.',
    '',
    'Generate a complete brand pack JSON that includes:',
    '',
    '1. Core Identity:',
    `   - id: kebab-case version of "${brandName}"`,
    `   - name: "${brandName}"`,
    '   - version: "1.0.0"',
    `   - description: "${description || 'AI-generated brand pack from logo analysis'}"`,
    '',
    '2. Brand Personality (0-10 scales):',
    '   - modern_traditional: How modern vs traditional the brand feels',
    '   - playful_serious: How playful vs serious the brand appears', 
    '   - trustworthy_innovative: How trustworthy vs innovative the brand seems',
    '',
    '3. Complete Token System with colors, typography, spacing, radii, and elevation',
    '',
    'Return ONLY a valid JSON object. Extract exact dominant colors from the logo',
    'and create harmonious palettes with proper WCAG AA accessibility standards.'
  ].join('\n');

  try {
    console.log('Making request to Claude API...');
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }]
    });

    console.log('Claude API response received, length:', response.content[0].text.length);
    const jsonResponse = response.content[0].text;
    
    // Parse and validate the JSON response
    let brandPack;
    try {
      brandPack = JSON.parse(jsonResponse);
    } catch (parseError) {
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        brandPack = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from Claude response');
      }
    }

    // Add timestamps and default fields
    brandPack.created = new Date();
    brandPack.updated = new Date();

    return brandPack;
  } catch (error) {
    console.error('Error generating brand pack from logo:', error);
    throw error;
  }
}

module.exports = {
  generateBrandPackFromLogo,
  anthropic,
  CLAUDE_MODEL
};