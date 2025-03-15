"use client";

import { CalendarIcon, TimerIcon, RulerHorizontalIcon, ChevronDownIcon, ChevronUpIcon, Share2Icon } from "@radix-ui/react-icons";
import { Edit as EditIcon } from "lucide-react"; // 从 lucide-react 导入 EditIcon
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <Card className="w-[450px]">
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>
            <Skeleton className="h-[18px] w-[180px]" />
          </CardTitle>
          <CardDescription>
            <div className="flex flex-col gap-[2px] pt-[4px]">
              <Skeleton className="h-[12px] w-[120px]" />
            </div>
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1 rounded-md bg-secondary text-secondary-foreground">
          <Skeleton className="h-[38px] w-[90px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Skeleton className="h-[12px] w-full" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`stat-${i}`} className="flex flex-col">
              <Skeleton className="h-[14px] w-[60px] mb-1" />
              <Skeleton className="h-[20px] w-[80px]" />
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
      // 如果浏览器不支持分享API，可以提供复制到剪贴板的功能
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
    <Card className={`w-[450px] transition-all duration-300 ${isExpanded ? 'shadow-lg' : ''}`}>
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>{workoutData.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {formattedDate}
            </div>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowEditDialog(true)}
            className="h-9 w-9"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            className="shadow-none"
            onClick={handleShare}
          >
            <Share2Icon className="mr-2 h-4 w-4" />
            分享
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">完成度</div>
          <Progress 
            aria-label="Completion" 
            value={completionPercentage}
            className="transition-all duration-300"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center">
              <RulerHorizontalIcon className="mr-1 h-3 w-3" />
              距离
            </span>
            <span className="text-lg font-semibold">{workoutData.distance} 公里</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center">
              <TimerIcon className="mr-1 h-3 w-3" />
              时长
            </span>
            <span className="text-lg font-semibold">{workoutData.duration} 分钟</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">配速</span>
            <span className="text-lg font-semibold">{formatPace(workoutData.pace)}/公里</span>
          </div>
        </div>
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <span>消耗 {workoutData.calories} 卡路里</span>
          </div>
          {workoutData.elevationGain && (
            <div className="flex items-center">
              <span>爬升 {workoutData.elevationGain} 米</span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">平均速度</span>
                <span className="text-lg font-semibold">{averageSpeed} 公里/小时</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">每公里消耗</span>
                <span className="text-lg font-semibold">{Math.round(workoutData.calories / workoutData.distance)} 卡路里</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="mr-2 h-4 w-4" />
              收起详情
            </>
          ) : (
            <>
              <ChevronDownIcon className="mr-2 h-4 w-4" />
              查看更多
            </>
          )}
        </Button>
      </CardFooter>

      {/* 编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑跑步记录</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">标题</Label>
              <Input
                id="title"
                className="col-span-3"
                value={workoutData.title}
                onChange={(e) => setWorkoutData({...workoutData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="distance" className="text-right">距离 (km)</Label>
              <Input
                id="distance"
                type="number"
                className="col-span-3"
                value={workoutData.distance}
                onChange={(e) => setWorkoutData({...workoutData, distance: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">时长 (分钟)</Label>
              <Input
                id="duration"
                type="number"
                className="col-span-3"
                value={workoutData.duration}
                onChange={(e) => setWorkoutData({...workoutData, duration: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pace" className="text-right">配速 (分钟/km)</Label>
              <Input
                id="pace"
                type="number"
                step="0.1"
                className="col-span-3"
                value={workoutData.pace}
                onChange={(e) => setWorkoutData({...workoutData, pace: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right">卡路里</Label>
              <Input
                id="calories"
                type="number"
                className="col-span-3"
                value={workoutData.calories}
                onChange={(e) => setWorkoutData({...workoutData, calories: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="elevationGain" className="text-right">爬升 (米)</Label>
              <Input
                id="elevationGain"
                type="number"
                className="col-span-3"
                value={workoutData.elevationGain || 0}
                onChange={(e) => setWorkoutData({...workoutData, elevationGain: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>取消</Button>
            <Button onClick={() => handleSave(workoutData)}>保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}