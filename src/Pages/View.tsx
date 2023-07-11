import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  memo,
  useContext,
} from "react";
import { useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "../App.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { SettingContext } from "..";

function View() {
  const [content, setContent] = useState("");
  const url = useLocation();
  const params = new URLSearchParams(url.search);
  const id = params.get("id");
  const nav = useNavigate();
  const setting = useContext(SettingContext);

  useEffect(() => {
    const handleContentReply = (content: any) => {
      setContent(content);
    };
    window.electron
      .send("get-content", id)
      .then((content) => handleContentReply(content));

    return () => {
      window.electron.removeAllListeners();
    };
  }, [content, id]);

  const lines = content.split("\n");

  useLayoutEffect(() => {
    const inputs = document.getElementsByTagName("input");
    const links = document.getElementsByTagName("button");
    const img = document.getElementsByTagName("img");
    let checkBoxIndex = 0;

    const clickHandle = (e: any) => {
      const element = e.target;
      e.preventDefault();
      window.electron.updateText({
        id: element.id,
        value: element.checked,
        file: id,
      });
    };

    const handleImageClick = (e: any) => {
      const link = document.createElement("a");
      link.href = e.target.src;
      link.download = e.target.alt;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleLinkClick = (e: any) => {
      const link = e.target.innerHTML;
      window.electron.send("open-link", link);
    };

    for (let i = 0; i < lines.length; i++) {
      // if (lines[i].includes("- [ ]") || lines[i].includes("- [x]")) {
      if (/^- \[[x ]\] [^\s].*$/.test(lines[i])) {
        inputs[checkBoxIndex].setAttribute("id", (i + 1).toString());
        inputs[checkBoxIndex].defaultChecked = lines[i].includes("- [ ]")
          ? false
          : true;
        inputs[checkBoxIndex].addEventListener("change", clickHandle);
        checkBoxIndex++;
      }
    }
    if (links) {
      for (let i = 0; i < links.length; i++) {
        if (links[i].id === "links") {
          links[i].addEventListener("click", handleLinkClick);
        }
      }
    }
    if (img) {
      for (let i = 0; i < img.length; i++) {
        img[i].addEventListener("click", handleImageClick);
      }
    }
    return () => {
      for (let i = 0; i < inputs.length; i++) {
        inputs[i].removeEventListener("change", clickHandle);
      }
      for (let i = 0; i < links.length; i++) {
        if (links[i].id === "links")
          links[i].removeEventListener("click", () => handleLinkClick);
      }
      for (let i = 0; i < img.length; i++) {
        img[i].removeEventListener("click", handleImageClick);
      }
    };
  }, [content, lines, id]);

  const edit = useCallback(() => {
    nav(`/write?id=${id}`);
  }, [nav, id]);

  return (
    <React.Fragment>
      <div className="sticky top-0 bg-inherit py-2 flex justify-between">
        <p className="ml-3">{id?.replace(".md", "")}</p>
        <button className="mr-2 focus:outline-none" onClick={edit}>
          <FontAwesomeIcon icon={faPencil} />
        </button>
      </div>
      <div className="markdown-view">
        <MarkdownPreview
          key={content}
          source={content}
          style={{ backgroundColor: setting.secondary, color: setting.text }}
          rehypeRewrite={(node: any, index: any, parent: any) => {
            if (
              node.tagName === "input" &&
              node.properties.type === "checkbox"
            ) {
              delete node.properties.disabled;
              delete node.properties.checked;
            } else if (/h[1-6]/g.test(node.tagName)) node.children.shift();
            else if (node.tagName === "a") {
              node.tagName = "button";
              node.properties.id = "links";
              delete node.properties.href;
            }
          }}
        />
      </div>
    </React.Fragment>
  );
}

export default memo(View);
