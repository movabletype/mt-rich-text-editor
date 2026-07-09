<script lang="ts" module>
  export interface LinkData {
    readonly url: string;
    readonly text: string | undefined;
    readonly title: string;
    readonly target: "_self" | "_blank";
  }
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    linkData,
    onSubmit,
    onClose,
  }: {
    linkData: LinkData;
    onSubmit: (linkData: LinkData) => void;
    onClose: () => void;
  } = $props();

  // svelte-ignore state_referenced_locally (linkData is a one-time snapshot seeded when the modal is mounted)
  let url = $state(linkData.url);
  // svelte-ignore state_referenced_locally (linkData is a one-time snapshot seeded when the modal is mounted)
  let text = $state(linkData.text);
  // svelte-ignore state_referenced_locally (linkData is a one-time snapshot seeded when the modal is mounted)
  let title = $state(linkData.title);
  // svelte-ignore state_referenced_locally (linkData is a one-time snapshot seeded when the modal is mounted)
  let target = $state(linkData.target);

  let urlInput: HTMLInputElement;
  $effect(() => {
    urlInput?.focus();
  });

  // svelte-ignore state_referenced_locally (linkData is a one-time snapshot seeded when the modal is mounted)
  let hasTextValue = linkData.text !== undefined && linkData.text !== "";
  const onLinkTextChange = () => {
    hasTextValue = true;
  };
  $effect(() => {
    if (linkData.text !== undefined && !hasTextValue) {
      text = url;
    }
  });

  let self: Modal;
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} bind:this={self}>
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("Insert Link")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <label for="link-url" class="form-label">{t("Link URL")}</label>
        <input
          type="url"
          id="link-url"
          class="form-control"
          bind:value={url}
          bind:this={urlInput}
        />
      </div>
      {#if linkData.text !== undefined}
        <div class="form-group mb-3">
          <label for="link-text" class="form-label">{t("Link Text")}</label>
          <input
            type="text"
            id="link-text"
            class="form-control"
            bind:value={text}
            onchange={onLinkTextChange}
          />
        </div>
      {/if}
      <div class="form-group mb-3">
        <label for="link-title" class="form-label">{t("Title")}</label>
        <input type="text" id="link-title" class="form-control" bind:value={title} />
      </div>
      <div class="form-group mb-3">
        <label for="link-target" class="form-label">{t("Link Target")}</label>
        <select id="link-target" class="form-select" bind:value={target}>
          <option value="_self">{t("LINK_TARGET_SELF")}</option>
          <option value="_blank">{t("LINK_TARGET_BLANK")}</option>
        </select>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ url, text, title, target });
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
