import React, { useContext, useEffect, useRef, useState } from "react";
import CodeMirror, { UseCodeMirror, color } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "../App.css";
import {
  faCheck,
  faList,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { keymap } from "@codemirror/view";
import createTheme from "@uiw/codemirror-themes";
import NameMenu from "../components/NameMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { tags as t } from "@lezer/highlight";
import { SettingContext } from "..";

// const myTheme = createTheme({
//   theme: "dark",
//   settings: {
//     background: "#2f3441",
//     foreground: "#d8dee9",
//     caret: "#d8dee9",
//     selection: "#434c5e",
//     selectionMatch: "#434c5e",
//     gutterBackground: "#3b4252",
//     gutterForeground: "#d8dee9",
//   },
//   styles: [
//     { tag: t.keyword, color: "#5e87b2" },
//     { tag: t.list, color: "rgb(222, 212, 199)" },
//     { tag: t.bracket, color: "#79b0be" },
//     { tag: t.heading, color: "#79b0be" },
//     { tag: t.quote, backgroundColor: "#43535c" },
//     { tag: t.strong, color: "#79b0be" },
//     { tag: t.emphasis, color: "#79b0be" },
//   ] as any,
// });

export default function Write() {
  const [text, setText] = useState("");
  const [tab, setTab] = useState("text");
  const [filename, setFilename] = useState("");
  const [isNewNote, setIsNewNote] = useState(false);
  const [nameMenu, setNameMenu] = useState(false);
  const [storage, setStorage] = useState([] as any[]);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const setting = useContext(SettingContext);
  const location = useLocation();
  const navigate = useNavigate();
  const myTheme = createTheme({
    theme: "dark",
    settings: {
      background: setting.primary,
      foreground: setting.secondary,
    },
    styles: [
      { tag: t.content, color: setting.text },
      { tag: t.blockComment, color: setting.text },
      { tag: t.meta, color: setting.text },
      { tag: t.keyword, color: setting.text },
      { tag: t.variableName, color: setting.text },
      { tag: t.operator, color: setting.text },
      { tag: t.literal, color: setting.text },
      { tag: t.angleBracket, color: setting.text },
      { tag: t.bracket, color: setting.text },
    ] as any,
  });
  let instance: any = useRef<UseCodeMirror>(null);
  const handleImages = (text: string) => {
    const regex: RegExp = /!\[(.*?)\]\((.*?)\)/g;
    const matches: IterableIterator<RegExpMatchArray> = text.matchAll(regex);
    const matchesArray: RegExpMatchArray[] = Array.from(matches);

    let newMarkdownText: string = text;

    for (let i = 0; i < matchesArray.length; i++) {
      const match: RegExpMatchArray = matchesArray[i];
      const altText: string = match[1];
      const dataUrl: string = match[2];
      const truncatedDataUrl: string = dataUrl.substring(0, 20) + "...";

      newMarkdownText = newMarkdownText.replace(`${dataUrl}`, truncatedDataUrl);
      if (storage.filter((v) => v.code === `${altText}`).length < 1) {
        setStorage((pre: any) => [
          ...pre,
          {
            code: `${altText}`,
            data: dataUrl,
            currString: dataUrl.substring(0, 20) + "...",
          },
        ]);
      }
    }
    return newMarkdownText;
  };
  const onDrop = (acceptedFiles: any) => {
    const newDataUris: any[] = [];
    for (const file of acceptedFiles) {
      if (!file.type.startsWith("image/")) {
        continue;
      }
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const dataUri = event.target.result;
        newDataUris.push(dataUri);
        if (newDataUris.length === acceptedFiles.length) {
          for (const dataUri of newDataUris) {
            setText((prevText) =>
              handleImages(`${prevText}\n\n![${file.name}](${dataUri})`)
            );
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    onDrop,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") as string;
    const handleNoteReply = (value: any) => {
      if (!value) return;
      setText(handleImages(value));
      setFilename(id);
    };
    if (id !== null) {
      window.electron
        .send("get-content", id)
        .then((content) => handleNoteReply(content));
      setIsNewNote(false);
      setFilename(id);
    } else setIsNewNote(true);

    return () => {
      window.electron.removeAllListeners();
    };
  }, []);

  const handleButtonClickCheckBox = () => {
    if (instance.current) {
      const cm = instance.current.view;
      const cursor = cm.state.selection.main.head;
      const endOfLine = cm.state.doc.lineAt(cursor).to;
      cm.dispatch({
        changes: {
          from: endOfLine,
          insert: endOfLine === 0 ? "- [ ] " : "\n- [ ] ",
        },
        selection: { anchor: endOfLine + (endOfLine === 0 ? 6 : 7) },
      });
      return true;
    }
    return false;
  };
  const handleButtonClickList = () => {
    if (instance.current) {
      const cm = instance.current.view;
      const cursor = cm.state.selection.main.head;
      const endOfLine = cm.state.doc.lineAt(cursor).to;
      cm.dispatch({
        changes: {
          from: endOfLine,
          insert: endOfLine === 0 ? "- " : "\n- ",
        },
        selection: { anchor: endOfLine + (endOfLine === 0 ? 2 : 3) },
      });
      return true;
    }
    return false;
  };

  const handleSave = () => {
    let fixedText = text;
    for (const img of storage) {
      fixedText = fixedText.replace(
        `![${img.code}](${img.currString})`,
        `![${img.code}](${img.data})`
      );
    }

    if (fixedText) setText(fixedText);

    if (isNewNote) setNameMenu(true);
    else {
      window.electron
        .send("save-note-content", {
          name: filename,
          isNewNote: false,
          content: fixedText || text,
        })
        .then((payload) => navigate(`/view?id=${payload.name}`));
    }
    return true;
  };

  const customKeymap = keymap.of([
    {
      key: "Ctrl-b",
      run: handleButtonClickCheckBox,
    },
    {
      key: "Ctrl-s",
      run: handleSave,
    },
    {
      key: "Ctrl-l",
      run: handleButtonClickList,
    },
  ]);

  const handleChange = (value: string) => {
    setText(handleImages(value));
  };

  document.documentElement.setAttribute("data-color-mode", "dark");

  return (
    <React.Fragment>
      <div
        className="floating-form flex sticky top-0 justify-between border border-[#2f3441] items-center mb-3  "
        style={{ backgroundColor: setting.primary }}
      >
        <div>
          <button
            className="px-4 py-1 border-2 focus:outline-none"
            style={{
              borderColor: setting.secondary,
              backgroundColor:
                tab === "text" ? setting.secondary : setting.primary,
            }}
            onClick={() => setTab("text")}
          >
            Text
          </button>
          <button
            className="px-2 py-1 border-2 border-[#3b4252] focus:outline-none"
            style={{
              borderColor: setting.secondary,
              backgroundColor:
                tab === "preview" ? setting.secondary : setting.primary,
            }}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
        </div>
        <div>
          {tab === "text" && (
            <span>
              <button
                title="Checkbox list Ctrl + B"
                className="px-2 py-1 focus:outline-none "
                style={{
                  backgroundColor:
                    hoverIndex === 1 ? setting.secondary : setting.primary,
                }}
                onMouseOver={(e) => setHoverIndex(1)}
                onMouseLeave={(e) => setHoverIndex(-1)}
                onClick={handleButtonClickCheckBox}
              >
                <FontAwesomeIcon icon={faListCheck} />
              </button>
              <button
                title="List Ctrl + L"
                className="px-2 py-1 focus:outline-none"
                style={{
                  backgroundColor:
                    hoverIndex === 2 ? setting.secondary : setting.primary,
                }}
                onMouseOver={(e) => setHoverIndex(2)}
                onMouseLeave={(e) => setHoverIndex(-1)}
                onClick={handleButtonClickList}
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </span>
          )}
        </div>
        <div>
          <button
            title="Save"
            className="px-2 py-1 focus:outline-none "
            style={{
              backgroundColor:
                hoverIndex === 3 ? setting.secondary : setting.primary,
            }}
            onMouseOver={(e) => setHoverIndex(3)}
            onMouseLeave={(e) => setHoverIndex(-1)}
            onClick={handleSave}
          >
            <FontAwesomeIcon icon={faCheck} />
          </button>
        </div>
      </div>
      <div className="">
        {tab === "text" && (
          <div className="focus:outline-none h-screen" {...getRootProps()}>
            <input
              onClick={(e) => e.preventDefault()}
              className="hidden focus:outline-none"
              {...getInputProps()}
            />
            <CodeMirror
              className="code-mirror-container"
              onClick={(e) => e.preventDefault()}
              value={text}
              basicSetup={{
                lineNumbers: false,
                highlightActiveLineGutter: false,
                foldGutter: false,
                autocompletion: true,
                syntaxHighlighting: true,
              }}
              theme={myTheme}
              extensions={[
                markdown({ base: markdownLanguage, codeLanguages: languages }),
                customKeymap,
              ]}
              onChange={handleChange}
              ref={instance}
            />
          </div>
        )}
        {tab === "preview" && (
          <div className="markdown-view">
            <MarkdownPreview
              source={text}
              style={{ backgroundColor: setting.secondary }}
              rehypeRewrite={(node: any, index: any, parent: any) => {
                if (/h[1-6]/g.test(node.tagName)) node.children.shift();
                else if (node.tagName === "a") {
                  node.tagName = "button";
                  delete node.properties.href;
                } else if (node.tagName === "img") {
                  node.properties.src =
                    storage.filter(
                      (i) => i.code === `${node.properties.alt}`
                    )[0].data || null;
                }
              }}
            />
          </div>
        )}
      </div>
      {nameMenu && (
        <NameMenu
          name={filename || Date.now() + "-note"}
          setClose={setNameMenu}
          content={text}
        />
      )}
    </React.Fragment>
  );
}
