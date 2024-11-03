<script lang="ts">
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    url,
    text,
    title,
    target,
    onSubmit,
    onClose,
  }: {
    url: string;
    text: string;
    title: string;
    target: "_self" | "_blank";
    onSubmit: (data: any) => void;
    onClose: () => void;
  } = $props();

  let self: Modal;
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} bind:this={self}>
  <ModalContent bind:close>
    <svelte:fragment slot="title">{window.trans("Insert Link")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <label for="link-url" class="form-label">{window.trans("Link URL")}</label>
        <input type="url" id="link-url" class="form-control" bind:value={url} />
      </div>
      <div class="form-group mb-3">
        <label for="link-text" class="form-label">{window.trans("Link Text")}</label>
        <input type="text" id="link-text" class="form-control" bind:value={text} />
      </div>
      <div class="form-group mb-3">
        <label for="link-title" class="form-label">{window.trans("Title")}</label>
        <input type="text" id="link-title" class="form-control" bind:value={title} />
      </div>
      <div class="form-group mb-3">
        <label for="link-target" class="form-label">{window.trans("Link Target")}</label>
        <select id="link-target" class="form-select" bind:value={target}>
          <option value="_self">{window.trans("LINK_TARGET_SELF")}</option>
          <option value="_blank">{window.trans("LINK_TARGET_BLANK")}</option>
        </select>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={window.trans("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit({ url, text, title, target });
          close();
        }}
      >
        {window.trans("Insert")}
      </button>
      <button
        type="button"
        title={window.trans("Cancel (x)")}
        class="cancel action button mt-close-dialog btn btn-default"
        onclick={close}
      >
        {window.trans("Cancel")}
      </button>
    </svelte:fragment>
  </ModalContent>
</Modal>
