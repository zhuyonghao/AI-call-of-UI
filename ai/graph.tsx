import { BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { StateGraph, START, END } from "@langchain/langgraph";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { githubTool, invoiceTool, weatherTool, websiteDataTool, workoutTool, trainingPlanTool, recipeTool, achievementTool } from "./tools";
import { ChatOpenAI } from "@langchain/openai";

interface AgentExecutorState {
  input: string;
  chat_history: BaseMessage[];
  /**
   * The plain text result of the LLM if
   * no tool was used.
   */
  result?: string;
  /**
   * The parsed tool result that was called.
   */
  toolCall?: {
    name: string;
    parameters: Record<string, any>;
  };
  /**
   * The result of a tool.
   */
  toolResult?: Record<string, any>;
}

const invokeModel = async (
  state: AgentExecutorState,
  config?: RunnableConfig,
): Promise<Partial<AgentExecutorState>> => {
  const initialPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful assistant. You're provided a list of tools, and an input from the user.\n
Your job is to determine whether or not you have a tool which can handle the users input, or respond with plain text.`,
    ],
    new MessagesPlaceholder({
      variableName: "chat_history",
      optional: true,
    }),
    ["human", "{input}"],
  ]);

  const tools = [githubTool, invoiceTool, weatherTool, websiteDataTool, workoutTool, trainingPlanTool, recipeTool, achievementTool];

  const llm = new ChatOpenAI({
    temperature: 0,
    modelName: "moonshot-v1-8k", // deepseek-chat
    streaming: true,
    openAIApiKey: "sk-rT5vrStWV7u26OtR6EAjZHmb4O9bTINENpYtMU89H6yLFebx", // 替换为sk-2c6a28ccd2314527b8e1a74c29dc4e57
    configuration: {
      baseURL: "https://api.moonshot.cn/v1", // DeepSeek 的API端点https://api.deepseek.com/v1
    },
  }).bindTools(tools);
  const chain = initialPrompt.pipe(llm);
  const result = await chain.invoke(
    {
      input: state.input,
      chat_history: state.chat_history,
    },
    config,
  );

  if (result.tool_calls && result.tool_calls.length > 0) {
    return {
      toolCall: {
        name: result.tool_calls[0].name,
        parameters: result.tool_calls[0].args,
      },
    };
  }
  return {
    result: result.content as string,
  };
};

const invokeToolsOrReturn = (state: AgentExecutorState) => {
  if (state.toolCall) {
    return "invokeTools";
  }
  if (state.result) {
    return END;
  }
  throw new Error("No tool call or result found.");
};

const invokeTools = async (
  state: AgentExecutorState,
  config?: RunnableConfig,
): Promise<Partial<AgentExecutorState>> => {
  if (!state.toolCall) {
    throw new Error("No tool call found.");
  }
  const toolMap = {
    [githubTool.name]: githubTool,
    [invoiceTool.name]: invoiceTool,
    [weatherTool.name]: weatherTool,
    [websiteDataTool.name]: websiteDataTool,
    [workoutTool.name]: workoutTool,
    [trainingPlanTool.name]: trainingPlanTool,
    [recipeTool.name]: recipeTool,
    [achievementTool.name]: achievementTool,
  };

  const selectedTool = toolMap[state.toolCall.name];
  if (!selectedTool) {
    throw new Error("No tool found in tool map.");
  }
  const toolResult = await selectedTool.invoke(
    state.toolCall.parameters as any,
    config,
  );
  return {
    toolResult: JSON.parse(toolResult),
  };
};

export function agentExecutor() {
  const workflow = new StateGraph<AgentExecutorState>({
    channels: {
      input: null,
      chat_history: null,
      result: null,
      toolCall: null,
      toolResult: null,
    },
  })
    .addNode("invokeModel", invokeModel)
    .addNode("invokeTools", invokeTools)
    .addConditionalEdges("invokeModel", invokeToolsOrReturn)
    .addEdge(START, "invokeModel")
    .addEdge("invokeTools", END);

  const graph = workflow.compile();
  return graph;
}
