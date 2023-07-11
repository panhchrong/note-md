import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { SettingContext } from "..";

export default function NameMenu({
  name = Date.now() + "-note",
  setClose,
  content,
}: {
  name?: string;
  setClose: any;
  content: string;
}) {
  const [inputValue, setInputValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const setting = useContext(SettingContext);

  const handleSave = () => {
    window.electron
      .send("save-note-content", {
        isNewNote: true,
        name: inputValue,
        content: content,
      })
      .then((payload) => navigate(`/view?id=${payload.name}.md`));
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }

    return () => {
      window.electron.removeAllListeners();
    };
  }, []);

  const handleInput = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      setClose(false);
    }
  };
  return (
    <div className="floating-form fixed top-0 left-0 w-full h-full flex items-center justify-center">
      <div
        className="p-4 rounded shadow-lg"
        style={{ backgroundColor: setting.secondary }}
      >
        <div className="mb-2 flex items-center space-x-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium"
            style={{ color: setting.text }}
          >
            Name
          </label>
          <input
            ref={inputRef}
            id="name"
            type="text"
            value={inputValue}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="mt-1block w-full border-0 border-b-2 focus:ring-0"
            style={{
              backgroundColor: setting.secondary,
              color: setting.text,
              borderColor: setting.primary,
            }}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 mr-2"
            style={{
              color: setting.text,
            }}
            onClick={() => setClose(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-md hover:shadow-lg text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ color: setting.text, backgroundColor: setting.primary }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
