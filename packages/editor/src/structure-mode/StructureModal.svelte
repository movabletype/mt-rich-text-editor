<script lang="ts" module>
  export interface StructureData {
    readonly id: string;
    readonly className: string;
    readonly style: string;
  }
</script>

<script lang="ts">
  import { t } from "../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    structureData,
    onSubmit,
    onClose,
  }: {
    structureData: StructureData;
    onSubmit: (structureData: StructureData) => void;
    onClose: () => void;
  } = $props();

  let id = $state(structureData.id);
  let className = $state(structureData.className);
  let style = $state(structureData.style);

  let idInput: HTMLInputElement;
  $effect(() => {
    idInput?.focus();
  });

  let self: Modal;
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} bind:this={self}>
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("Edit attributes")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <label for="structure-id" class="form-label">{t("ID")}</label>
        <input
          type="text"
          id="structure-id"
          class="form-control"
          bind:value={id}
          bind:this={idInput}
        />
      </div>
      <div class="form-group mb-3">
        <label for="structure-class-name" class="form-label">{t("Class name")}</label>
        <input type="text" id="structure-class-name" class="form-control" bind:value={className} />
      </div>
      <div class="form-group mb-3">
        <label for="structure-style" class="form-label">{t("Style")}</label>
        <input type="text" id="structure-style" class="form-control" bind:value={style} />
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ id, className, style });
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
