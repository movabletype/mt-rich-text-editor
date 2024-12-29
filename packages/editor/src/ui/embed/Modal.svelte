<script lang="ts" module>
  export interface EmbedData {
    readonly url: string;
    readonly maxwidth?: number;
    readonly maxheight?: number;
  }
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    embedData,
    onSubmit,
    onClose,
  }: {
    embedData: EmbedData;
    onSubmit: (embedData: EmbedData) => void;
    onClose: () => void;
  } = $props();

  let url = $state(embedData.url);
  let maxwidth = $state(embedData.maxwidth);
  let maxheight = $state(embedData.maxheight);

  let urlInput: HTMLInputElement;
  $effect(() => {
    urlInput?.focus();
  });

  let self: Modal;
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} bind:this={self}>
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("oEmbed")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <label for="embed-url" class="form-label">{t("URL")}</label>
        <input
          type="url"
          id="embed-url"
          class="form-control"
          bind:value={url}
          bind:this={urlInput}
        />
      </div>
      <div class="form-group mb-3">
        <label for="embed-maxwidth" class="form-label">{t("Width")}</label>
        <input type="number" id="embed-maxwidth" class="form-control" bind:value={maxwidth} />
      </div>
      <div class="form-group mb-3">
        <label for="embed-maxheight" class="form-label">{t("Height")}</label>
        <input type="number" id="embed-maxheight" class="form-control" bind:value={maxheight} />
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ url, maxwidth, maxheight });
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
