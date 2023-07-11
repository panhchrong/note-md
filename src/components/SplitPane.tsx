import React, { useContext, useState } from "react";
import { SettingContext } from "..";
import "../App.css";

export default function SplitPane({
  leftContent,
  rightContent,
}: {
  leftContent: any;
  rightContent: any;
}) {
  const setting = useContext(SettingContext);
  const [leftWidth, setLeftWidth] = useState(300);

  const handleMouseMove = (e: any) => {
    setLeftWidth(e.clientX);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex h-screen no-select">
      <div
        className="p-4"
        style={{
          width: leftWidth,
          minWidth: 150,
          backgroundColor: setting.primary,
        }}
      >
        {leftContent}
      </div>

      <div
        className="h-full cursor-col-resize"
        onMouseDown={handleMouseDown}
        style={{ padding: "0 10px" }}
      >
        <div
          className="h-full"
          style={{ width: 3, backgroundColor: setting.secondary }}
        />
      </div>
      <div
        className="p-4 flex-1"
        style={{ backgroundColor: setting.primary, minWidth: "50%" }}
      >
        {rightContent}
      </div>
    </div>
  );
}
