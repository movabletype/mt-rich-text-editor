import { toggleFullScreen } from "./full_screen";

describe("full screen", () => {
  let textField: HTMLDivElement;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    document.body.innerHTML = "";

    textField = document.createElement("div");
    textField.id = "text-field";
    document.body.appendChild(textField);

    textarea = document.createElement("textarea");
    textarea.id = "editor";
    textField.appendChild(textarea);
  });

  it("should toggle full screen", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    window.addEventListener = addEventListener;
    window.removeEventListener = removeEventListener;

    toggleFullScreen("editor");
    expect(textField.classList.contains("mt-rich-text-editor-fullscreen")).toBe(true);
    expect(textarea.style.height).toMatch(/^calc\(/);
    expect(addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

    const updateHeightFn = addEventListener.mock.calls[0][1];

    toggleFullScreen("editor");
    expect(textField.classList.contains("mt-rich-text-editor-fullscreen")).toBe(false);
    expect(textarea.style.height).toBe("");
    expect(removeEventListener).toHaveBeenCalledWith("resize", updateHeightFn);
  });

  it("should throw error if textarea not found", () => {
    document.querySelector("#editor")?.remove();
    expect(() => toggleFullScreen("editor")).toThrow("textarea not found: editor");
  });

  it("should throw error if text-field not found", () => {
    document.querySelector("#text-field")!.id = "text-field-2";
    expect(() => toggleFullScreen("editor")).toThrow("parent not found: editor");
  });
});
