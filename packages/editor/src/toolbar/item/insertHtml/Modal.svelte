<script lang="ts">
  import { t } from "../../../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    onSubmit,
    onClose,
  }: {
    onSubmit: (text: string) => void;
    onClose: () => void;
  } = $props();

  let textarea: HTMLTextAreaElement;
  $effect(() => {
    textarea?.focus();
  });

  let text = $state("");

  // eslint-disable-next-line svelte/no-unused-svelte-ignore
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} size="lg">
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("Source Code")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <textarea
          id="source_text"
          class="form-control"
          style="height: calc(100vh - 240px)"
          aria-label={t("Source Code")}
          bind:value={text}
          bind:this={textarea}
        ></textarea>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit(text);
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
