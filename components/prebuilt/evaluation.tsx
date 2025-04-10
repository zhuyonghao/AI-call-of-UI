"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Share2Icon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { Edit as EditIcon, Target, Award, TrendingUp, ArrowUp, ArrowDown, Minus, CheckCircle2, XCircle, Dumbbell, ThumbsUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export interface PhysicalChange {
  metric: string;
  before: number;
  after: number;
  unit: string;
}

export interface PlanEvaluationProps {
  planTitle: string;
  startDate: string;
  endDate: string;
  goal: string;
  level: string;
  focusArea: string[];
  completionRate: number;
  
  userFeedback: {
    physicalChanges: PhysicalChange[];
    satisfactionLevel: number;
    difficulties?: string[];
    achievements?: string[];
  };
  
  goalAchievement: {
    achieved: boolean;
    score: number;
    analysis: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export function PlanEvaluationLoading() {
  return (
    <Card className="w-[500px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>
            <Skeleton className="h-[22px] w-[220px] bg-slate-200 dark:bg-slate-700" />
          </CardTitle>
          <CardDescription>
            <div className="flex flex-col gap-[2px] pt-[4px]">
              <Skeleton className="h-[14px] w-[150px] bg-slate-200 dark:bg-slate-700" />
            </div>
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1 rounded-md">
          <Skeleton className="h-[38px] w-[90px] bg-slate-200 dark:bg-slate-700" />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-6">
          <Skeleton className="h-[14px] w-[80px] mb-2 bg-slate-200 dark:bg-slate-700" />
          <Skeleton className="h-[8px] w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`stat-${i}`} className="flex flex-col p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow-sm">
              <Skeleton className="h-[14px] w-[60px] mb-2 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-[20px] w-[120px] bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Skeleton className="h-[14px] w-[120px] mb-3 bg-slate-200 dark:bg-slate-700" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`item-${i}`} className="mb-3 p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow-sm">
              <Skeleton className="h-[16px] w-[100px] mb-2 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-[14px] w-full bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PlanEvaluation(props: PlanEvaluationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${props.planTitle} - 训练计划评估`,
        text: `我完成了"${props.planTitle}"训练计划，目标达成度: ${props.goalAchievement.score}%！`,
        url: window.location.href,
      });
    } catch (error) {
      console.log('分享失败:', error);
      const shareText = `${props.planTitle}: 训练计划评估 - 目标达成度: ${props.goalAchievement.score}%！`;
      await navigator.clipboard.writeText(shareText);
      alert('已复制到剪贴板');
    }
  };

  const formatDateRange = () => {
    const start = new Date(props.startDate);
    const end = new Date(props.endDate);
    return `${format(start, 'yyyy年MM月dd日', { locale: zhCN })} - ${format(end, 'yyyy年MM月dd日', { locale: zhCN })}`;
  };

  const getChangeIcon = (before: number, after: number) => {
    if (after > before) return <ArrowUp className="h-3.5 w-3.5 text-green-500" />;
    if (after < before) return <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
    return <Minus className="h-3.5 w-3.5 text-gray-500" />;
  };

  const getChangeClass = (metric: string, before: number, after: number) => {
    // 对于体重、体脂率等指标，减少是好事
    const decreaseIsGood = ['体重', '体脂率', '腰围'].some(m => metric.includes(m));
    
    if (after > before) {
      return decreaseIsGood ? 'text-red-500' : 'text-green-500';
    }
    if (after < before) {
      return decreaseIsGood ? 'text-green-500' : 'text-red-500';
    }
    return 'text-gray-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  return (
    <Card className={cn(
      "w-[500px] transition-all duration-300 rounded-xl overflow-hidden",
      "bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950",
      "border border-blue-100/80 dark:border-blue-900/30",
      isExpanded ? 'shadow-xl' : 'shadow-md hover:shadow-lg'
    )}>
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 border-b border-blue-100/50 dark:border-blue-800/30 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-300">{props.planTitle}</CardTitle>
            <Badge className={cn(
              "px-2 py-0.5 text-xs font-medium rounded-full",
              props.goalAchievement.achieved 
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
            )}>
              {props.goalAchievement.achieved ? "目标达成" : "部分达成"}
            </Badge>
          </div>
          <CardDescription>
            <div className="flex items-center text-blue-600/90 dark:text-blue-400/90">
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {formatDateRange()}
            </div>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800/80 text-blue-700 dark:text-blue-300 shadow-sm transition-colors"
            onClick={handleShare}
          >
            <Share2Icon className="mr-1.5 h-4 w-4" />
            分享
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-5 pb-2">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-400">目标达成度</div>
            <div className={cn(
              "text-sm font-medium",
              getScoreColor(props.goalAchievement.score)
            )}>
              {props.goalAchievement.score}%
            </div>
          </div>
          <div className="h-2 w-full bg-blue-100/70 dark:bg-blue-900/50 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-in-out",
                props.goalAchievement.score >= 80 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400" 
                  : props.goalAchievement.score >= 60
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400"
                    : "bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-400 dark:to-pink-400"
              )}
              style={{ width: `${props.goalAchievement.score}%` }} 
            />
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-sm">总览</TabsTrigger>
            <TabsTrigger value="changes" className="text-sm">身体变化</TabsTrigger>
            <TabsTrigger value="analysis" className="text-sm">分析建议</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-blue-800/30">
                <span className="text-sm text-blue-700 dark:text-blue-400 flex items-center font-medium mb-1">
                  <Target className="mr-1.5 h-3.5 w-3.5" />
                  训练目标
                </span>
                <span className="text-md font-bold text-blue-900 dark:text-blue-300">{props.goal}</span>
              </div>
              <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-blue-800/30">
                <span className="text-sm text-blue-700 dark:text-blue-400 flex items-center font-medium mb-1">
                  <Dumbbell className="mr-1.5 h-3.5 w-3.5" />
                  训练级别
                </span>
                <span className="text-md font-bold text-blue-900 dark:text-blue-300">{props.level}</span>
              </div>
              <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-blue-800/30">
                <span className="text-sm text-blue-700 dark:text-blue-400 flex items-center font-medium mb-1">
                  <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                  重点部位
                </span>
                <span className="text-md font-bold text-blue-900 dark:text-blue-300">{props.focusArea.join(', ')}</span>
              </div>
              <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-blue-800/30">
                <span className="text-sm text-blue-700 dark:text-blue-400 flex items-center font-medium mb-1">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  计划完成率
                </span>
                <span className="text-md font-bold text-blue-900 dark:text-blue-300">{props.completionRate}%</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-blue-800/30 mb-4">
              <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                <Award className="mr-2 h-4 w-4" />
                目标达成分析
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                {props.goalAchievement.analysis}
              </p>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-blue-800/30">
              <div className="flex items-center">
                <ThumbsUp className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-400">满意度评分</span>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-sm font-medium",
                props.userFeedback.satisfactionLevel >= 8 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  : props.userFeedback.satisfactionLevel >= 6
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
              )}>
                {props.userFeedback.satisfactionLevel} / 10
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="changes" className="mt-0">
            <div className="space-y-3">
              <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                身体指标变化
              </h3>
              
              {props.userFeedback.physicalChanges.map((change, index) => (
                <div 
                  key={`change-${index}`}
                  className="p-3 rounded-lg bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-blue-800/30"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{change.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-600 dark:text-blue-500">{change.before} {change.unit}</span>
                      <span className="text-sm">→</span>
                      <span className={cn(
                        "text-sm font-medium",
                        getChangeClass(change.metric, change.before, change.after)
                      )}>
                        {change.after} {change.unit} {getChangeIcon(change.before, change.after)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-blue-100/70 dark:bg-blue-900/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                        style={{ 
                          width: `${Math.min(Math.max((change.after / change.before) * 100, 0), 200)}%`,
                          backgroundColor: change.after > change.before ? '#10b981' : change.after < change.before ? '#ef4444' : '#6b7280'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {props.userFeedback.achievements && props.userFeedback.achievements.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    训练成就
                  </h3>
                  <div className="space-y-2">
                    {props.userFeedback.achievements.map((achievement, index) => (
                      <div 
                        key={`achievement-${index}`}
                        className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 backdrop-blur-sm shadow-sm border border-green-100/50 dark:border-green-800/30 flex items-center"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-700 dark:text-green-400">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {props.userFeedback.difficulties && props.userFeedback.difficulties.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    遇到的困难
                  </h3>
                  <div className="space-y-2">
                    {props.userFeedback.difficulties.map((difficulty, index) => (
                      <div 
                        key={`difficulty-${index}`}
                        className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 backdrop-blur-sm shadow-sm border border-amber-100/50 dark:border-amber-800/30 flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm text-amber-700 dark:text-amber-400">{difficulty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-0">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  训练优势
                </h3>
                <div className="space-y-2">
                  {props.goalAchievement.strengths.map((strength, index) => (
                    <div 
                      key={`strength-${index}`}
                      className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 backdrop-blur-sm shadow-sm border border-green-100/50 dark:border-green-800/30 flex items-center"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-400">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  训练不足
                </h3>
                <div className="space-y-2">
                  {props.goalAchievement.weaknesses.map((weakness, index) => (
                    <div 
                      key={`weakness-${index}`}
                      className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 backdrop-blur-sm shadow-sm border border-amber-100/50 dark:border-amber-800/30 flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-700 dark:text-amber-400">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  改进建议
                </h3>
                <div className="space-y-2">
                  {props.goalAchievement.recommendations.map((recommendation, index) => (
                    <div 
                      key={`recommendation-${index}`}
                      className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 backdrop-blur-sm shadow-sm border border-blue-100/50 dark:border-blue-800/30 flex items-center"
                    >
                      <span className="text-sm text-blue-700 dark:text-blue-400">{index + 1}. {recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 border-t border-blue-100/50 dark:border-blue-800/30 mt-2 pb-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center text-blue-700 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 hover:text-blue-800 dark:hover:text-blue-300"
        >
          {isExpanded ? (
            <>
              收起详情 <ChevronUpIcon className="ml-1.5 h-4 w-4" />
            </>
          ) : (
            <>
              展开详情 <ChevronDownIcon className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}