<script lang="ts">
  import DOMPurify from "dompurify";
  import { t } from "../../../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";
  import { onMount } from "svelte";

  const purify = DOMPurify(window);

  let {
    boilerplates,
    onSubmit,
    onClose,
  }: {
    boilerplates: {
      title: string;
      url: string;
      description: string;
    }[];
    onSubmit: (text: string) => void;
    onClose: () => void;
  } = $props();

  let selectedBoilerplate: string = $state("");
  let selectedBoilerplateDescription: string = $state("");

  async function updateSelectedBoilerplate(url: string) {
    selectedBoilerplateDescription = boilerplates.find(
      (boilerplate) => boilerplate.url === url
    )?.description || "";
    selectedBoilerplate = await (await fetch(url)).text();
  }

  function onChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedBoilerplate = "";
    updateSelectedBoilerplate(target.value);
  }

  onMount(() => {
    if (boilerplates.length > 0) {
      updateSelectedBoilerplate(boilerplates[0].url);
    }
  });

  // eslint-disable-next-line svelte/no-unused-svelte-ignore
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} size="lg">
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("Insert Boilerplate")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="form-group mb-3">
        <label for="boilerplate_title">{t("Boilerplate")}</label>
        <select id="boilerplate_title" class="form-control" onchange={onChange}>
          {#each boilerplates as boilerplate (boilerplate.url)}
            <option value={boilerplate.url}>{boilerplate.title}</option>
          {/each}
        </select>
        <div class="form-text">{selectedBoilerplateDescription}</div>
      </div>
      <div class="form-group mb-3">
        {#if selectedBoilerplate}
          <label for="boilerplate_text">{t("Text")}</label>
          <div id="boilerplate_text" class="form-control">
            {@html purify.sanitize(selectedBoilerplate)}
          </div>
        {/if}
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        onclick={() => {
          onSubmit(selectedBoilerplate);
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
