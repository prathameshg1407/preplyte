import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyBvwyac42A-CstHAvLcabEnpnz6Wm0DmIg';

async function listAvailableModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Attempting to list available models...\n');
    
    // Try to call the list models endpoint directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    
    console.log('Available models:');
    console.log('================\n');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        console.log(`Name: ${model.name}`);
        console.log(`Display Name: ${model.displayName}`);
        console.log(`Description: ${model.description}`);
        console.log(`Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('---');
      });
    } else {
      console.log('No models found or unexpected response format');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

listAvailableModels();
