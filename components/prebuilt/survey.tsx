"use client";

import { useState } from "react";
import { CalendarIcon, Share2Icon } from "@radix-ui/react-icons";
import { Edit as EditIcon, ClipboardList, ThumbsUp, ThumbsDown, BarChart3, Save, Award, Trophy, Dumbbell, Activity } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Badge } from "../ui/badge";

export interface SurveyQuestion {
  id: string;
  type: "text" | "radio" | "slider";
  question: string;
  options?: string[]; // 用于radio类型
  min?: number; // 用于slider类型
  max?: number; // 用于slider类型
  step?: number; // 用于slider类型
  answer?: string | number; // 用户的回答
}

export interface FitnessAchievement {
  id: string;
  title: string;
  description: string;
  value: number;
  unit: string;
  icon: "trophy" | "award" | "dumbbell" | "activity";
}

export interface FitnessSurveyProps {
  id: string;
  title: string;
  description?: string;
  date: string;
  questions: SurveyQuestion[];
  completed: boolean;
  achievements?: FitnessAchievement[]; // 新增健身成果数据
}

export function FitnessSurveyLoading() {
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
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`question-${i}`} className="space-y-2">
              <Skeleton className="h-[16px] w-[80%] bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-[40px] w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-4">
        <Skeleton className="h-[38px] w-[120px] bg-slate-200 dark:bg-slate-700 rounded-md" />
      </CardFooter>
    </Card>
  );
}

