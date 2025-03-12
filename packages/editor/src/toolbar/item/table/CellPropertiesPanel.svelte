<script lang="ts" module>
  export interface CellData {
    readonly width: string;
    readonly element: string;
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
  let element = $state(cellData.element);
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
        <label for="element" class="form-label">{t("Cell type")}</label>
        <select id="element" class="form-control" bind:value={element}>
          <option value="td">{t("Cell")}</option>
          <option value="th">{t("Header cell")}</option>
        </select>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ width, element });
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
