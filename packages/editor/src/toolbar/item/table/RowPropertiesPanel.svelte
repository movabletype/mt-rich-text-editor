<script lang="ts" module>
  export interface RowData {
    readonly element: string;
  }
</script>

<script lang="ts">
  import { t } from "../../../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    rowData,
    onSubmit,
    onClose,
  }: {
    rowData: RowData;
    onSubmit: (rowData: RowData) => void;
    onClose: () => void;
  } = $props();

  let element = $state(rowData.element);

  let elementInput: HTMLSelectElement;
  $effect(() => {
    elementInput?.focus();
  });

  let self: Modal;
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} bind:this={self}>
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("Row Properties")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <label for="element" class="form-label">{t("Row type")}</label>
        <select id="element" class="form-control" bind:value={element} bind:this={elementInput}>
          <option value="tbody">{t("Row")}</option>
          <option value="thead">{t("Header row")}</option>
        </select>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ element });
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
