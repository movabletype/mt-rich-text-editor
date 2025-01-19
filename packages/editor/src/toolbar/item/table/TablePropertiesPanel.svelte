<script lang="ts" module>
  export interface TableData {
    readonly width: string;
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
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ width });
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
