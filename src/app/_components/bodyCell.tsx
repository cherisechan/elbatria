import { useEffect, useState, useRef } from "react";

type Props = {
  value: string | number | null;
  colId: number;
  rowIndex: number;
  isNumber: boolean;
  onUpdate: (args: { colId: number; rowIndex: number; value: string | number | null }) => void;
};

export default function BodyCell({
  value,
  colId,
  rowIndex,
  isNumber,
  onUpdate,
}: Props) {
  const [inputValue, setInputValue] = useState<string>(String(value ?? ""));
  const prevValueRef = useRef(value); 

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setInputValue(String(value ?? ""));
      prevValueRef.current = value;
    }
  }, [value]);

  const handleBlur = () => {
    const raw = inputValue.trim();
    let newValue: string | number | null = null;

    if (isNumber) {
      if (raw === "") {
        newValue = null;
      } else {
        const parsed = parseFloat(raw);
        if (!isNaN(parsed)) {
          newValue = parsed;
        } else {
          return;
        }
      }
    } else {
      newValue = raw === "" ? null : raw;
    }

    if (newValue != prevValueRef.current) {
      onUpdate({
        colId,
        rowIndex,
        value: newValue,
      });
      prevValueRef.current = newValue;
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => {
        let inputted = e.target.value;
        if (isNumber) {
          inputted = inputted.replace(/[^0-9.]/g, "");
          const decimalCount = (inputted.match(/\./g) ?? []).length;
          if (decimalCount > 1) {
            inputted = inputted.slice(0, -1);
          }
        }
        if (inputted !== inputValue) {
          setInputValue(inputted);
        }
      }}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className="w-full h-full p-1 bg-white"
    />
  );
}
