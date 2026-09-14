import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AgentToolsService } from 'src/agent-tools/agent-tools.service';
import { OllamaChatResponse, OllamaMessage } from './ollama.types';

@Injectable()
export class OllamaService {
  constructor(private readonly agentToolsService: AgentToolsService) {}

  async callOllama(
    model: string,
    messages: OllamaMessage[],
    tools?: unknown[],
    format?: unknown,
  ): Promise<OllamaChatResponse> {
    const response = await fetch(
      `${process.env.OLLAMA_URL ?? 'http://localhost:11434'}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, tools, format, stream: false }),
      },
    );
    if (!response.ok) {
      throw new InternalServerErrorException(
        `Ollama request failed (${response.status})`,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.json();
  }

  async runWithTools(
    userId: string,
    studio: string,
    messages: OllamaMessage[],
    resultSchema: unknown,
    model: string = process.env.OLLAMA_MODEL ?? 'llama3.1',
  ): Promise<unknown> {
    const tools = this.agentToolsService.getToolSchemas();
    const history = [...messages];

    for (let round = 0; round < 5; round++) {
      const response = await this.callOllama(model, history, tools);
      history.push(response.message as OllamaMessage);

      const toolCalls = response.message.tool_calls;
      if (!toolCalls?.length) break;

      for (const call of toolCalls) {
        const result = await this.agentToolsService.executeTool(
          userId,
          studio,
          call.function.name,
          call.function.arguments,
        );
        history.push({
          role: 'tool',
          tool_name: call.function.name,
          content: JSON.stringify(result),
        });
      }
    }

    const final = await this.callOllama(
      model,
      history,
      undefined,
      resultSchema,
    );
    try {
      return JSON.parse(final.message.content);
    } catch {
      throw new InternalServerErrorException("Model didn't return valid JSON");
    }
  }
}
