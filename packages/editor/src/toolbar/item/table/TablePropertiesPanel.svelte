<script lang="ts" module>
  export interface TableData {
    readonly width: string;
    readonly height: string;
    readonly cellSpacing: string;
    readonly borderWidth: string;
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
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

  let width = $state(tableData.width);
  let height = $state(tableData.height);
  let cellSpacing = $state(tableData.cellSpacing);
  let borderWidth = $state(tableData.borderWidth);

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
    <svelte:fragment slot="title">{t("Table Properties")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <label for="link-url" class="form-label">{t("Width")}</label>
        <input
          type="text"
          id="table-width"
          class="form-control"
          bind:value={width}
          bind:this={widthInput}
        />
      </div>
      <div class="form-group mb-3">
        <label for="table-height" class="form-label">{t("Height")}</label>
        <input type="text" id="table-height" class="form-control" bind:value={height} />
      </div>
      <div class="form-group mb-3">
        <label for="table-cell-spacing" class="form-label">{t("Cell Spacing")}</label>
        <input type="text" id="table-cell-spacing" class="form-control" bind:value={cellSpacing} />
      </div>
      <div class="form-group mb-3">
        <label for="table-border-width" class="form-label">{t("Border Width")}</label>
        <input type="text" id="table-border-width" class="form-control" bind:value={borderWidth} />
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ width, height, cellSpacing, borderWidth });
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
