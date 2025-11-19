"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export enum TooltipPosition {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
}

interface OverflowableTextProps {
  content: string;
  maxLength?: number;
  className?: string;
  tooltipClassName?: string;
  position?: TooltipPosition;
}

const OverflowableText = ({
  content,
  maxLength = 30,
  className = "",
  tooltipClassName = "",
  position = TooltipPosition.TOP,
}: OverflowableTextProps) => {
  const isOverflowing = content?.length > maxLength;
  const truncatedContent = isOverflowing
    ? content.slice(0, maxLength) + "..."
    : content;

  if (!isOverflowing) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{truncatedContent}</span>
      </TooltipTrigger>
      <TooltipContent
        side={position}
        className={`max-w-xs ${tooltipClassName}`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default OverflowableText;

