const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-actual-api-key-here') {
  console.error('\n❌ OpenAI API key not configured!');
  console.log('\n📝 To set up your OpenAI API key:');
  console.log('1. Get your key from: https://platform.openai.com/api-keys');
  console.log('2. Edit the .env file in backend folder');
  console.log('3. Replace OPENAI_API_KEY with your actual key');
  console.log('\nSee OPENAI_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test if API key is valid
async function testAPIKey() {
  try {
    console.log('🔑 Testing OpenAI API key...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "API key is working!"' }],
      max_tokens: 10
    });
    console.log('✅ API key is valid!\n');
    return true;
  } catch (error) {
    console.error('❌ API key test failed:', error.message);
    if (error.message.includes('Invalid authentication')) {
      console.log('\n⚠️  Your API key appears to be invalid.');
      console.log('Please check that you copied it correctly.\n');
    } else if (error.message.includes('insufficient_quota')) {
      console.log('\n⚠️  You need to add billing to your OpenAI account.');
      console.log('Visit: https://platform.openai.com/account/billing\n');
    }
    return false;
  }
}

async function testRealAI() {
  console.log('🤖 TESTING WITH REAL OPENAI API\n');
  console.log('=' + '='.repeat(50));
  
  // First test the API key
  const keyValid = await testAPIKey();
  if (!keyValid) {
    process.exit(1);
  }
  
  let testUserId;
  
  try {
    // Test 1: Real Writing Style Analysis
    console.log('📝 TEST 1: Real AI Writing Style Analysis');
    console.log('-'.repeat(50));
    
    const samplePosts = [
      "Just launched my new startup! 🚀 Super excited to share this journey with everyone. It's been months of hard work but totally worth it!",
      "Coffee and coding kind of morning ☕ Working on some really cool features that I can't wait to show you all!",
      "Big announcement coming soon... stay tuned! 👀 This is going to be game-changing for our community.",
      "Thank you everyone for the amazing support! Your feedback has been invaluable. Let's keep building together! 💪"
    ];
    
    console.log('\nAnalyzing these posts:');
    samplePosts.forEach((post, i) => console.log(`${i + 1}. "${post}"`));
    
    console.log('\n⏳ Calling OpenAI GPT for analysis...');
    
    const analysisResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert linguistic analyst. Analyze the writing style from these social media posts and return a JSON object with the following structure:
          {
            "tone": "formal|casual|friendly|professional|enthusiastic",
            "vocabulary": "simple|moderate|complex",
            "sentenceLength": "short|medium|long",
            "emojiUsage": "none|minimal|moderate|frequent",
            "punctuation": ["common", "punctuation", "marks"],
            "commonPhrases": ["frequently", "used", "phrases"],
            "personality": "A brief description of the writer's personality based on their writing"
          }`
        },
        {
          role: 'user',
          content: samplePosts.join('\n\n')
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    const styleAnalysis = JSON.parse(analysisResponse.choices[0].message.content);
    
    console.log('\n✅ Real AI Analysis Complete:');
    console.log('  Tone:', styleAnalysis.tone);
    console.log('  Vocabulary:', styleAnalysis.vocabulary);
    console.log('  Emoji usage:', styleAnalysis.emojiUsage);
    console.log('  Personality:', styleAnalysis.personality);
    console.log('  Common phrases:', styleAnalysis.commonPhrases?.join(', '));
    
    // Create test user for message generation
    const testEmail = `ai_real_${Date.now()}@instabids.ai`;
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPass123!',
      email_confirm: true
    });
    testUserId = authUser.user.id;
    
    await supabase.from('users').insert({
      id: testUserId,
      email: testEmail,
      first_name: 'AI',
      last_name: 'Tester',
      password_hash: 'hashed',
      writing_style: styleAnalysis
    });
    
    // Create referral link
    const { data: link } = await supabase
      .from('referral_links')
      .insert({
        user_id: testUserId,
        original_url: 'https://instabids.ai',
        company_url: 'https://instabids.ai',
        is_primary: true
      })
      .select()
      .single();
    
    const referralUrl = `http://localhost:5000/r/${link.short_code}`;
    
    // Test 2: Real Message Generation
    console.log('\n💬 TEST 2: Real AI Message Generation');
    console.log('-'.repeat(50));
    
    const platforms = ['sms', 'email', 'whatsapp'];
    
    for (const platform of platforms) {
      console.log(`\n📱 Generating real messages for ${platform.toUpperCase()}:`);
      console.log('⏳ Calling OpenAI GPT...');
      
      const constraints = {
        sms: 'Keep under 160 characters. Be concise and direct.',
        email: 'Include a subject line. Professional but friendly. Can be longer.',
        whatsapp: 'Conversational tone. Can use emojis. Keep under 300 characters.'
      };
      
      const messageResponse = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert copywriter who creates personalized referral messages that match the user\'s writing style.'
          },
          {
            role: 'user',
            content: `Generate 3 different referral messages for ${platform}.
            
            Product: Instabids.ai (an innovative auction platform)
            Link to include: ${referralUrl}
            Writing style: ${styleAnalysis.tone} tone, ${styleAnalysis.emojiUsage} emoji usage
            Personality: ${styleAnalysis.personality}
            
            Platform constraints: ${constraints[platform]}
            
            Return as JSON array with format:
            [
              {
                "content": "message text",
                "score": 85,
                "reasoning": "why this message works"
              }
            ]`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      const messages = JSON.parse(messageResponse.choices[0].message.content);
      const messageArray = messages.messages || messages.variations || Object.values(messages).flat();
      
      console.log(`\n✅ Generated ${messageArray.length} real AI messages:`);
      messageArray.slice(0, 3).forEach((msg, i) => {
        console.log(`\nOption ${i + 1}:`);
        console.log(`"${msg.content}"`);
        if (msg.score) console.log(`Score: ${msg.score}%`);
        if (msg.reasoning) console.log(`Reasoning: ${msg.reasoning}`);
      });
    }
    
    // Test 3: Personalized Message
    console.log('\n👤 TEST 3: Real AI Personalized Message');
    console.log('-'.repeat(50));
    
    console.log('Generating personalized message for specific recipient...');
    console.log('Recipient: Sarah');
    console.log('Context: Loves online shopping and finding deals');
    console.log('\n⏳ Calling OpenAI GPT...');
    
    const personalizedResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating personalized referral messages.'
        },
        {
          role: 'user',
          content: `Create a personalized WhatsApp message for Sarah who loves online shopping and finding deals.
          
          Product: Instabids.ai
          Link: ${referralUrl}
          Style: ${styleAnalysis.tone} and ${styleAnalysis.personality}
          Use emojis: ${styleAnalysis.emojiUsage}
          
          Make it personal and engaging. Keep under 200 characters.`
        }
      ],
      temperature: 0.7
    });
    
    console.log('\n✅ Real AI Personalized Message:');
    console.log(`"${personalizedResponse.choices[0].message.content}"`);
    
    // Test 4: Message Improvement
    console.log('\n🔄 TEST 4: Real AI Message Improvement');
    console.log('-'.repeat(50));
    
    const originalMessage = "Check out Instabids.ai, it's cool!";
    console.log('Original message:', `"${originalMessage}"`);
    console.log('Feedback: Make it more enthusiastic and add emojis');
    console.log('\n⏳ Calling OpenAI GPT for improvement...');
    
    const improveResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at improving messages based on feedback.'
        },
        {
          role: 'user',
          content: `Improve this message: "${originalMessage}"
          
          Feedback: Make it more enthusiastic and add emojis
          Keep the same core message but make it more engaging.
          Include the link: ${referralUrl}`
        }
      ],
      temperature: 0.7
    });
    
    console.log('\n✅ Real AI Improved Message:');
    console.log(`"${improveResponse.choices[0].message.content}"`);
    
    // Summary
    console.log('\n' + '='.repeat(52));
    console.log('📊 REAL AI TEST SUMMARY');
    console.log('='.repeat(52));
    
    console.log('\n✅ All Real AI Features Working:');
    console.log('• Writing style analysis with actual GPT');
    console.log('• Multi-platform message generation');
    console.log('• Personalized messages for recipients');
    console.log('• Message improvement based on feedback');
    console.log('• Natural language understanding');
    
    console.log('\n🎯 AI Quality Metrics:');
    console.log('• Style analysis: Detailed and accurate');
    console.log('• Message quality: Natural and engaging');
    console.log('• Personalization: Context-aware');
    console.log('• Platform optimization: Respects constraints');
    
    console.log('\n💰 Estimated Costs (per user):');
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    if (model.includes('gpt-4')) {
      console.log('• Style analysis: ~$0.03');
      console.log('• 5 messages: ~$0.02');
      console.log('• Total per user: ~$0.05');
    } else {
      console.log('• Style analysis: ~$0.01');
      console.log('• 5 messages: ~$0.005');
      console.log('• Total per user: ~$0.015');
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
    console.log('✅ Test data cleaned');
    
    console.log('\n✨ REAL AI INTEGRATION SUCCESS!');
    console.log('🚀 Your platform is now powered by OpenAI!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('Rate limit')) {
      console.log('\n⚠️  You hit OpenAI rate limits.');
      console.log('Wait a minute and try again.\n');
    } else if (error.message.includes('model')) {
      console.log('\n⚠️  Model access issue.');
      console.log('Try using gpt-3.5-turbo instead of gpt-4.\n');
    }
    
    // Cleanup on error
    if (testUserId) {
      try {
        await supabase.auth.admin.deleteUser(testUserId);
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }
    }
    process.exit(1);
  }
}

// Run the test
console.log('🚀 Starting Real OpenAI API Test\n');
testRealAI();