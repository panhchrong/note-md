import React from "react";

const Circle = ({ total, completed }: { total: number; completed: number }) => {
  const percentage = (completed / total) * 100;
  const circumference = 2 * Math.PI * 10;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <React.Fragment>
      <div className="flex">
        <svg width="30" height="30">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#ccc"
            strokeWidth="2"
            fill="none"
          />
          <circle
            transform="rotate(-90 12 12)"
            cx="12"
            cy="12"
            r="10"
            stroke="#4CAF50"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        {completed} / {total}
      </div>
    </React.Fragment>
  );
};

export default Circle;
