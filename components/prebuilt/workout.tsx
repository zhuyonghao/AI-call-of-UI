"use client";

import { CalendarIcon, TimerIcon, RulerHorizontalIcon, ChevronDownIcon, ChevronUpIcon, Share2Icon } from "@radix-ui/react-icons";
import { Edit as EditIcon, Flame, TrendingUp } from "lucide-react"; // 添加更多图标
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
import { format } from "date-fns";
import { Progress } from "../ui/progress";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // 确保导入 cn 工具函数

export interface WorkoutProps {
  title: string;
  date: string;
  distance: number;
  duration: number;
  pace: number;
  calories: number;
  elevationGain?: number;
}

export function WorkoutLoading() {
  return (
    <Card className="w-[450px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>
            <Skeleton className="h-[22px] w-[180px] bg-slate-200 dark:bg-slate-700" />
          </CardTitle>
          <CardDescription>
            <div className="flex flex-col gap-[2px] pt-[4px]">
              <Skeleton className="h-[14px] w-[120px] bg-slate-200 dark:bg-slate-700" />
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
        <div className="grid grid-cols-3 gap-4 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`stat-${i}`} className="flex flex-col p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow-sm">
              <Skeleton className="h-[14px] w-[60px] mb-2 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-[20px] w-[80px] bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Workout(props: WorkoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutProps>(props);

  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: workoutData.title,
        text: `我完成了 ${workoutData.distance}公里的跑步，用时${workoutData.duration}分钟！`,
        url: window.location.href,
      });
    } catch (error) {
      console.log('分享失败:', error);
      const shareText = `${workoutData.title}: 我完成了 ${workoutData.distance}公里的跑步，用时${workoutData.duration}分钟！`;
      await navigator.clipboard.writeText(shareText);
      alert('已复制到剪贴板');
    }
  };

  const handleSave = (newData: Partial<WorkoutProps>) => {
    setWorkoutData({ ...workoutData, ...newData });
    setShowEditDialog(false);
  };

  const completionPercentage = Math.min((workoutData.distance / 5) * 100, 100);
  const formattedDate = format(new Date(workoutData.date), "yyyy年MM月dd日");
  const averageSpeed = (workoutData.distance / (workoutData.duration / 60)).toFixed(2);

  return (
    <Card className={cn(
      "w-[450px] transition-all duration-300 rounded-xl overflow-hidden",
      "bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-slate-900 dark:via-indigo-950 dark:to-violet-950",
      "border border-indigo-100/80 dark:border-indigo-900/30",
      isExpanded ? 'shadow-xl' : 'shadow-md hover:shadow-lg'
    )}>
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 border-b border-indigo-100/50 dark:border-indigo-800/30 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-indigo-800 dark:text-indigo-300">{workoutData.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center text-indigo-600/90 dark:text-indigo-400/90">
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {formattedDate}
            </div>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowEditDialog(true)}
            className="h-9 w-9 rounded-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 transition-colors"
          >
            <EditIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </Button>
          <Button
            variant="secondary"
            className="rounded-full bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-800/80 text-indigo-700 dark:text-indigo-300 shadow-sm transition-colors"
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
            <div className="text-sm font-medium text-indigo-700 dark:text-indigo-400">完成度</div>
            <div className="text-sm font-medium text-indigo-700 dark:text-indigo-400">{completionPercentage.toFixed(0)}%</div>
          </div>
          <div className="h-2 w-full bg-indigo-100/70 dark:bg-indigo-900/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${completionPercentage}%` }} 
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-indigo-100/50 dark:border-indigo-800/30">
            <span className="text-sm text-indigo-700 dark:text-indigo-400 flex items-center font-medium mb-1">
              <RulerHorizontalIcon className="mr-1.5 h-3.5 w-3.5" />
              距离
            </span>
            <span className="text-lg font-bold text-indigo-900 dark:text-indigo-300">{workoutData.distance} 公里</span>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-indigo-100/50 dark:border-indigo-800/30">
            <span className="text-sm text-indigo-700 dark:text-indigo-400 flex items-center font-medium mb-1">
              <TimerIcon className="mr-1.5 h-3.5 w-3.5" />
              时长
            </span>
            <span className="text-lg font-bold text-indigo-900 dark:text-indigo-300">{workoutData.duration} 分钟</span>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-indigo-100/50 dark:border-indigo-800/30">
            <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium mb-1">配速</span>
            <span className="text-lg font-bold text-indigo-900 dark:text-indigo-300">{formatPace(workoutData.pace)}/公里</span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-indigo-600 dark:text-indigo-400 bg-white/40 dark:bg-slate-800/30 p-3 rounded-lg backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/30">
          <div className="flex items-center">
            <Flame className="mr-1.5 h-4 w-4 text-amber-500" />
            <span>消耗 <span className="font-semibold">{workoutData.calories}</span> 卡路里</span>
          </div>
          {workoutData.elevationGain && (
            <div className="flex items-center">
              <TrendingUp className="mr-1.5 h-4 w-4 text-emerald-500" />
              <span>爬升 <span className="font-semibold">{workoutData.elevationGain}</span> 米</span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-5 pt-4 border-t border-indigo-100/50 dark:border-indigo-800/30 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-indigo-100/50 dark:border-indigo-800/30">
                <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium mb-1">平均速度</span>
                <span className="text-lg font-bold text-indigo-900 dark:text-indigo-300">{averageSpeed} 公里/小时</span>
              </div>
              <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-indigo-100/50 dark:border-indigo-800/30">
                <span className="text-sm text-indigo-700 dark:text-indigo-400 font-medium mb-1">每公里消耗</span>
                <span className="text-lg font-bold text-indigo-900 dark:text-indigo-300">{Math.round(workoutData.calories / workoutData.distance)} 卡路里</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-0 border-t border-indigo-100/50 dark:border-indigo-800/30 mt-2 pb-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors rounded-full"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="mr-1.5 h-4 w-4" />
              收起详情
            </>
          ) : (
            <>
              <ChevronDownIcon className="mr-1.5 h-4 w-4" />
              查看更多
            </>
          )}
        </Button>
      </CardFooter>

      {/* 编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-indigo-50/70 dark:from-slate-900 dark:to-indigo-950/70 border border-indigo-100 dark:border-indigo-800/50 shadow-xl rounded-2xl backdrop-blur-sm sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold text-indigo-800 dark:text-indigo-300">编辑跑步记录</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-indigo-700 dark:text-indigo-400">标题</Label>
              <Input
                id="title"
                className="col-span-3 border-indigo-200 dark:border-gray-600 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={workoutData.title}
                onChange={(e) => setWorkoutData({...workoutData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="distance" className="text-right text-indigo-700 dark:text-indigo-400">距离 (km)</Label>
              <Input
                id="distance"
                type="number"
                className="col-span-3 border-indigo-200 dark:border-gray-600 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={workoutData.distance}
                onChange={(e) => setWorkoutData({...workoutData, distance: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right text-indigo-700 dark:text-indigo-400">时长 (分钟)</Label>
              <Input
                id="duration"
                type="number"
                className="col-span-3 border-indigo-200 dark:border-gray-600 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={workoutData.duration}
                onChange={(e) => setWorkoutData({...workoutData, duration: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pace" className="text-right text-indigo-700 dark:text-indigo-400">配速 (分钟/km)</Label>
              <Input
                id="pace"
                type="number"
                step="0.1"
                className="col-span-3 border-indigo-200 dark:border-gray-600 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={workoutData.pace}
                onChange={(e) => setWorkoutData({...workoutData, pace: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right text-indigo-700 dark:text-indigo-400">卡路里</Label>
              <Input
                id="calories"
                type="number"
                className="col-span-3 border-indigo-200 dark:border-gray-600 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={workoutData.calories}
                onChange={(e) => setWorkoutData({...workoutData, calories: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="elevationGain" className="text-right text-indigo-700 dark:text-indigo-400">爬升 (米)</Label>
              <Input
                id="elevationGain"
                type="number"
                className="col-span-3 border-indigo-200 dark:border-gray-600 focus:border-indigo-400 dark:focus:border-indigo-500"
                value={workoutData.elevationGain || 0}
                onChange={(e) => setWorkoutData({...workoutData, elevationGain: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-600 dark:text-indigo-400 dark:hover:bg-gray-700 rounded-full px-5"
            >
              取消
            </Button>
            <Button 
              onClick={() => handleSave(workoutData)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-5"
            >
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}