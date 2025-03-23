import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { Achievement, AchievementLoading } from "@/components/prebuilt/achievement";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";

// 定义成就徽章的图标类型
const iconTypes = ["award", "star", "trophy", "medal", "target", "zap", "check"] as const;

// 定义成就徽章的分类
const categoryTypes = ["跑步", "健身", "饮食", "睡眠", "瑜伽", "游泳", "骑行", "健康习惯"] as const;

// 定义成就徽章的等级
const levelTypes = ["bronze", "silver", "gold", "platinum"] as const;

// 使用常量定义schema，提高可读性和可维护性
const achievementBadgeSchema = z.object({
  id: z.string().describe("徽章的唯一ID"),
  title: z.string().describe("运动或健康相关成就的标题"),
  description: z.string().describe("运动或健康成就的详细描述"),
  icon: z.enum(iconTypes).describe("徽章的图标类型"),
  category: z.enum(categoryTypes).describe("运动或健康成就的分类"),
  earnedDate: z.string().describe("获得徽章的日期，格式为YYYY-MM-DD"),
  level: z.enum(levelTypes).describe("徽章的等级"),
  progress: z.number().optional().describe("当前进度（可选）"),
  maxProgress: z.number().optional().describe("进度上限（可选）"),
});

// 导出类型定义，方便其他文件使用
export type AchievementBadge = z.infer<typeof achievementBadgeSchema>;

const achievementToolSchema = z.object({
  title: z.string().describe("运动与健康成就集合的标题"),
  description: z.string().optional().describe("运动与健康成就集合的描述（可选）"),
  badges: z.array(achievementBadgeSchema).describe("运动与健康相关的成就徽章列表"),
});

// 导出类型定义
export type AchievementData = z.infer<typeof achievementToolSchema>;

/**
 * 处理成就数据
 * @param input 成就数据输入
 * @returns 处理后的成就数据
 */
async function processAchievementData(input: AchievementData): Promise<AchievementData> {
  // 确保每个徽章都有唯一ID
  const processedBadges = input.badges.map(badge => {
    // 如果没有提供ID，生成一个随机ID
    if (!badge.id) {
      return {
        ...badge,
        id: `badge_${Math.random().toString(36).substring(2, 9)}`
      };
    }
    return badge;
  });

  // 返回处理后的数据
  return {
    ...input,
    badges: processedBadges,
  };
}

export const achievementTool = tool(
  async (input: AchievementData, config) => {
    try {
      // 显示加载状态
      await dispatchCustomEvent(
        CUSTOM_UI_YIELD_NAME,
        {
          output: {
            value: <AchievementLoading />,
            type: "append",
          },
        },
        config,
      );

      // 处理数据
      const result = await processAchievementData(input);

      // 更新UI显示处理后的数据
      await dispatchCustomEvent(
        CUSTOM_UI_YIELD_NAME,
        {
          output: {
            value: <Achievement {...result} />,
            type: "update",
          },
        },
        config,
      );

      return JSON.stringify(result, null, 2); // 格式化JSON输出，提高可读性
    } catch (error) {
      console.error("成就徽章处理失败:", error);
      throw new Error(`成就徽章处理失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  {
    name: "achievement_badges",
    description:
      "一个展示用户运动与健康成就徽章的工具。提供标题、描述和徽章列表，将返回格式化的运动健康成就徽章展示。适用于跑步、健身、饮食、睡眠等健康相关成就。",
    schema: achievementToolSchema,
  },
);