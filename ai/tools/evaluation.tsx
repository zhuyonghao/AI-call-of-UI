import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { PlanEvaluation, PlanEvaluationLoading } from "@/components/prebuilt/evaluation";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";

const planEvaluationSchema = z.object({
  planTitle: z.string().describe("训练计划的标题"),
  startDate: z.string().describe("计划开始日期，格式为YYYY-MM-DD"),
  endDate: z.string().describe("计划结束日期，格式为YYYY-MM-DD"),
  goal: z.string().describe("原计划的训练目标"),
  level: z.string().describe("训练级别，如'初级'、'中级'、'高级'"),
  focusArea: z.array(z.string()).describe("训练重点部位"),
  completionRate: z.number().describe("计划完成率，0-100的数字"),
  
  // 用户反馈数据
  userFeedback: z.object({
    physicalChanges: z.array(z.object({
      metric: z.string().describe("身体指标，如'体重'、'体脂率'、'肌肉量'等"),
      before: z.number().describe("训练前的数值"),
      after: z.number().describe("训练后的数值"),
      unit: z.string().describe("单位，如'kg'、'%'等"),
    })),
    satisfactionLevel: z.number().min(1).max(10).describe("用户对训练效果的满意度，1-10分"),
    difficulties: z.array(z.string()).optional().describe("训练过程中遇到的困难"),
    achievements: z.array(z.string()).optional().describe("训练过程中的成就"),
  }),
  
  // 目标达成评估
  goalAchievement: z.object({
    achieved: z.boolean().describe("是否达到预期目标"),
    score: z.number().min(0).max(100).describe("目标达成得分，0-100分"),
    analysis: z.string().describe("目标达成分析"),
    strengths: z.array(z.string()).describe("训练中的优势"),
    weaknesses: z.array(z.string()).describe("训练中的不足"),
    recommendations: z.array(z.string()).describe("改进建议"),
  }),
});

export type PlanEvaluationToolSchema = z.infer<typeof planEvaluationSchema>;

async function processPlanEvaluationData(input: PlanEvaluationToolSchema) {
  // 这里可以添加实际的数据处理逻辑
  return input;
}

export const planEvaluationTool = tool(
  async (input, config) => {
    // 显示加载状态
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <PlanEvaluationLoading />,
          type: "append",
        },
      },
      config,
    );
    
    // 处理数据
    const data = await processPlanEvaluationData(input);
    
    // 更新为实际内容
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <PlanEvaluation {...data} />,
          type: "update",
        },
      },
      config,
    );
    
    return JSON.stringify(data, null);
  },
  {
    name: "evaluate_training_plan",
    description:
      "评估训练计划目标达成情况的工具。根据用户的训练完成情况和反馈数据，分析是否达到预期目标，并提供改进建议。",
    schema: planEvaluationSchema,
  },
);