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
      <DialogContent className="floating-dialog-content max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="floating-component-header">
          <DialogTitle className="floating-component-title">AI健身助手</DialogTitle>
        </DialogHeader>
        
        <div className="floating-component-content flex-1 overflow-auto">
          {component}
        </div>
        
        <DialogFooter className="floating-component-footer">
          <div className="floating-component-tip">提示: 按ESC键可关闭此窗口</div>
          <DialogClose asChild>
            <Button className="floating-component-action-btn">关闭</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}