export function FitnessSurvey(props: FitnessSurveyProps) {
  const [isEditing, setIsEditing] = useState(!props.completed);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [surveyData, setSurveyData] = useState<FitnessSurveyProps>(props);
  const [showAchievements, setShowAchievements] = useState(false);
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: surveyData.title,
        text: `我完成了"${surveyData.title}"健身反馈问卷！`,
        url: window.location.href,
      });
    } catch (error) {
      console.log('分享失败:', error);
      const shareText = `${surveyData.title}: 我完成了健身反馈问卷！`;
      await navigator.clipboard.writeText(shareText);
      alert('已复制到剪贴板');
    }
  };

  const handleSave = () => {
    // 计算健身成果
    const achievements = calculateAchievements(surveyData.questions);
    
    setSurveyData({
      ...surveyData,
      completed: true,
      achievements: achievements
    });
    setIsEditing(false);
    setShowAchievements(true);
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    const updatedQuestions = surveyData.questions.map(q => {
      if (q.id === questionId) {
        return { ...q, answer };
      }
      return q;
    });
    
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy年MM月dd日', { locale: zhCN });
  };

  // 根据问卷回答计算健身成果
  const calculateAchievements = (questions: SurveyQuestion[]): FitnessAchievement[] => {
    const achievements: FitnessAchievement[] = [];
    
    // 查找强度相关问题
    const intensityQuestion = questions.find(q => 
      q.question.includes('强度') && q.type === 'slider' && q.answer !== undefined);
    
    if (intensityQuestion && typeof intensityQuestion.answer === 'number') {
      const intensity = intensityQuestion.answer;
      achievements.push({
        id: `intensity_${Date.now()}`,
        title: '训练强度',
        description: intensity > 7 ? '高强度训练完成！' : '中等强度训练完成',
        value: intensity,
        unit: '分',
        icon: 'activity'
      });
    }
    
    // 查找满意度相关问题
    const satisfactionQuestion = questions.find(q => 
      q.question.includes('满意') && q.type === 'slider' && q.answer !== undefined);
    
    if (satisfactionQuestion && typeof satisfactionQuestion.answer === 'number') {
      const satisfaction = satisfactionQuestion.answer;
      achievements.push({
        id: `satisfaction_${Date.now()}`,
        title: '训练满意度',
        description: satisfaction > 7 ? '对训练非常满意！' : '对训练基本满意',
        value: satisfaction,
        unit: '分',
        icon: 'trophy'
      });
    }
    
    // 查找训练时长相关问题
    const durationQuestion = questions.find(q => 
      q.question.includes('时长') && q.answer !== undefined);
    
    if (durationQuestion && durationQuestion.answer) {
      let duration = 0;
      if (typeof durationQuestion.answer === 'number') {
        duration = durationQuestion.answer;
      } else if (typeof durationQuestion.answer === 'string') {
        const match = durationQuestion.answer.match(/\d+/);
        if (match) {
          duration = parseInt(match[0], 10);
        }
      }
      
      if (duration > 0) {
        achievements.push({
          id: `duration_${Date.now()}`,
          title: '训练时长',
          description: duration > 60 ? '长时间训练完成！' : '完成训练',
          value: duration,
          unit: '分钟',
          icon: 'dumbbell'
        });
      }
    }
    
    return achievements;
  };

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case "text":
        return (
          <Textarea
            placeholder="请输入您的回答..."
            value={question.answer as string || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={!isEditing}
            className="w-full border-purple-200 dark:border-purple-800 focus:border-purple-400"
          />
        );
      case "radio":
        return (
          <RadioGroup
            value={question.answer as string || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            disabled={!isEditing}
            className="flex flex-col space-y-1"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${question.id}-option-${index}`}
                  className="border-purple-400 text-purple-600"
                />
                <Label
                  htmlFor={`${question.id}-option-${index}`}
                  className="text-purple-700 dark:text-purple-300"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[question.answer as number || question.min || 0]}
              min={question.min || 0}
              max={question.max || 10}
              step={question.step || 1}
              onValueChange={(values) => handleAnswerChange(question.id, values[0])}
              disabled={!isEditing}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-purple-600 dark:text-purple-400">
              <span>{question.min || 0}</span>
              <span>{question.max || 10}</span>
            </div>
            {question.answer !== undefined && (
              <div className="text-center font-medium text-purple-700 dark:text-purple-300">
                当前值: {question.answer}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // 渲染健身成果
  const renderAchievements = () => {
    if (!surveyData.achievements || surveyData.achievements.length === 0) {
      return null;
    }

    return (
      <div className="mt-6 pt-4 border-t border-purple-100/50 dark:border-purple-800/30">
        <h3 className="text-md font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center">
          <Award className="mr-2 h-4 w-4" />
          训练成果
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {surveyData.achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className="flex flex-col p-3 rounded-lg bg-purple-100/60 dark:bg-purple-900/40 backdrop-blur-sm shadow-sm border border-purple-200/50 dark:border-purple-800/30"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-full bg-white/70 dark:bg-slate-800/70 text-purple-600 dark:text-purple-400">
                  {achievement.icon === 'trophy' && <Trophy className="h-5 w-5" />}
                  {achievement.icon === 'award' && <Award className="h-5 w-5" />}
                  {achievement.icon === 'dumbbell' && <Dumbbell className="h-5 w-5" />}
                  {achievement.icon === 'activity' && <Activity className="h-5 w-5" />}
                </div>
                <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-300 dark:bg-purple-800/50 dark:text-purple-200">
                  {achievement.value} {achievement.unit}
                </Badge>
              </div>
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-1">{achievement.title}</h4>
              <p className="text-xs text-purple-600/80 dark:text-purple-400/80">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn(
      "w-[500px] transition-all duration-300 rounded-xl overflow-hidden",
      "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-slate-900 dark:via-purple-950 dark:to-violet-950",
      "border border-purple-100/80 dark:border-purple-900/30",
      "shadow-md hover:shadow-lg"
    )}>
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0 border-b border-purple-100/50 dark:border-purple-800/30 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-purple-800 dark:text-purple-300">{surveyData.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center text-purple-600/90 dark:text-purple-400/90">
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {formatDate(surveyData.date)}
            </div>
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowEditDialog(true)}
            className="h-9 w-9 rounded-full border-purple-200 dark:border-purple-800 hover:bg-purple-100/70 dark:hover:bg-purple-900/50 transition-colors"
          >
            <EditIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </Button>
          <Button
            variant="secondary"
            className="rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800/80 text-purple-700 dark:text-purple-300 shadow-sm transition-colors"
            onClick={handleShare}
          >
            <Share2Icon className="mr-1.5 h-4 w-4" />
            分享
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-5 pb-2">
        <div className="space-y-6">
          {surveyData.questions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <h3 className="text-md font-medium text-purple-800 dark:text-purple-300 flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                {index + 1}. {question.question}
              </h3>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
        
        {/* 显示健身成果 */}
        {surveyData.completed && renderAchievements()}
        
        {/* 新增成果提示 */}
        {showAchievements && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-300 text-sm flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            恭喜！您已完成训练并获得了新的健身成果！
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-4 border-t border-purple-100/50 dark:border-purple-800/30 mt-2 pb-3">
        {isEditing ? (
          <Button 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5"
          >
            <Save className="mr-1.5 h-4 w-4" />
            提交反馈
          </Button>
        ) : (
          <div className="flex items-center text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/40 px-4 py-2 rounded-full">
            <ThumbsUp className="mr-1.5 h-4 w-4 text-green-500" />
            已完成问卷
          </div>
        )}
      </CardFooter>

      {/* 编辑对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-purple-50/70 dark:from-slate-900 dark:to-purple-950/70 border border-purple-100 dark:border-purple-800/50 shadow-xl rounded-2xl backdrop-blur-sm sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold text-purple-800 dark:text-purple-300">编辑问卷信息</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-purple-700 dark:text-purple-400">标题</Label>
              <Input
                id="title"
                className="col-span-3 border-purple-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500"
                value={surveyData.title}
                onChange={(e) => setSurveyData({...surveyData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-purple-700 dark:text-purple-400">描述</Label>
              <Input
                id="description"
                className="col-span-3 border-purple-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500"
                value={surveyData.description || ""}
                onChange={(e) => setSurveyData({...surveyData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-purple-700 dark:text-purple-400">日期</Label>
              <Input
                id="date"
                type="date"
                className="col-span-3 border-purple-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500"
                value={surveyData.date}
                onChange={(e) => setSurveyData({...surveyData, date: e.target.value})}
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  setShowEditDialog(false);
                  setIsEditing(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                保存修改
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}