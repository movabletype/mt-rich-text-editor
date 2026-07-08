<script lang="ts" module>
  export interface TableData {
    readonly width: string;
    readonly height: string;
    readonly cellSpacing: string;
    readonly borderWidth: string;
    readonly borderStyle: string;
    readonly borderColor: string;
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { cssColorToHex } from "../../../util/html";
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    tableData,
    onSubmit,
    onClose,
  }: {
    tableData: TableData;
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
  let borderWidth = $state(tableData.borderWidth);
  let borderStyle = $state(tableData.borderStyle);
  let borderColor = $state(tableData.borderColor);

  let widthInput: HTMLInputElement;
  $effect(() => {
    widthInput?.focus();
  });

  let borderColorPicker: HTMLInputElement;
  $effect(() => {
    const hex = cssColorToHex(borderColor);
    if (borderColorPicker && hex) {
      borderColorPicker.value = hex;
    }
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
          <label for="table-border-color" class="form-label">{t("Border Color")}</label>
          <div class="color-field">
            <input
              type="text"
              id="table-border-color"
              class="form-control"
              bind:value={borderColor}
            />
            <input
              type="color"
              bind:this={borderColorPicker}
              oninput={() => {
                borderColor = borderColorPicker.value;
              }}
            />
          </div>
        </div>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ width, height, cellSpacing, borderWidth, borderStyle, borderColor });
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

<style>
  .color-field {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .color-field .form-control {
    flex: 1;
  }
</style>
