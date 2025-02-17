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
    return Math.abs(Math.round(val)).toLocaleString();
  };

  // Round the value to the nearest integer
  const roundedValue = Math.round(value);
  const absValue = Math.abs(roundedValue);
  const gold = Math.floor(absValue / 10000);
  const silver = Math.floor((absValue % 10000) / 100);
  const copper = Math.floor(absValue % 100);
  const isNegative = roundedValue < 0;

  const content = (
    <div
      className={`flex items-center gap-1 ${isNegative ? "text-red-500" : ""}`}
    >
      {isNegative && <span>-</span>}
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
          <p>
            {isNegative ? "-" : ""}
            {formatValue(roundedValue)} copper
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CoinDisplay;
