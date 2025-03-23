"use client";

import { useState } from "react";
import { Clock, Users, ChevronDown, ChevronUp, Share2, Heart, Printer, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface CookingStep {
  step: number;
  description: string;
}

export interface RecipeProps {
  title: string;
  description: string;
  prepTime: number; // 准备时间（分钟）
  cookTime: number; // 烹饪时间（分钟）
  servings: number; // 份数
  difficulty: "简单" | "中等" | "困难";
  ingredients: Ingredient[];
  steps: CookingStep[];
  nutrition: NutritionInfo;
  tags?: string[];
  imageUrl?: string;
}

export function RecipeLoading() {
  return (
    <Card className="w-[700px] overflow-hidden shadow-lg border-slate-200 dark:border-slate-700">
      <div className="h-[250px] bg-slate-200 dark:bg-slate-800 relative">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-[32px] w-[300px] mb-2" />
            <Skeleton className="h-[18px] w-[250px]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-[40px] w-[40px] rounded-full" />
            <Skeleton className="h-[40px] w-[40px] rounded-full" />
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <Skeleton className="h-[16px] w-[80px]" />
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <Skeleton className="h-[16px] w-[60px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-[16px] w-[70px]" />
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <Tabs defaultValue="ingredients">
          <TabsList className="mb-4">
            <TabsTrigger value="ingredients">食材</TabsTrigger>
            <TabsTrigger value="instructions">步骤</TabsTrigger>
            <TabsTrigger value="nutrition">营养信息</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients" className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`ingredient-${i}`} className="flex justify-between">
                <Skeleton className="h-[18px] w-[200px]" />
                <Skeleton className="h-[18px] w-[80px]" />
              </div>
            ))}
          </TabsContent>
          <TabsContent value="instructions" className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`step-${i}`} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <Skeleton className="h-[20px] w-[20px] rounded-full" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-[18px] w-full mb-2" />
                  <Skeleton className="h-[18px] w-[90%]" />
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="nutrition" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`nutrition-${i}`} className="flex justify-between border-b pb-2">
                  <Skeleton className="h-[18px] w-[100px]" />
                  <Skeleton className="h-[18px] w-[60px]" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex gap-2">
          <Skeleton className="h-[36px] w-[36px] rounded-md" />
          <Skeleton className="h-[36px] w-[36px] rounded-md" />
          <Skeleton className="h-[36px] w-[36px] rounded-md" />
        </div>
        <Skeleton className="h-[36px] w-[100px] rounded-md" />
      </CardFooter>
    </Card>
  );
}

export function Recipe(props: RecipeProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  
  const totalTime = props.prepTime + props.cookTime;
  const displayedIngredients = showAllIngredients 
    ? props.ingredients 
    : props.ingredients.slice(0, 6);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: props.title,
        text: props.description,
        url: window.location.href,
      });
    } catch (error) {
      console.log('分享失败:', error);
      await navigator.clipboard.writeText(`${props.title}: ${props.description}`);
      alert('已复制到剪贴板');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "简单": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case "中等": return "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
      case "困难": return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      default: return "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <Card className="w-[700px] overflow-hidden shadow-lg border-slate-200 dark:border-slate-700 rounded-xl">
      {props.imageUrl ? (
        <div className="h-[250px] relative overflow-hidden">
          <img 
            src={props.imageUrl} 
            alt={props.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      ) : (
        <div className="h-[100px] bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30"></div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">{props.title}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">{props.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "rounded-full transition-colors",
                isLiked ? "text-red-500 border-red-200 hover:text-red-600 hover:border-red-300 dark:border-red-800" : ""
              )}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-5 w-5", isLiked ? "fill-red-500" : "")} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "rounded-full transition-colors",
                isSaved ? "text-amber-500 border-amber-200 hover:text-amber-600 hover:border-amber-300 dark:border-amber-800" : ""
              )}
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark className={cn("h-5 w-5", isSaved ? "fill-amber-500" : "")} />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Clock className="h-4 w-4 text-slate-500" />
            <span>{totalTime} 分钟</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Users className="h-4 w-4 text-slate-500" />
            <span>{props.servings} 份</span>
          </div>
          <div className={cn(
            "px-2 py-0.5 rounded-full text-sm font-medium",
            getDifficultyColor(props.difficulty)
          )}>
            {props.difficulty}
          </div>
        </div>
        
        {props.tags && props.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {props.tags.map((tag, index) => (
              <span 
                key={`tag-${index}`}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-6">
        <Tabs defaultValue="ingredients">
          <TabsList className="mb-4">
            <TabsTrigger value="ingredients">食材</TabsTrigger>
            <TabsTrigger value="instructions">步骤</TabsTrigger>
            <TabsTrigger value="nutrition">营养信息</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ingredients" className="space-y-4">
            {displayedIngredients.map((ingredient, index) => (
              <div key={`ingredient-${index}`} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-800 dark:text-slate-200">{ingredient.name}</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {ingredient.amount} {ingredient.unit || ''}
                </span>
              </div>
            ))}
            
            {props.ingredients.length > 6 && (
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-slate-600 dark:text-slate-400"
                onClick={() => setShowAllIngredients(!showAllIngredients)}
              >
                {showAllIngredients ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    收起
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    显示全部 ({props.ingredients.length}) 种食材
                  </>
                )}
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="instructions" className="space-y-6">
            {props.steps.map((step) => (
              <div key={`step-${step.step}`} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-800 dark:text-amber-300 font-medium">
                  {step.step}
                </div>
                <div className="flex-1 text-slate-700 dark:text-slate-300">
                  {step.description}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="nutrition" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-700 dark:text-slate-300">热量</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{props.nutrition.calories} 千卡</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-700 dark:text-slate-300">蛋白质</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{props.nutrition.protein}g</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-700 dark:text-slate-300">碳水化合物</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{props.nutrition.carbs}g</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-700 dark:text-slate-300">脂肪</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{props.nutrition.fat}g</span>
              </div>
              {props.nutrition.fiber !== undefined && (
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-700 dark:text-slate-300">膳食纤维</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{props.nutrition.fiber}g</span>
                </div>
              )}
              {props.nutrition.sugar !== undefined && (
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-700 dark:text-slate-300">糖</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{props.nutrition.sugar}g</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <p className="mb-2 font-medium">营养小贴士</p>
                <p>每份食谱提供约 {Math.round(props.nutrition.calories / props.servings)} 千卡热量，占成人每日推荐摄入量的 {Math.round((props.nutrition.calories / props.servings / 2000) * 100)}%。</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="default" 
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          开始烹饪
        </Button>
      </CardFooter>
    </Card>
  );
}