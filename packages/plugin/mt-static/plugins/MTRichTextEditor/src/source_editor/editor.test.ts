import SourceEditor from "./editor";

const execCommand = vi.fn();

vi.mock("@movabletype/app", () => ({
  MT: {
    Editor: {
      Source: class {
        getSelectedText = vi.fn(() => "");
      },
    },
    EditorCommand: {
      Source: class {
        setFormat = vi.fn();
        isSupported = vi.fn(() => true);
        execCommand = execCommand;
      },
    },
    EditorManager: {
      register: vi.fn(),
      toMode: vi.fn(),
    },
  },
}));

describe("SourceEditor", () => {
  let editor: SourceEditor;
  const id = "test-editor";

  beforeEach(() => {
    document.body.innerHTML = `<div><textarea id="${id}"></textarea></div>`;
  });

  describe("link", () => {
    it("should set the default target for links: _blank", async () => {
      editor = new SourceEditor({
        id,
        toolbarOptions: {
          link: {
            defaultTarget: "_blank",
          },
        },
      });
      editor.setFormat("0"); // none
      document.querySelector<HTMLElement>(`[title="link"]`)?.click();
      document.querySelector<HTMLButtonElement>(`.btn-primary`)?.click();

      expect(execCommand).toHaveBeenCalledWith("createLink", null, "", {
        text: "",
        title: "",
        target: "_blank",
      });
    });

    it("should set the default target for links: _self", async () => {
      editor = new SourceEditor({
        id,
        toolbarOptions: {
          link: {
            defaultTarget: "_self",
          },
        },
      });
      editor.setFormat("0"); // none
      document.querySelector<HTMLElement>(`[title="link"]`)?.click();
      document.querySelector<HTMLButtonElement>(`.btn-primary`)?.click();

      expect(execCommand).toHaveBeenCalledWith("createLink", null, "", {
        text: "",
        title: "",
        target: "_self",
      });
    });
  });
});
