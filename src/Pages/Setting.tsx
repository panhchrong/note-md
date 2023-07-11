import { useContext, useState } from "react";
import { SettingContext } from "..";
import SplitPane from "../components/SplitPane";
import { ColorResult, SketchPicker } from "react-color";
import { useNavigation } from "react-router-dom";

interface propTypes {
  tab: "" | "theme" | "other";
}

export default function Setting() {
  const setting = useContext(SettingContext);
  const [tab, setTab] = useState<propTypes["tab"]>("");
  return (
    <SplitPane
      leftContent={
        <SettingMenu setTab={setTab} setting={setting} currentTab={tab} />
      }
      rightContent={<SettingContent tab={tab} setTab={setTab} />}
    />
  );
}

const SettingMenu = ({
  setting,
  setTab,
  currentTab,
}: {
  setting: any;
  setTab: any;
  currentTab: string;
}) => {
  const [hoveringIndex, setIndex] = useState(-1);
  const layout = [
    { label: "Theme", tab: "theme" },
    { label: "Others", tab: "other" },
  ];

  return (
    <ul>
      {layout.map((child, index) => (
        <li
          className="cursor-pointer w-full py-1 px-2 hover:shadow-lg rounded-md my-2"
          style={{
            backgroundColor:
              hoveringIndex === index || currentTab === child.tab
                ? setting.secondary
                : setting.primary,
          }}
          key={index}
          onClick={() => setTab(child.tab)}
          onMouseEnter={() => setIndex(index)}
          onMouseLeave={() => setIndex(-1)}
        >
          {child.label}
        </li>
      ))}
    </ul>
  );
};

const SettingContent = ({
  tab,
  setTab,
}: {
  tab: "" | "theme" | "other";
  setTab: any;
}) => {
  return (
    <>
      {tab === "" && <div> . . . </div>}
      {tab === "theme" && <ThemeSetting setTab={setTab} />}
      {tab === "other" && <OtherSetting />}
    </>
  );
};

const ThemeSetting = ({ setTab }: { setTab: any }) => {
  const setting = useContext(SettingContext);
  const [primaryColor, setPrimaryColor] = useState(setting.primary);
  const [secondaryColor, setSecondaryColor] = useState(setting.secondary);
  const [textColor, setTextColor] = useState(setting.text);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [showTextColorPicker, setTextColorPicker] = useState(false);

  const handlePrimaryChangeComplete = (newColor: ColorResult) => {
    setPrimaryColor(newColor.hex);
  };

  const handleTextColor = (newColor: ColorResult) => {
    setTextColor(newColor.hex);
  };

  const handleSecondaryChangeComplete = (newColor: ColorResult) => {
    setSecondaryColor(newColor.hex);
  };

  const saveSetting = () => {
    if (
      primaryColor === setting.primary &&
      secondaryColor === setting.secondary &&
      textColor === setting.text
    )
      return;
    window.electron
      .send("save-setting", {
        primary: primaryColor,
        secondary: secondaryColor,
        text: textColor,
      })
      .then((r) => {
        setTab("");
      });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold space-y-5">Colors</h2>
      <hr className="my-2" style={{ borderColor: setting.secondary }} />
      <div
        className="mt-5 rounded-lg px-3 py-4 grid grid-cols-2 shadow-md"
        style={{ backgroundColor: setting.secondary }}
      >
        <p className="text-lg font-semibold col-span-2 pb-4">Background</p>
        <span className="pr-3">
          <p className="mb-2">Primary</p>
          <div
            className="w-full h-12 rounded-lg cursor-pointer"
            style={{
              backgroundColor: primaryColor,
            }}
            onClick={() => {
              setShowPrimaryPicker(!showPrimaryPicker);
              setShowSecondaryPicker(false);
            }}
          />
          {showPrimaryPicker && (
            <SketchPicker
              className="fixed"
              color={primaryColor}
              onChangeComplete={handlePrimaryChangeComplete}
            />
          )}
        </span>
        <span className="pr-3">
          <p className="mb-2">Secondary</p>
          <div
            className="h-12 cursor-pointer w-full border-white border-2 rounded-lg"
            style={{
              backgroundColor: secondaryColor,
            }}
            onClick={() => {
              setShowSecondaryPicker(!showSecondaryPicker);
              setShowPrimaryPicker(false);
            }}
          />
          {showSecondaryPicker && (
            <SketchPicker
              className="fixed"
              color={secondaryColor}
              onChangeComplete={handleSecondaryChangeComplete}
            />
          )}
        </span>
      </div>
      <div
        className="mt-5 rounded-lg px-3 py-4 grid grid-cols-2 shadow-md"
        style={{ backgroundColor: setting.secondary }}
      >
        <p className="text-lg font-semibold col-span-2 pb-4">Text</p>
        <span
          className="col-span-2 px-3 py-5 border w-full rounded-lg"
          style={{ backgroundColor: setting.primary, color: textColor }}
          onClick={() => setTextColorPicker(!showTextColorPicker)}
        >
          # hey what up world
          {showTextColorPicker && (
            <SketchPicker
              className="fixed overflow-visible"
              color={textColor}
              onChangeComplete={handleTextColor}
            />
          )}
        </span>
      </div>
      <div className="flex justify-end mt-4 space-x-2">
        <button
          className="px-4 py-1 rounded-md shadow-lg focus: outline-none"
          style={{ backgroundColor: setting.secondary }}
          onClick={saveSetting}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

const OtherSetting = () => {
  return <div>Other setting</div>;
};
