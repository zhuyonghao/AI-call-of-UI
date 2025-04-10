import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { FitnessSurvey, FitnessSurveyLoading } from "@/components/prebuilt/survey";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";

const surveyQuestionSchema = z.object({
  id: z.string().optional().describe("问题ID，如果不提供将自动生成"),
  type: z.enum(["text", "radio", "slider"]).describe("问题类型：文本、单选或滑块"),
  question: z.string().describe("问题内容"),
  options: z.array(z.string()).optional().describe("单选题的选项"),
  min: z.number().optional().describe("滑块的最小值"),
  max: z.number().optional().describe("滑块的最大值"),
  step: z.number().optional().describe("滑块的步长"),
  // 将 answer 改为字符串类型，避免使用联合类型
  answer: z.string().optional().describe("用户的回答，对于滑块类型会转换为数字"),
});

const fitnessSurveySchema = z.object({
  id: z.string().optional().describe("问卷ID，如果不提供将自动生成"),
  title: z.string().describe("问卷标题"),
  description: z.string().optional().describe("问卷描述"),
  date: z.string().optional().describe("问卷日期，格式为YYYY-MM-DD"),
  questions: z.array(surveyQuestionSchema).describe("问卷问题列表"),
  completed: z.boolean().optional().default(false).describe("问卷是否已完成"),
});

export type FitnessSurveyToolSchema = z.infer<typeof fitnessSurveySchema>;

async function processSurveyData(input: FitnessSurveyToolSchema) {
  // 确保每个问题都有唯一ID
  const processedQuestions = input.questions.map(question => {
    // 如果没有提供ID，生成一个随机ID
    const id = question.id || `question_${Math.random().toString(36).substring(2, 9)}`;
    
    // 对于滑块类型，尝试将 answer 转换为数字
    let answer: string | number | undefined = question.answer;
    if (question.type === "slider" && question.answer) {
      answer = parseFloat(question.answer);
    }
    
    // 返回符合 SurveyQuestion 接口的对象
    return {
      id,
      type: question.type,
      question: question.question,
      options: question.options,
      min: question.min,
      max: question.max,
      step: question.step,
      answer
    };
  });
  
  // 返回符合 FitnessSurveyProps 接口的对象
  return {
    id: input.id || `survey_${Math.random().toString(36).substring(2, 9)}`,
    title: input.title,
    description: input.description,
    date: input.date || new Date().toISOString().split('T')[0],
    questions: processedQuestions,
    completed: input.completed || false,
  };
}

export const fitnessSurveyTool = tool(
  async (input, config) => {
    // 显示加载状态
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <FitnessSurveyLoading />,
          type: "append",
        },
      },
      config,
    );
    
    // 处理数据
    const data = await processSurveyData(input);
    
    // 更新为实际内容
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <FitnessSurvey {...data} />,
          type: "update",
        },
      },
      config,
    );
    
    return JSON.stringify(data, null, 2);
  },
  {
    name: "create_fitness_survey", // 确保这个名称与graph.tsx中的工具映射一致
    description:
      "创建健身反馈问卷工具。根据用户的需求，生成一个详细的健身反馈问卷，包括各种类型的问题（文本、单选、滑块等）。",
    schema: fitnessSurveySchema,
  },
);