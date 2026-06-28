#!/usr/bin/env node

const { execSync } = require('child_process');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const SYSTEM_PROMPT = `You are a strict, independent Cross-Model Reviewer for the "plan-to-build" project.
Your primary role is to enforce the "Stop Hook" verification by finding logical blind spots, boundary case issues, unhandled exceptions, and concurrency/race condition flaws in the provided git diff.

Rules:
1. Do not focus on syntax or minor style issues. Focus on "Corner Cases", "Logic Conflicts", and "Exceptions".
2. You must assume the author might have missed edge cases. Be adversarial but objective.
3. If you find vulnerabilities (e.g. XSS, Injection, Memory Leaks, missing Auth), highlight them immediately.
4. If there are unresolved issues, provide clear examples of how it fails and DO NOT approve.
5. IF AND ONLY IF you find zero logic flaws and the code safely handles boundaries, you MUST conclude your review by outputting EXACTLY this string at the very end:
> [!CHECK] Cross-Model Review Approved by Independent Reviewer Persona`;

async function main() {
  console.log('🔍 Starting Cross-Model Review...\n');
  
  // Get Git Diff
  let diff = '';
  try {
    // Look for uncommitted changes first
    diff = execSync('git diff', { encoding: 'utf-8' }).trim();
    if (!diff) {
      // Fallback to diffing the last commit if working directory is clean
      diff = execSync('git diff HEAD~1 HEAD', { encoding: 'utf-8' }).trim();
      console.log('No uncommitted changes found. Reviewing the last commit (HEAD~1 -> HEAD)...\n');
    } else {
      console.log('Reviewing uncommitted changes...\n');
    }
  } catch (err) {
    console.error('❌ Failed to extract git diff:', err.message);
    process.exit(1);
  }

  if (!diff) {
    console.log('⚠️ No diff content to review.');
    process.exit(0);
  }

  // Choose the Model SDK based on available API Keys
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('🤖 Model: Claude 3.5 Sonnet (Anthropic API)\n');
    const { Anthropic } = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    try {
      const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: `Please review the following git diff:\n\n\`\`\`diff\n${diff}\n\`\`\`` }
        ]
      });
      console.log('--- Review Result ---\n');
      console.log(msg.content[0].text);
      console.log('\n---------------------\n');
    } catch (e) {
      console.error('❌ Claude API Error:', e.message);
    }

  } else if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    console.log('🤖 Model: Gemini 2.5 Pro (Google Gen AI API)\n');
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_PROMPT}\n\nPlease review the following git diff:\n\n\`\`\`diff\n${diff}\n\`\`\`` }]
          }
        ]
      });
      console.log('--- Review Result ---\n');
      console.log(response.text);
      console.log('\n---------------------\n');
    } catch (e) {
      console.error('❌ Gemini API Error:', e.message);
    }
    
  } else {
    // Fallback to Local LLM (e.g. Ollama or LM Studio)
    const localUrl = process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1/chat/completions';
    const localModel = process.env.LOCAL_LLM_MODEL || 'hermes';
    console.log(`🤖 Model: Local Model (${localModel}) via ${localUrl}\n`);
    
    try {
      const response = await fetch(localUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-dev'
        },
        body: JSON.stringify({
          model: localModel,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Please review the following git diff:\n\n\`\`\`diff\n${diff}\n\`\`\`` }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Local API responded with status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('--- Review Result ---\n');
      console.log(data.choices?.[0]?.message?.content || data.response || 'No response content.');
      console.log('\n---------------------\n');
    } catch (e) {
      console.error('❌ Local LLM Error:', e.message);
      console.error('👉 Tip: Ensure your local LLM (e.g. Ollama/LM Studio) is running and the URL/Model in .env (LOCAL_LLM_URL, LOCAL_LLM_MODEL) are correct.');
    }
  }
}

main();
