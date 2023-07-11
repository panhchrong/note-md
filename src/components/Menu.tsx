import { faBars, faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

export default function Menu() {
  const [menu, setMenu] = useState(false);
  const [noteList, setNoteList] = useState([] as any[]);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenu(false);
    }
  }, []);

  const handleNoteReply = useCallback((list: string[]) => {
    setNoteList(list);
  }, []);

  useEffect(() => {
    window.electron
      .send("get-note-list")
      .then((notes) => handleNoteReply(notes));

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.electron.removeAllListeners();
    };
  }, [handleClickOutside, handleNoteReply]);

  const handleNavigate = useCallback(
    (note: any) => {
      navigate(`/view?id=${note}`);
      setMenu(false);
    },
    [navigate]
  );

  return (
    <div className="relative">
      <FontAwesomeIcon
        className="py-2 px-2 hover:bg-[#3b4252]"
        icon={faBars}
        onClick={() => setMenu(!menu)}
      />
      <div
        ref={menuRef}
        className={`fixed top-5 left-0 h-full w-64 z-50 bg-[#2f3541] p-4 shadow-lg transform transition-transform duration-300 ${
          menu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-lg font-semibold mb-2">
          Notes
          <FontAwesomeIcon className="ml-2" icon={faNoteSticky} />
        </h2>
        <hr className="mb-2" />
        <ul>
          {noteList.map((note) => (
            <li
              key={note.title}
              className="py-1 px-2 hover:bg-[#3a4250] cursor-pointer rounded"
              onClick={(e) => handleNavigate(note.title)}
            >
              {note.title.replace(".md", "")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
