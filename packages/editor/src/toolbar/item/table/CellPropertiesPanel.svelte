<script lang="ts" module>
  export interface CellData {
    readonly width: string;
    readonly height: string;
    readonly element: string;
    readonly scope: string;
    readonly horizontalAlign: string;
    readonly verticalAlign: string;
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    cellData,
    onSubmit,
    onClose,
  }: {
    cellData: CellData;
    onSubmit: (cellData: CellData) => void;
    onClose: () => void;
  } = $props();

  let width = $state(cellData.width);
  let height = $state(cellData.height);
  let element = $state(cellData.element);
  let scope = $state(cellData.scope);
  let horizontalAlign = $state(cellData.horizontalAlign);
  let verticalAlign = $state(cellData.verticalAlign);

  let widthInput: HTMLInputElement;
  $effect(() => {
    widthInput?.focus();
  });

  let self: Modal;
  // eslint-disable-next-line svelte/no-unused-svelte-ignore
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} bind:this={self}>
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("Cell Properties")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <label for="width" class="form-label">{t("Width")}</label>
        <input
          type="text"
          id="width"
          class="form-control"
          bind:value={width}
          bind:this={widthInput}
        />
      </div>
      <div class="form-group mb-3">
        <label for="width" class="form-label">{t("Height")}</label>
        <input type="text" id="height" class="form-control" bind:value={height} />
      </div>
      <div class="form-group mb-3">
        <label for="element" class="form-label">{t("Cell type")}</label>
        <select id="element" class="form-control" bind:value={element}>
          <option value="td">{t("Cell")}</option>
          <option value="th">{t("Header cell")}</option>
        </select>
      </div>
      <div class="form-group mb-3">
        <label for="scope" class="form-label">{t("Scope")}</label>
        <select id="scope" class="form-control" bind:value={scope}>
          <option value="">{t("None")}</option>
          <option value="row">{t("Row")}</option>
          <option value="col">{t("Column")}</option>
          <option value="rowgroup">{t("Row group")}</option>
          <option value="colgroup">{t("Column group")}</option>
        </select>
      </div>
      <div class="form-group mb-3">
        <label for="horizontalAlign" class="form-label">{t("Horizontal align")}</label>
        <select id="horizontalAlign" class="form-control" bind:value={horizontalAlign}>
          <option value="">{t("None")}</option>
          <option value="left">{t("HORIZONTAL_ALIGN_LEFT")}</option>
          <option value="center">{t("HORIZONTAL_ALIGN_CENTER")}</option>
          <option value="right">{t("HORIZONTAL_ALIGN_RIGHT")}</option>
          <option value="justify">{t("HORIZONTAL_ALIGN_JUSTIFY")}</option>
        </select>
      </div>
      <div class="form-group mb-3">
        <label for="verticalAlign" class="form-label">{t("Vertical align")}</label>
        <select id="verticalAlign" class="form-control" bind:value={verticalAlign}>
          <option value="">{t("None")}</option>
          <option value="top">{t("VERTICAL_ALIGN_TOP")}</option>
          <option value="middle">{t("VERTICAL_ALIGN_MIDDLE")}</option>
          <option value="bottom">{t("VERTICAL_ALIGN_BOTTOM")}</option>
        </select>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ width, height, element, scope, horizontalAlign, verticalAlign });
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
