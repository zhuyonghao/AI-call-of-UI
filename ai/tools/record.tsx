import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { TrainingRecord, TrainingRecordLoading } from "@/components/prebuilt/record";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";

const trainingRecordSchema = z.object({
  title: z.string().describe("训练记录的标题"),
  description: z.string().optional().describe("训练记录的描述"),
  streak: z.number().describe("当前连续打卡天数"),
  goal: z.number().describe("目标打卡天数"),
  records: z.array(
    z.object({
      id: z.string().optional().describe("记录ID，如果不提供将自动生成"),
      date: z.string().describe("训练日期，格式为YYYY-MM-DD"),
      type: z.string().describe("训练类型，如'跑步'、'力量训练'等"),
      duration: z.number().describe("训练时长，以分钟为单位"),
      intensity: z.enum(["低", "中", "高"]).describe("训练强度"),
      completed: z.boolean().default(false).describe("是否已完成"),
      notes: z.string().optional().describe("训练备注"),
    })
  ).describe("训练记录列表"),
});

export type TrainingRecordToolSchema = z.infer<typeof trainingRecordSchema>;

async function processTrainingRecordData(input: TrainingRecordToolSchema) {
  // 确保每个记录都有唯一ID
  const processedRecords = input.records.map(record => {
    // 如果没有提供ID，生成一个随机ID
    if (!record.id) {
      return {
        ...record,
        id: `record_${Math.random().toString(36).substring(2, 9)}`
      };
    }
    return record;
  });
  
  return {
    ...input,
    records: processedRecords,
  };
}

export const trainingRecordTool = tool(
  async (input, config) => {
    // 显示加载状态
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <TrainingRecordLoading />,
          type: "append",
        },
      },
      config,
    );
    
    // 处理数据
    const data = await processTrainingRecordData(input);
    
    // 更新为实际内容
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <TrainingRecord 
            title={data.title}
            description={data.description}
            records={data.records.map(record => ({
              ...record,
              id: record.id || '' // 确保id始终为string类型，避免undefined
            }))}
            streak={data.streak}
            goal={data.goal}
          />,
          type: "update",
        },
      },
      config,
    );
    
    return JSON.stringify(data, null);
  },
  {
    name: "create_training_record",
    description:
      "创建训练打卡记录工具。根据用户的训练情况，生成一个详细的训练打卡记录，包括连续打卡天数、目标天数和具体训练记录等信息。",
    schema: trainingRecordSchema,
  },
);