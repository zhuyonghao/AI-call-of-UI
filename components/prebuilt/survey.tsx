"use client";

import { useState } from "react";
import { CalendarIcon, Share2Icon } from "@radix-ui/react-icons";
import { Edit as EditIcon, ClipboardList, ThumbsUp, ThumbsDown, BarChart3, Save } from "lucide-react";
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

export interface FitnessSurveyProps {
  id: string;
  title: string;
  description?: string;
  date: string;
  questions: SurveyQuestion[];
  completed: boolean;
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
    setSurveyData({
      ...surveyData,
      completed: true
    });
    setIsEditing(false);
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
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-gray-600 dark:text-purple-400 dark:hover:bg-gray-700 rounded-full px-5"
            >
              取消
            </Button>
            <Button 
              onClick={() => {
                setShowEditDialog(false);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5"
            >
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}