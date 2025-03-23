import {
  TrainingPlanLoading,
  TrainingPlan,
  TrainingPlanProps
} from "@/components/prebuilt/plan";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// 定义训练计划的数据结构
export const trainingDaySchema = z.object({
  day: z.string().describe("训练日期名称，如'星期一'"),
  exercises: z.array(
    z.object({
      name: z.string().describe("训练项目名称"),
      sets: z.number().describe("训练组数"),
      reps: z.number().describe("每组重复次数"),
      duration: z.number().optional().describe("训练时长（分钟）"),
      distance: z.number().optional().describe("训练距离（公里）"),
    })
  ).describe("当天的训练项目列表"),
  completed: z.boolean().default(false).describe("是否已完成该天的训练"),
});

export const trainingPlanSchema = z.object({
  title: z.string().describe("训练计划标题"),
  startDate: z.string().describe("开始日期，格式为YYYY-MM-DD"),
  endDate: z.string().describe("结束日期，格式为YYYY-MM-DD"),
  goal: z.string().describe("训练目标"),
  level: z.enum(["初级", "中级", "高级"]).describe("训练难度级别"),
  focusArea: z.array(z.string()).describe("重点训练部位"),
  schedule: z.array(trainingDaySchema).describe("训练计划安排"),
});

export type TrainingPlanToolSchema = z.infer<typeof trainingPlanSchema>;

// 处理训练计划数据
export async function processTrainingPlanData(input: TrainingPlanToolSchema) {
  // 计算初始进度（已完成天数/总天数）
  const completedDays = input.schedule.filter(day => day.completed).length;
  const progress = Math.round((completedDays / input.schedule.length) * 100);
  
  return {
    ...input,
    progress
  };
}

// 创建训练计划工具
export const trainingPlanTool = tool(
  async (input, config) => {
    // 显示加载状态
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <TrainingPlanLoading />,
          type: "append",
        },
      },
      config,
    );
    
    // 处理数据
    const data = await processTrainingPlanData(input);
    
    // 更新为实际内容
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <TrainingPlan {...data} />,
          type: "update",
        },
      },
      config,
    );
    
    return JSON.stringify(data, null);
  },
  {
    name: "create_training_plan",
    description:
      "创建个性化训练计划工具。根据用户的健身目标、级别和偏好，生成一个详细的训练计划，包括每周训练安排、训练项目和组数等信息。",
    schema: trainingPlanSchema,
  },
);