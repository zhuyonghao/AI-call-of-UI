import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { Recipe, RecipeLoading } from "@/components/prebuilt/recipe";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";

const ingredientSchema = z.object({
  name: z.string().describe("食材名称"),
  amount: z.string().describe("食材数量"),
  unit: z.string().optional().describe("计量单位（如克、勺等）"),
});

const nutritionSchema = z.object({
  calories: z.number().describe("热量（千卡）"),
  protein: z.number().describe("蛋白质（克）"),
  carbs: z.number().describe("碳水化合物（克）"),
  fat: z.number().describe("脂肪（克）"),
  fiber: z.number().optional().describe("膳食纤维（克）"),
  sugar: z.number().optional().describe("糖（克）"),
});

const cookingStepSchema = z.object({
  step: z.number().describe("步骤序号"),
  description: z.string().describe("步骤描述"),
});

const recipeToolSchema = z.object({
  title: z.string().describe("食谱标题"),
  description: z.string().describe("食谱简短描述"),
  prepTime: z.number().describe("准备时间（分钟）"),
  cookTime: z.number().describe("烹饪时间（分钟）"),
  servings: z.number().describe("份数"),
  difficulty: z.enum(["简单", "中等", "困难"]).describe("难度级别"),
  ingredients: z.array(ingredientSchema).describe("食材列表"),
  steps: z.array(cookingStepSchema).describe("烹饪步骤"),
  nutrition: nutritionSchema.describe("营养信息"),
  tags: z.array(z.string()).optional().describe("标签（如素食、低脂等）"),
  imageUrl: z.string().optional().describe("食谱图片标识（可选，如不提供将根据食谱类型自动选择默认图片）"),
});

async function processRecipeData(input: z.infer<typeof recipeToolSchema>) {
  // 这里可以添加实际的数据处理逻辑，例如保存到数据库
  let processedInput = { ...input };
  
  // 定义默认图片 - 使用本地图片路径
  const defaultImages = {
    '沙拉': '/pic/salad.jpg',
    '汤': '/pic/soup.jpg',
    '肉类': '/pic/meat.jpg',
    '甜点': '/pic/dessert.jpg',
    '默认': '/pic/default.jpg'
  };
  
  // 图片选择函数
  const selectImageByKeywords = (keywords: string[], imageMap: Record<string, string>): string => {
    const defaultImage = imageMap['默认'];
    
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      for (const [key, url] of Object.entries(imageMap)) {
        if (lowerKeyword.includes(key.toLowerCase())) {
          return url;
        }
      }
    }
    
    return defaultImage;
  };
  
  // 处理图片 - 始终使用本地图片
  // 即使提供了http开头的URL，也忽略它并使用本地图片
  if (processedInput.imageUrl) {
    // 检查是否直接匹配默认图片中的键
    if (processedInput.imageUrl in defaultImages) {
      processedInput.imageUrl = defaultImages[processedInput.imageUrl as keyof typeof defaultImages];
    } else {
      // 收集所有可能的关键词
      const keywords = [processedInput.title];
      if (processedInput.tags && processedInput.tags.length > 0) {
        keywords.push(...processedInput.tags);
      }
      
      processedInput.imageUrl = selectImageByKeywords(keywords, defaultImages);
    }
  } else {
    // 如果没有提供imageUrl，根据标题和标签自动选择
    const keywords = [processedInput.title];
    if (processedInput.tags && processedInput.tags.length > 0) {
      keywords.push(...processedInput.tags);
    }
    
    processedInput.imageUrl = selectImageByKeywords(keywords, defaultImages);
  }
  
  return {
    ...processedInput,
    // 确保步骤序号是连续的
    steps: processedInput.steps.map((step, index) => ({
      ...step,
      step: index + 1,
    })),
  };
}

export const recipeTool = tool(
  async (input, config) => {
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <RecipeLoading />,
          type: "append",
        },
      },
      config,
    );
    const result = await processRecipeData(input);
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <Recipe {...result} />,
          type: "update",
        },
      },
      config,
    );
    return JSON.stringify(result, null, 2);
  },
  {
    name: "recipe_display",
    description:
      "一个展示营养食谱的工具。提供食谱标题、描述、准备和烹饪时间、食材列表、烹饪步骤和营养信息等，将返回格式化的食谱卡片。",
    schema: recipeToolSchema,
  },
);