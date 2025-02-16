"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CoinDisplayProps {
  value: number;
  hideTooltip?: boolean;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({
  value,
  hideTooltip = false,
}) => {
  const formatValue = (val: number) => {
    return val.toLocaleString();
  };

  const gold = Math.floor(value / 10000);
  const silver = Math.floor((value % 10000) / 100);
  const copper = value % 100;

  const content = (
    <div className="flex items-center gap-1">
      {gold > 0 && (
        <span className="flex items-center">
          {formatValue(gold)}
          <img
            src="/gold.png"
            alt="gold"
            className="w-4 h-4 inline-block ml-1"
          />
        </span>
      )}
      {silver > 0 && (
        <span className="flex items-center">
          {formatValue(silver)}
          <img
            src="/silver.png"
            alt="silver"
            className="w-4 h-4 inline-block ml-1"
          />
        </span>
      )}
      {(copper > 0 || (gold === 0 && silver === 0)) && (
        <span className="flex items-center">
          {formatValue(copper)}
          <img
            src="/copper.png"
            alt="copper"
            className="w-4 h-4 inline-block ml-1"
          />
        </span>
      )}
    </div>
  );

  if (hideTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p>{formatValue(value)} copper</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CoinDisplay;
