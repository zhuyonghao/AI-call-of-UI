"use client";

import { useState } from "react";
import { CalendarIcon, TimerIcon, ChevronDownIcon, ChevronUpIcon, Share2Icon } from "@radix-ui/react-icons";
import { Edit as EditIcon, Flame, CheckCircle, Calendar, BarChart3, Trophy, Clock } from "lucide-react";
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
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export interface TrainingRecord {
  id: string;
  date: string;
  type: string;
  duration: number;
  intensity: "低" | "中" | "高";
  completed: boolean;
  notes?: string;
}

export interface TrainingRecordProps {
  title: string;
  description?: string;
  records: TrainingRecord[];
  streak: number;
  goal: number;
}

export function TrainingRecordLoading() {
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
        <div className="grid grid-cols-3 gap-4 mb-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`stat-${i}`} className="flex flex-col p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow-sm">
              <Skeleton className="h-[14px] w-[60px] mb-2 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-[20px] w-[80px] bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Skeleton className="h-[14px] w-[120px] mb-3 bg-slate-200 dark:bg-slate-700" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`record-${i}`} className="mb-3 p-3 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-[16px] w-[100px] bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-[24px] w-[80px] bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-[14px] w-[150px] bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-[14px] w-[60px] bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TrainingRecord(props: TrainingRecordProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [recordData, setRecordData] = useState<TrainingRecordProps>(props);
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: recordData.title,
        text: `我已经连续打卡${recordData.streak}天了，目标是${recordData.goal}天！`,
        url: window.location.href,
      });
    } catch (error) {
      console.log('分享失败:', error);
      const shareText = `${recordData.title}: 我已经连续打卡${recordData.streak}天了，目标是${recordData.goal}天！`;
      await navigator.clipboard.writeText(shareText);
      alert('已复制到剪贴板');
    }
  };

  const handleSave = (newData: Partial<TrainingRecordProps>) => {
    setRecordData({ ...recordData, ...newData });
    setShowEditDialog(false);
  };

  const toggleRecordCompletion = (id: string) => {
    const newRecords = recordData.records.map(record => {
      if (record.id === id) {
        return { ...record, completed: !record.completed };
      }
      return record;
    });
    
    setRecordData({
      ...recordData,
      records: newRecords
    });
  };

  const completionPercentage = Math.min((recordData.streak / recordData.goal) * 100, 100);
  const completedRecords = recordData.records.filter(record => record.completed).length;
  const totalRecords = recordData.records.length;
  const completionRate = totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0;

  const getIntensityColor = (intensity: string) => {
    switch(intensity) {
      case "低": return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "中": return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30";
      case "高": return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default: return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy年MM月dd日', { locale: zhCN });
  };

  return (
    <Card className={cn(
      "w-[500px] transition-all duration-300 rounded-xl overflow-hidden",
      "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-900 dark:via-orange-950 dark:to-amber-950",
      "border border-amber-100/80 dark:border-amber-900/30",
      isExpanded ? 'shadow-xl' : 'shadow-md hover:shadow-lg'
    )}>
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 border-b border-amber-100/50 dark:border-amber-800/30 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-amber-800 dark:text-amber-300">{recordData.title}</CardTitle>
          {recordData.description && (
            <CardDescription className="text-amber-600/90 dark:text-amber-400/90">
              {recordData.description}
            </CardDescription>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowEditDialog(true)}
            className="h-9 w-9 rounded-full border-amber-200 dark:border-amber-800 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 transition-colors"
          >
            <EditIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </Button>
          <Button
            variant="secondary"
            className="rounded-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800/80 text-amber-700 dark:text-amber-300 shadow-sm transition-colors"
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
            <div className="text-sm font-medium text-amber-700 dark:text-amber-400">目标进度</div>
            <div className="text-sm font-medium text-amber-700 dark:text-amber-400">{completionPercentage.toFixed(0)}%</div>
          </div>
          <div className="h-2 w-full bg-amber-100/70 dark:bg-amber-900/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${completionPercentage}%` }} 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-amber-100/50 dark:border-amber-800/30">
            <span className="text-sm text-amber-700 dark:text-amber-400 flex items-center font-medium mb-1">
              <Flame className="mr-1.5 h-3.5 w-3.5" />
              连续打卡
            </span>
            <span className="text-lg font-bold text-amber-900 dark:text-amber-300">{recordData.streak} 天</span>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-amber-100/50 dark:border-amber-800/30">
            <span className="text-sm text-amber-700 dark:text-amber-400 flex items-center font-medium mb-1">
              <Trophy className="mr-1.5 h-3.5 w-3.5" />
              目标天数
            </span>
            <span className="text-lg font-bold text-amber-900 dark:text-amber-300">{recordData.goal} 天</span>
          </div>
          <div className="flex flex-col p-3.5 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm shadow-sm border border-amber-100/50 dark:border-amber-800/30">
            <span className="text-sm text-amber-700 dark:text-amber-400 flex items-center font-medium mb-1">
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              完成率
            </span>
            <span className="text-lg font-bold text-amber-900 dark:text-amber-300">{completionRate}%</span>
          </div>
        </div>
        
        <div className="mt-4 mb-2">
          <h3 className="text-md font-semibold text-amber-800 dark:text-amber-300 mb-3">训练记录</h3>
          {recordData.records.slice(0, isExpanded ? undefined : 3).map((record) => (
            <div 
              key={`record-${record.id}`} 
              className={cn(
                "mb-3 p-3 rounded-lg backdrop-blur-sm shadow-sm border border-amber-100/50 dark:border-amber-800/30",
                record.completed 
                  ? "bg-amber-100/60 dark:bg-amber-900/40" 
                  : "bg-white/60 dark:bg-slate-800/40"
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">{formatDate(record.date)}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRecordCompletion(record.id)}
                  className={cn(
                    "h-7 px-2 rounded-full text-xs",
                    record.completed 
                      ? "bg-amber-200/70 text-amber-800 hover:bg-amber-200 dark:bg-amber-800/50 dark:text-amber-200 dark:hover:bg-amber-700/60" 
                      : "bg-white/70 text-amber-700 hover:bg-amber-100/70 dark:bg-slate-800/60 dark:text-amber-400 dark:hover:bg-slate-700/70"
                  )}
                >
                  {record.completed ? (
                    <>
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      已完成
                    </>
                  ) : (
                    "标记完成"
                  )}
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "px-2 py-0.5 text-xs rounded-full",
                    getIntensityColor(record.intensity)
                  )}>
                    {record.intensity}强度
                  </div>
                  <div className="flex items-center text-amber-700 dark:text-amber-400 text-sm">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {record.duration} 分钟
                  </div>
                </div>
                <div className="text-sm text-amber-600/80 dark:text-amber-400/80">
                  {record.type}
                </div>
              </div>
              {record.notes && (
                <div className="mt-2 text-sm text-amber-700/80 dark:text-amber-400/80 italic">
                  {record.notes}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {recordData.records.length > 3 && (
          <Button
            variant="ghost"
            className="w-full mt-2 text-amber-700 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="mr-1.5 h-4 w-4" />
                收起
              </>
            ) : (
              <>
                <ChevronDownIcon className="mr-1.5 h-4 w-4" />
                查看更多 ({recordData.records.length - 3})
              </>
            )}
          </Button>
        )}
      </CardContent>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑训练记录</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                标题
              </Label>
              <Input
                id="title"
                defaultValue={recordData.title}
                className="col-span-3"
                onChange={(e) => handleSave({ title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                描述
              </Label>
              <Input
                id="description"
                defaultValue={recordData.description}
                className="col-span-3"
                onChange={(e) => handleSave({ description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="streak" className="text-right">
                连续天数
              </Label>
              <Input
                id="streak"
                type="number"
                defaultValue={recordData.streak.toString()}
                className="col-span-3"
                onChange={(e) => handleSave({ streak: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                目标天数
              </Label>
              <Input
                id="goal"
                type="number"
                defaultValue={recordData.goal.toString()}
                className="col-span-3"
                onChange={(e) => handleSave({ goal: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" onClick={() => setShowEditDialog(false)}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}