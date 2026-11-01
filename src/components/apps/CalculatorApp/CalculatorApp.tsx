import React, { useState } from 'react';
import { motion } from 'motion/react';
import { soundService } from '../../../services/soundService';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    soundService.playTap();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    soundService.playTap();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    soundService.playTap();
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    soundService.playTap();
    setDisplay(String(parseFloat(display) * -1));
  };

  const inputPercent = () => {
    soundService.playTap();
    setDisplay(String(parseFloat(display) / 100));
  };

  const performOperation = (nextOp: string) => {
    soundService.playTap();
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      if (operation === '+') newValue = currentValue + inputValue;
      else if (operation === '−') newValue = currentValue - inputValue;
      else if (operation === '×') newValue = currentValue * inputValue;
      else if (operation === '÷') newValue = currentValue / inputValue;

      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col justify-end pb-8 px-4 select-none">
      {/* Calculator Display */}
      <div className="text-right px-4 pb-4">
        <span className="text-6xl font-light tracking-tight font-mono truncate block">
          {display}
        </span>
      </div>

      {/* Calculator Keypad (4 columns) */}
      <div className="grid grid-cols-4 gap-3">
        {/* Row 1 */}
        <button
          onClick={clear}
          className="w-16 h-16 rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors shadow"
        >
          {display !== '0' ? 'C' : 'AC'}
        </button>
        <button
          onClick={toggleSign}
          className="w-16 h-16 rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors shadow"
        >
          ±
        </button>
        <button
          onClick={inputPercent}
          className="w-16 h-16 rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors shadow"
        >
          %
        </button>
        <button
          onClick={() => performOperation('÷')}
          className={`w-16 h-16 rounded-full text-white text-2xl font-medium active:bg-amber-400 transition-colors shadow ${
            operation === '÷' && waitingForOperand ? 'bg-white text-amber-500' : 'bg-amber-500'
          }`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputDigit('7')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          7
        </button>
        <button
          onClick={() => inputDigit('8')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          8
        </button>
        <button
          onClick={() => inputDigit('9')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          9
        </button>
        <button
          onClick={() => performOperation('×')}
          className={`w-16 h-16 rounded-full text-white text-2xl font-medium active:bg-amber-400 transition-colors shadow ${
            operation === '×' && waitingForOperand ? 'bg-white text-amber-500' : 'bg-amber-500'
          }`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputDigit('4')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          4
        </button>
        <button
          onClick={() => inputDigit('5')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          5
        </button>
        <button
          onClick={() => inputDigit('6')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          6
        </button>
        <button
          onClick={() => performOperation('−')}
          className={`w-16 h-16 rounded-full text-white text-2xl font-medium active:bg-amber-400 transition-colors shadow ${
            operation === '−' && waitingForOperand ? 'bg-white text-amber-500' : 'bg-amber-500'
          }`}
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputDigit('1')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          1
        </button>
        <button
          onClick={() => inputDigit('2')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          2
        </button>
        <button
          onClick={() => inputDigit('3')}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          3
        </button>
        <button
          onClick={() => performOperation('+')}
          className={`w-16 h-16 rounded-full text-white text-2xl font-medium active:bg-amber-400 transition-colors shadow ${
            operation === '+' && waitingForOperand ? 'bg-white text-amber-500' : 'bg-amber-500'
          }`}
        >
          +
        </button>

        {/* Row 5: Wide 0, Decimal, Equals */}
        <button
          onClick={() => inputDigit('0')}
          className="col-span-2 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light pl-6 text-left active:bg-neutral-700 shadow"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="w-16 h-16 rounded-full bg-neutral-800 text-white text-2xl font-light active:bg-neutral-700 shadow"
        >
          .
        </button>
        <button
          onClick={() => performOperation('=')}
          className="w-16 h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition-colors shadow"
        >
          =
        </button>
      </div>
    </div>
  );
};
