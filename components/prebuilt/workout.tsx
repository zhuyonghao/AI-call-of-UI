"use client";

import { CalendarIcon, TimerIcon, RulerHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns";
import { Progress } from "../ui/progress";

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
  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
  };

  const completionPercentage = Math.min((props.distance / 5) * 100, 100);
  const formattedDate = format(new Date(props.date), "yyyy年MM月dd日");

  return (
    <Card className="w-[450px]">
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>
            <div className="flex items-center">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {formattedDate}
            </div>
          </CardDescription>
        </div>
        <Button
          variant="secondary"
          className="ml-auto shadow-none w-fit px-6"
        >
          分享
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">完成度</div>
          <Progress aria-label="Completion" value={completionPercentage} />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center">
              <RulerHorizontalIcon className="mr-1 h-3 w-3" />
              距离
            </span>
            <span className="text-lg font-semibold">{props.distance} 公里</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center">
              <TimerIcon className="mr-1 h-3 w-3" />
              时长
            </span>
            <span className="text-lg font-semibold">{props.duration} 分钟</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">配速</span>
            <span className="text-lg font-semibold">{formatPace(props.pace)}/公里</span>
          </div>
        </div>
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <span>消耗 {props.calories} 卡路里</span>
          </div>
          {props.elevationGain && (
            <div className="flex items-center">
              <span>爬升 {props.elevationGain} 米</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}