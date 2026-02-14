import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyClTQrAnnt26cxN4Ra2hDZP4J7lE19oFJ8';

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Testing different model names...\n');
    
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash',
    ];
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "test successful"');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ SUCCESS: ${modelName}`);
        console.log(`   Response: ${text.substring(0, 50)}...\n`);
        break; // Stop after first success
      } catch (error) {
        console.log(`❌ FAILED: ${modelName}`);
        console.log(`   Error: ${error.message.substring(0, 100)}...\n`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
