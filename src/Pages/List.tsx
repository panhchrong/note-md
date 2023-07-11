import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, {
  useCallback,
  useEffect,
  memo,
  useContext,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import TaskProgress from "../components/TaskProgress";
import { SettingContext } from "..";

function List() {
  const navigation = useNavigate();
  const [notes, setNotes] = useState([]);
  const [hoveringIndex, setHoveringIndex] = useState(-1);

  const setting = useContext(SettingContext);
  const handleNoteReply = useCallback((list: any) => {
    setNotes(list);
  }, []);

  useEffect(() => {
    window.electron
      .send("get-note-list")
      .then((notes) => handleNoteReply(notes));
    return () => {
      window.electron.removeAllListeners();
    };
  }, []);

  const handleClick = useCallback(
    (note: any) => {
      navigation(`/view?id=${note}`);
    },
    [navigation]
  );

  const goToWrite = useCallback(
    (e: any) => {
      navigation("/write");
    },
    [navigation]
  );

  return (
    <React.Fragment>
      <div
        className={`min-h-screen bg-[${setting.primary}] flex flex-col`}
        style={{ backgroundColor: setting.primary }}
      >
        <div className="w-full py-10 px-5">
          <div className="flex justify-between">
            <h1 className="text-4xl font-bold mb-10 text-white ">Notes</h1>
            <FontAwesomeIcon
              className={`text-2xl border cursor-pointer px-5 py-2 rounded-md transition-colors duration-300 ease-in-out hover:shadow-lg`}
              style={{
                background:
                  hoveringIndex === -3 ? setting.secondary : setting.primary,
                borderColor: setting.secondary,
              }}
              onMouseEnter={() => setHoveringIndex(-3)}
              onMouseLeave={() => setHoveringIndex(-1)}
              icon={faPlus}
              onClick={goToWrite}
            />
          </div>
          <ul className="space-y-3">
            {notes.map((note: any, index: number) => (
              <li
                key={note.title}
                className={`p-4 rounded-md border-2 h-36 w-full shadow-md hover:shadow-lg transition duration-200 cursor-pointer`}
                style={{
                  borderColor: setting.secondary,
                  backgroundColor:
                    hoveringIndex === index
                      ? setting.secondary
                      : setting.primary,
                }}
                onMouseOver={(e) => setHoveringIndex(index)}
                onMouseLeave={(e) => setHoveringIndex(-1)}
                onClick={(e: any) => handleClick(note.title)}
              >
                <span className="grid grid-cols-12">
                  <div className="text-3xl mb-4 col-span-10">
                    <p>{note.title.replace(".md", "")}</p>
                    <p className="mt-3 text-sm opacity-30 overflow-hidden">
                      {note.content}
                    </p>
                  </div>
                  <div className="mt-2 col-span-2 grid grid-rows-2">
                    <p>{note.createdDate}</p>
                    <span>
                      {note.tasks.total > 0 && (
                        <TaskProgress
                          total={note.tasks.total}
                          completed={note.tasks.checked}
                        />
                      )}
                    </span>
                  </div>
                </span>
              </li>
            ))}
            <li
              key="create-new-one"
              className="text-2xl border-2 p-4 rounded-md bg-[#3a4250] hover:bg-[#343b48] h-36 w-full shadow-md hover:shadow-lg transition duration-200 cursor-pointer flex items-center justify-center"
              style={{
                borderColor: setting.secondary,
                backgroundColor:
                  hoveringIndex === -2 ? setting.secondary : setting.primary,
              }}
              onMouseOver={(e) => setHoveringIndex(-2)}
              onMouseLeave={(e) => setHoveringIndex(-1)}
              onClick={goToWrite}
            >
              <FontAwesomeIcon icon={faPlus} className="text-2xl" />
            </li>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
}

export default memo(List);
