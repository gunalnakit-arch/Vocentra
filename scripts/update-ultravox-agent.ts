import * as fs from 'fs';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

async function main() {
  const agentId = '97fa3f33-a021-444e-8b29-c6ce02a4cff4';
  const toolsJson = JSON.parse(fs.readFileSync('./config/assistant-tools/calendar-tools.json', 'utf8'));
  const ultravoxConfig = toolsJson.ultravox;

  try {
    const client = axios.create({
        baseURL: 'https://api.ultravox.ai/api',
        headers: {
            'X-API-Key': process.env.ULTRAVOX_API_KEY,
            'Content-Type': 'application/json',
        },
    });

    const getRes = await client.get(`/agents/${agentId}`);
    const agent = getRes.data;
    console.log("Existing Agent tools:", agent.tools);
    
    // Tools to attach
    const newToolNames = ultravoxConfig.tools.map((t: any) => t.temporaryTool.modelToolName);
    
    // In Ultravox, you attach tools to an agent by just supplying their names (if they are system tools) 
    // or you define them as "temporaryTool" directly inside the tools array. 
    // Let's attach them as temporaryTools like the documentation suggests for inline tools:
    
    const inlineToolsToAttach = ultravoxConfig.tools.map((t: any) => ({
      temporaryTool: {
        modelToolName: t.temporaryTool.modelToolName,
        description: t.temporaryTool.description,
        dynamicParameters: t.temporaryTool.dynamicParameters,
        http: {
            ...t.temporaryTool.http,
            baseUrlPattern: t.temporaryTool.http.baseUrlPattern.replace('<YOUR_DOMAIN>', 'vocentra.vercel.app')
        },
        timeout: t.temporaryTool.timeout
      }
    }));

    const mergedTools = [...(agent.tools || []), ...inlineToolsToAttach];

    console.log('Sending patch with tools:', JSON.stringify(mergedTools, null, 2));
    
    const patchRes = await client.put(`/agents/${agentId}`, {
        ...agent,
        systemPrompt: agent.systemPrompt + "\n\n" + ultravoxConfig.systemPromptAdditions,
        tools: mergedTools
    });

    console.log('Agent updated successfully!');
  } catch (error: any) {
    console.error('Error updating agent:', error.response?.data || error.message);
  }
}

main();
