// app/components/table-filters.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Column } from "@tanstack/react-table";
import CoinDisplay from "@/components/CoinDisplay";

// Debounced input component for search fields
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, onChange, debounce]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// Coin value input component
export function CoinInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | "";
  onChange: (value: number | "") => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    setInputValue(value === "" ? "" : value.toString());
  }, [value]);

  return (
    <div className="space-y-2">
      <Input
        type="number"
        value={inputValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setInputValue(newValue);
          onChange(newValue === "" ? "" : Number(newValue));
        }}
        placeholder={placeholder}
      />
      {inputValue !== "" && !isNaN(Number(inputValue)) && (
        <div className="text-sm">
          <CoinDisplay value={Number(inputValue)} />
        </div>
      )}
    </div>
  );
}

export function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  if (column.id === "name") {
    return (
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Filter..."
        className="w-full"
      />
    );
  }

  if (["buy_price", "sell_price"].includes(column.id)) {
    return (
      <div className="space-y-4">
        <CoinInput
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder="Min"
        />
        <CoinInput
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder="Max"
        />
      </div>
    );
  }

  return null;
}
