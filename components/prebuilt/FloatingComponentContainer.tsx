"use client";

import { useFloatingComponent } from "@/app/shared";
import { useEffect, useRef, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingComponentContainer() {
  const { isVisible, component, hideFloatingComponent } = useFloatingComponent();
  const [open, setOpen] = useState(false);

  // 当isVisible变化时更新Dialog的open状态
  useEffect(() => {
    setOpen(isVisible);
  }, [isVisible]);

  // 当Dialog关闭时通知Context
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      hideFloatingComponent();
    }
  };

  if (!component) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(
        "max-w-4xl max-h-[80vh] overflow-hidden flex flex-col",
        "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        "border border-indigo-100 shadow-lg rounded-xl"
      )}>
        <DialogHeader className="border-b border-indigo-100 pb-3">
          <DialogTitle className="text-xl font-bold text-indigo-700">AI健身助手</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4">
          {component}
        </div>
        
        <DialogFooter className="border-t border-indigo-100 pt-3 flex items-center justify-between">
          <div className="text-sm text-indigo-500 italic">提示: 按ESC键可关闭此窗口</div>
          <DialogClose asChild>
            <Button className={cn(
              "bg-gradient-to-r from-indigo-500 to-purple-600",
              "hover:from-indigo-600 hover:to-purple-700",
              "text-white border-none shadow-md hover:shadow-lg transition-all duration-300"
            )}>关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}