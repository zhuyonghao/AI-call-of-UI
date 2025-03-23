"use client";

import { useState } from "react";
import { CalendarIcon, TimerIcon, ChevronDownIcon, ChevronUpIcon, Share2Icon } from "@radix-ui/react-icons";
import { Edit as EditIcon, Flame, Target, Dumbbell, TrendingUp, CheckCircle2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";

export interface TrainingDay {
  day: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    duration?: number; // 分钟
    distance?: number; // 公里
  }[];
  completed: boolean;
}

export interface TrainingPlanProps {
  title: string;
  startDate: string;
  endDate: string;
  goal: string;
  level: "初级" | "中级" | "高级";
  focusArea: string[];
  schedule: TrainingDay[];
  progress: number;
}

export function TrainingPlanLoading() {
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
            <div key={`day-${i}`} className="mb-3 p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow-sm">
              <Skeleton className="h-[16px] w-[100px] mb-2 bg-slate-200 dark:bg-slate-700" />
              <div className="pl-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={`exercise-${i}-${j}`} className="flex justify-between items-center py-1">
                    <Skeleton className="h-[14px] w-[150px] bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-[14px] w-[60px] bg-slate-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TrainingPlan(props: TrainingPlanProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [planData, setPlanData] = useState<TrainingPlanProps>(props);
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: planData.title,
        text: `我正在进行"${planData.title}"训练计划，目标是${planData.goal}！`,
        url: window.location.href,
      });
    } catch (error) {
      console.log('分享失败:', error);
      const shareText = `${planData.title}: 我正在进行训练计划，目标是${planData.goal}！`;
      await navigator.clipboard.writeText(shareText);
      alert('已复制到剪贴板');
    }
  };

  const handleSave = (newData: Partial<TrainingPlanProps>) => {
    setPlanData({ ...planData, ...newData });
    setShowEditDialog(false);
  };

  const toggleDayCompletion = (index: number) => {
    const newSchedule = [...planData.schedule];
    newSchedule[index].completed = !newSchedule[index].completed;
    
    // 重新计算进度
    const completedDays = newSchedule.filter(day => day.completed).length;
    const newProgress = Math.round((completedDays / newSchedule.length) * 100);
    
    setPlanData({
      ...planData,
      schedule: newSchedule,
      progress: newProgress
    });
  };

  const formatDateRange = () => {
    const start = new Date(planData.startDate);
    const end = new Date(planData.endDate);
    return `${format(start, 'yyyy年MM月dd日', { locale: zhCN })} - ${format(end, 'yyyy年MM月dd日', { locale: zhCN })}`;
  };

  // 计算剩余天数
  const calculateRemainingDays = () => {
    const today = new Date();
    const end = new Date(planData.endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <Card className={cn(
      "w-[500px] transition-all duration-300 rounded-xl overflow-hidden",
      "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-teal-950",
      "border border-emerald-100/80 dark:border-emerald-900/30",
      isExpanded ? 'shadow-xl' : 'shadow-md hover:shadow-lg'
    )}>
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 border-b border-emerald-100/50 dark:border-emerald-800/30 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{planData.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center text-emerald-600/90 dark:text-emerald-400/90">
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {formatDateRange()}
            </div>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowEditDialog(true)}
            className="h-9 w-9 rounded-full border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <EditIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </Button>
          <Button
            variant="secondary"
            className="rounded-full bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 text-emerald-700 dark:text-emerald-300 shadow-sm transition-colors"
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
            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">训练进度</div>
            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{planData.progress}%</div>
          </div>
          <div className="h-2 w-full bg-emerald-100/70 dark:bg-emerald-900/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${planData.progress}%` }} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">
            <span className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center font-medium mb-1">
              <Target className="mr-1.5 h-3.5 w-3.5" />
              训练目标
            </span>
            <span className="text-md font-bold text-emerald-900 dark:text-emerald-300">{planData.goal}</span>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">
            <span className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center font-medium mb-1">
              <Dumbbell className="mr-1.5 h-3.5 w-3.5" />
              训练级别
            </span>
            <span className="text-md font-bold text-emerald-900 dark:text-emerald-300">{planData.level}</span>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">
            <span className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center font-medium mb-1">
              <TimerIcon className="mr-1.5 h-3.5 w-3.5" />
              剩余天数
            </span>
            <span className="text-md font-bold text-emerald-900 dark:text-emerald-300">{calculateRemainingDays()} 天</span>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-emerald-100/50 dark:border-emerald-800/30">
            <span className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center font-medium mb-1">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
              重点部位
            </span>
            <span className="text-md font-bold text-emerald-900 dark:text-emerald-300">{planData.focusArea.join(', ')}</span>
          </div>
        </div>
        
        <div className="mt-4 mb-2">
          <h3 className="text-md font-semibold text-emerald-800 dark:text-emerald-300 mb-3">本周训练安排</h3>
          {planData.schedule.slice(0, isExpanded ? undefined : 3).map((day, index) => (
            <div 
              key={`day-${index}`} 
              className={cn(
                "mb-3 p-3 rounded-lg backdrop-blur-sm shadow-sm border border-emerald-100/50 dark:border-emerald-800/30",
                day.completed 
                  ? "bg-emerald-100/60 dark:bg-emerald-900/40" 
                  : "bg-white/60 dark:bg-slate-800/40"
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-300">{day.day}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDayCompletion(index)}
                  className={cn(
                    "h-7 px-2 rounded-full text-xs",
                    day.completed 
                      ? "bg-emerald-200/70 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-800/50 dark:text-emerald-200 dark:hover:bg-emerald-700/60" 
                      : "bg-white/70 text-emerald-700 hover:bg-emerald-100/70 dark:bg-slate-800/60 dark:text-emerald-400 dark:hover:bg-slate-700/70"
                  )}
                >
                  {day.completed ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      已完成
                    </>
                  ) : (
                    "标记完成"
                  )}
                </Button>
              </div>
              <div className="pl-2">
                {day.exercises.map((exercise, exIndex) => (
                  <div key={`exercise-${index}-${exIndex}`} className="flex justify-between items-center py-1 text-sm">
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {exercise.name}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-500">
                      {exercise.sets} 组 × {exercise.reps} 次
                      {exercise.duration && ` (${exercise.duration}分钟)`}
                      {exercise.distance && ` (${exercise.distance}公里)`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {!isExpanded && planData.schedule.length > 3 && (
            <div className="text-center text-sm text-emerald-600 dark:text-emerald-400 mt-2">
              还有 {planData.schedule.length - 3} 天训练计划...
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-0 border-t border-emerald-100/50 dark:border-emerald-800/30 mt-2 pb-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors rounded-full"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="mr-1.5 h-4 w-4" />
              收起详情
            </>
          ) : (
            <>
              <ChevronDownIcon className="mr-1.5 h-4 w-4" />
              查看完整计划
            </>
          )}
        </Button>
      </CardFooter>

      {/* 编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-emerald-50/70 dark:from-slate-900 dark:to-emerald-950/70 border border-emerald-100 dark:border-emerald-800/50 shadow-xl rounded-2xl backdrop-blur-sm sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-300">编辑训练计划</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-emerald-700 dark:text-emerald-400">标题</Label>
              <Input
                id="title"
                className="col-span-3 border-emerald-200 dark:border-gray-600 focus:border-emerald-400 dark:focus:border-emerald-500"
                value={planData.title}
                onChange={(e) => setPlanData({...planData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right text-emerald-700 dark:text-emerald-400">训练目标</Label>
              <Input
                id="goal"
                className="col-span-3 border-emerald-200 dark:border-gray-600 focus:border-emerald-400 dark:focus:border-emerald-500"
                value={planData.goal}
                onChange={(e) => setPlanData({...planData, goal: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="level" className="text-right text-emerald-700 dark:text-emerald-400">训练级别</Label>
              <Input
                id="level"
                className="col-span-3 border-emerald-200 dark:border-gray-600 focus:border-emerald-400 dark:focus:border-emerald-500"
                value={planData.level}
                onChange={(e) => setPlanData({...planData, level: e.target.value as any})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="focusArea" className="text-right text-emerald-700 dark:text-emerald-400">重点部位</Label>
              <Input
                id="focusArea"
                className="col-span-3 border-emerald-200 dark:border-gray-600 focus:border-emerald-400 dark:focus:border-emerald-500"
                value={planData.focusArea.join(', ')}
                onChange={(e) => setPlanData({...planData, focusArea: e.target.value.split(',').map(item => item.trim())})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-gray-600 dark:text-emerald-400 dark:hover:bg-gray-700 rounded-full px-5"
            >
              取消
            </Button>
            <Button 
              onClick={() => handleSave(planData)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-5"
            >
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

