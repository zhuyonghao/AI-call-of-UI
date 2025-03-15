import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { Workout, WorkoutLoading } from "@/components/prebuilt/workout";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";

const workoutToolSchema = z.object({
  title: z.string().describe("跑步锻炼的标题"),
  date: z.string().optional().describe("锻炼日期，格式为YYYY-MM-DD"),
  distance: z.number().describe("跑步距离，以公里为单位"),
  duration: z.number().describe("跑步时长，以分钟为单位"),
  pace: z.number().describe("平均配速，以分钟/公里为单位"),
  calories: z.number().describe("消耗的卡路里"),
  elevationGain: z.number().optional().describe("海拔爬升，以米为单位"),
});

async function processWorkoutData(input: z.infer<typeof workoutToolSchema>) {
  // 这里可以添加实际的数据处理逻辑，例如保存到数据库
  // 现在我们只是简单地返回输入数据
  return {
    ...input,
    // 如果没有提供日期，使用当前日期
    date: input.date || new Date().toISOString().split('T')[0],
  };
}

export const workoutTool = tool(
  async (input, config) => {
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <WorkoutLoading />,
          type: "append",
        },
      },
      config,
    );
    const result = await processWorkoutData(input);
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <Workout {...result} />,
          type: "update",
        },
      },
      config,
    );
    return JSON.stringify(result, null);
  },
  {
    name: "workout_record",
    description:
      "一个记录跑步锻炼数据的工具。提供标题、距离、时长、配速等信息，将返回格式化的跑步记录。",
    schema: workoutToolSchema,
  },
);