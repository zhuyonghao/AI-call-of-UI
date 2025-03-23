"use client";

import { useState } from "react";
import { CalendarIcon, Share2Icon } from "@radix-ui/react-icons";
import { Award, Edit as EditIcon, Star, Trophy, Medal, Target, Zap, CheckCircle } from "lucide-react";
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
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: "award" | "star" | "trophy" | "medal" | "target" | "zap" | "check";
  category: string;
  earnedDate: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  progress?: number; // 可选，用于显示进度
  maxProgress?: number; // 可选，用于显示进度上限
}

export interface AchievementProps {
  title: string;
  description?: string;
  badges: AchievementBadge[];
}

export function AchievementLoading() {
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`badge-${i}`} className="flex flex-col p-4 rounded-lg bg-white/70 dark:bg-slate-800/70 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-[40px] w-[40px] rounded-full bg-slate-200 dark:bg-slate-700" />
                <Skeleton className="h-[18px] w-[60px] rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <Skeleton className="h-[16px] w-[120px] mb-1 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-[14px] w-[180px] bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Achievement(props: AchievementProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [achievementData, setAchievementData] = useState<AchievementProps>(props);
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: achievementData.title,
        text: `查看我的成就徽章：${achievementData.title}`,
        url: window.location.href,
      });
    } catch (error) {
      console.log('分享失败:', error);
      const shareText = `${achievementData.title}: 我已获得 ${achievementData.badges.length} 个成就徽章！`;
      await navigator.clipboard.writeText(shareText);
      alert('已复制到剪贴板');
    }
  };

  const handleSave = (newData: Partial<AchievementProps>) => {
    setAchievementData({ ...achievementData, ...newData });
    setShowEditDialog(false);
  };

  const getBadgeIcon = (iconName: string) => {
    switch(iconName) {
      case "award": return <Award className="h-8 w-8" />;
      case "star": return <Star className="h-8 w-8" />;
      case "trophy": return <Trophy className="h-8 w-8" />;
      case "medal": return <Medal className="h-8 w-8" />;
      case "target": return <Target className="h-8 w-8" />;
      case "zap": return <Zap className="h-8 w-8" />;
      case "check": return <CheckCircle className="h-8 w-8" />;
      default: return <Award className="h-8 w-8" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case "bronze": return "text-amber-700 dark:text-amber-600";
      case "silver": return "text-slate-400 dark:text-slate-300";
      case "gold": return "text-yellow-500 dark:text-yellow-400";
      case "platinum": return "text-cyan-500 dark:text-cyan-400";
      default: return "text-slate-500 dark:text-slate-400";
    }
  };

  const getLevelBgColor = (level: string) => {
    switch(level) {
      case "bronze": return "bg-amber-100 dark:bg-amber-900/30";
      case "silver": return "bg-slate-100 dark:bg-slate-800/50";
      case "gold": return "bg-yellow-100 dark:bg-yellow-900/30";
      case "platinum": return "bg-cyan-100 dark:bg-cyan-900/30";
      default: return "bg-slate-100 dark:bg-slate-800/50";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy年MM月dd日', { locale: zhCN });
  };

  return (
    <Card className={cn(
      "w-[500px] transition-all duration-300 rounded-xl overflow-hidden",
      "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-purple-950 dark:to-indigo-950",
      "border border-indigo-100/80 dark:border-indigo-900/30",
      "shadow-md hover:shadow-lg"
    )}>
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 border-b border-indigo-100/50 dark:border-indigo-800/30 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-indigo-800 dark:text-indigo-300">
            {achievementData.title}
          </CardTitle>
          {achievementData.description && (
            <CardDescription className="text-indigo-600/90 dark:text-indigo-400/90">
              {achievementData.description}
            </CardDescription>
          )}
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
        <div className="grid grid-cols-2 gap-4">
          {achievementData.badges.map((badge, index) => (
            <div 
              key={`badge-${badge.id}`} 
              className={cn(
                "flex flex-col p-4 rounded-xl backdrop-blur-sm shadow-sm border border-indigo-100/50 dark:border-indigo-800/30",
                getLevelBgColor(badge.level),
                "hover:shadow-md transition-shadow"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={cn("p-2 rounded-full bg-white/70 dark:bg-slate-800/70", getLevelColor(badge.level))}>
                  {getBadgeIcon(badge.icon)}
                </div>
                <Badge 
                  className={cn(
                    "capitalize font-medium",
                    badge.level === "bronze" && "bg-amber-200 text-amber-800 hover:bg-amber-300 dark:bg-amber-800/50 dark:text-amber-200",
                    badge.level === "silver" && "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700/50 dark:text-slate-200",
                    badge.level === "gold" && "bg-yellow-200 text-yellow-800 hover:bg-yellow-300 dark:bg-yellow-800/50 dark:text-yellow-200",
                    badge.level === "platinum" && "bg-cyan-200 text-cyan-800 hover:bg-cyan-300 dark:bg-cyan-800/50 dark:text-cyan-200"
                  )}
                >
                  {badge.level}
                </Badge>
              </div>
              <h4 className="text-md font-semibold text-indigo-800 dark:text-indigo-300 mb-1">{badge.title}</h4>
              <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mb-2">{badge.description}</p>
              
              {(badge.progress !== undefined && badge.maxProgress !== undefined) && (
                <div className="mt-1 mb-2">
                  <div className="flex justify-between text-xs text-indigo-600/90 dark:text-indigo-400/90 mb-1">
                    <span>进度</span>
                    <span>{badge.progress}/{badge.maxProgress}</span>
                  </div>
                  <div className="h-1.5 w-full bg-indigo-100/70 dark:bg-indigo-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 rounded-full" 
                      style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }} 
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center mt-auto pt-1 text-xs text-indigo-500/80 dark:text-indigo-400/80">
                <CalendarIcon className="mr-1 h-3 w-3" />
                获得于 {formatDate(badge.earnedDate)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 border-t border-indigo-100/50 dark:border-indigo-800/30 mt-2 pb-3">
        <div className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
          已获得 {achievementData.badges.length} 个成就徽章
        </div>
      </CardFooter>

      {/* 编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-indigo-50/70 dark:from-slate-900 dark:to-indigo-950/70 border border-indigo-100 dark:border-indigo-800/50 shadow-xl rounded-2xl backdrop-blur-sm sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold text-indigo-800 dark:text-indigo-300">编辑成就</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right col-span-1">
                标题
              </Label>
              <Input
                id="title"
                defaultValue={achievementData.title}
                className="col-span-3"
                onChange={(e) => setAchievementData({...achievementData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right col-span-1">
                描述
              </Label>
              <Input
                id="description"
                defaultValue={achievementData.description}
                className="col-span-3"
                onChange={(e) => setAchievementData({...achievementData, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => handleSave(achievementData)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}