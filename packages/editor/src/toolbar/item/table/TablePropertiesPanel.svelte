<script lang="ts" module>
  export interface TableData {
    readonly width: string;
    readonly height: string;
    readonly cellSpacing: string;
    readonly cellPadding: string;
    readonly borderStyle: string;
    readonly borderWidth: string;
    readonly borderColor: string;
    readonly backgroundColor: string;
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";
  import ColorField from "./ColorField.svelte";

  let {
    tableData,
    borderPresetColors,
    backgroundPresetColors,
    onSubmit,
    onClose,
  }: {
    tableData: TableData;
    borderPresetColors?: string[];
    backgroundPresetColors?: string[];
    onSubmit: (tableData: TableData) => void;
    onClose: () => void;
  } = $props();

  // svelte-ignore state_referenced_locally (tableData is a one-time snapshot seeded when the modal is mounted)
  let width = $state(tableData.width);
  // svelte-ignore state_referenced_locally (tableData is a one-time snapshot seeded when the modal is mounted)
  let height = $state(tableData.height);
  // svelte-ignore state_referenced_locally (tableData is a one-time snapshot seeded when the modal is mounted)
  let cellSpacing = $state(tableData.cellSpacing);
  // svelte-ignore state_referenced_locally (tableData is a one-time snapshot seeded when the modal is mounted)
  let cellPadding = $state(tableData.cellPadding);
  // svelte-ignore state_referenced_locally (tableData is a one-time snapshot seeded when the modal is mounted)
  let borderStyle = $state(tableData.borderStyle);
  // svelte-ignore state_referenced_locally (tableData is a one-time snapshot seeded when the modal is mounted)
  let borderWidth = $state(tableData.borderWidth);
  // svelte-ignore state_referenced_locally (tableData is a one-time snapshot seeded when the modal is mounted)
  let borderColor = $state(tableData.borderColor);
  // svelte-ignore state_referenced_locally (tableData is a one-time snapshot seeded when the modal is mounted)
  let backgroundColor = $state(tableData.backgroundColor);

  let widthInput: HTMLInputElement;
  $effect(() => {
    widthInput?.focus();
  });

  let self: Modal;
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} bind:this={self}>
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("Table Properties")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="row">
        <div class="form-group col-6 mb-3">
          <label for="table-width" class="form-label">{t("Width")}</label>
          <input
            type="text"
            id="table-width"
            class="form-control"
            bind:value={width}
            bind:this={widthInput}
          />
        </div>
        <div class="form-group col-6 mb-3">
          <label for="table-height" class="form-label">{t("Height")}</label>
          <input type="text" id="table-height" class="form-control" bind:value={height} />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-6 mb-3">
          <label for="table-cell-spacing" class="form-label">{t("Cell Spacing")}</label>
          <input
            type="text"
            id="table-cell-spacing"
            class="form-control"
            bind:value={cellSpacing}
          />
        </div>
        <div class="form-group col-6 mb-3">
          <label for="table-cell-padding" class="form-label">{t("Cell Padding")}</label>
          <input
            type="text"
            id="table-cell-padding"
            class="form-control"
            bind:value={cellPadding}
          />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-6 mb-3">
          <label for="table-border-style" class="form-label">{t("Border Style")}</label>
          <select id="table-border-style" class="form-control" bind:value={borderStyle}>
            <option value="">{t("None")}</option>
            <option value="solid">{t("Solid")}</option>
            <option value="dashed">{t("Dashed")}</option>
            <option value="dotted">{t("Dotted")}</option>
            <option value="double">{t("Double")}</option>
            <option value="groove">{t("Groove")}</option>
            <option value="ridge">{t("Ridge")}</option>
            <option value="inset">{t("Inset")}</option>
            <option value="outset">{t("Outset")}</option>
            <option value="hidden">{t("Hidden")}</option>
          </select>
        </div>
        <div class="form-group col-6 mb-3">
          <label for="table-border-width" class="form-label">{t("Border Width")}</label>
          <input
            type="text"
            id="table-border-width"
            class="form-control"
            bind:value={borderWidth}
          />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-6 mb-3">
          <label for="table-border-color" class="form-label">{t("Border Color")}</label>
          <ColorField
            id="table-border-color"
            bind:value={borderColor}
            colors={borderPresetColors}
          />
        </div>
        <div class="form-group col-6 mb-3">
          <label for="table-background-color" class="form-label">{t("Background Color")}</label>
          <ColorField
            id="table-background-color"
            bind:value={backgroundColor}
            colors={backgroundPresetColors}
          />
        </div>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({
            width,
            height,
            cellSpacing,
            cellPadding,
            borderStyle,
            borderWidth,
            borderColor,
            backgroundColor,
          });
          close();
        }}
      >
        {t("Insert")}
      </button>
      <button
        type="button"
        title={t("Cancel (x)")}
        class="cancel action button mt-close-dialog btn btn-default"
        onclick={close}
      >
        {t("Cancel")}
      </button>
    </svelte:fragment>
  </ModalContent>
</Modal>
