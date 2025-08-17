<script module lang="ts">
  const ignoredAttributes: Set<string> = new Set(["mtIndent", "pmSlice"]);
</script>

<script lang="ts">
  import { t } from "../../i18n";
  import { Modal, ModalContent } from "@movabletype/svelte-components";

  let {
    htmlDocument,
    onSubmit,
    onClose,
  }: {
    htmlDocument: Document;
    onSubmit: (htmlDocument: Document) => void;
    onClose: () => void;
  } = $props();

  let insertButton: HTMLElement;

  const dataAttributes: {
    name: string;
    checked: boolean;
  }[] = $state([]);
  htmlDocument.body.querySelectorAll<HTMLElement>("*").forEach((e) => {
    const data = e.dataset;
    for (const key in data) {
      if (ignoredAttributes.has(key)) {
        continue;
      }
      if (!dataAttributes.find((d) => d.name === key)) {
        dataAttributes.push({ name: key, checked: false });
      }
    }
  });
  const styleAttributes: {
    name: string;
    checked: boolean;
  }[] = $state([]);
  htmlDocument.body.querySelectorAll<HTMLElement>("[style]").forEach((e) => {
    const styleAttr = e.getAttribute("style");
    if (!styleAttr) return;

    const properties = styleAttr
      .split(";")
      .map((prop) => prop.trim())
      .filter((prop) => prop)
      .map((prop) => {
        const [name] = prop.split(":");
        return name.trim();
      });

    properties.forEach((prop) => {
      if (!styleAttributes.find((s) => s.name === prop)) {
        styleAttributes.push({ name: prop, checked: true });
      }
    });
  });

  function toggleAll() {
    const checked = styleAttributes.every((s) => s.checked);
    if (checked) {
      styleAttributes.forEach((s) => (s.checked = false));
    } else {
      styleAttributes.forEach((s) => (s.checked = true));
    }
  }

  function toggleAllData() {
    const checked = dataAttributes.every((d) => d.checked);
    if (checked) {
      dataAttributes.forEach((d) => (d.checked = false));
    } else {
      dataAttributes.forEach((d) => (d.checked = true));
    }
  }

  $effect(() => {
    if (insertButton && dataAttributes.length === 0 && styleAttributes.length === 0) {
      insertButton.click();
    }
  });

  let self: Modal;

  // eslint-disable-next-line svelte/no-unused-svelte-ignore
  // svelte-ignore non_reactive_update FIXME:
  let close: () => void;
</script>

<Modal on:close={onClose} bind:this={self}>
  <ModalContent bind:close>
    <svelte:fragment slot="title">{t("Paste as HTML")}</svelte:fragment>
    <svelte:fragment slot="body">
      <div class="html-modal-modal-content">
        {#if dataAttributes.length > 0}
          <h4>{t("Data attributes")}</h4>
          <div class="help-text">
            {t(
              "Select the data attributes you want to keep in the pasted HTML. Unselected attributes will be removed."
            )}
          </div>
          <ul>
            {#each dataAttributes as attribute (attribute.name)}
              <li>
                <label>
                  <input type="checkbox" name={attribute.name} bind:checked={attribute.checked} />
                  data-{attribute.name}
                </label>
              </li>
            {/each}
          </ul>
          <div class="mt-checkbox-all">
            <label>
              <input
                type="checkbox"
                name="all"
                onchange={toggleAllData}
                checked={dataAttributes.every((d) => d.checked)}
              />
              {t("Select All")}
            </label>
          </div>
        {/if}
        {#if styleAttributes.length > 0}
          <h4>{t("Properties for style attributes")}</h4>
          <div class="help-text">
            {t(
              "Select the properties you want to keep in the pasted HTML. Unselected properties will be removed."
            )}
          </div>
          <ul>
            {#each styleAttributes as attribute (attribute.name)}
              <li>
                <label>
                  <input type="checkbox" name={attribute.name} bind:checked={attribute.checked} />
                  {attribute.name}
                </label>
              </li>
            {/each}
          </ul>
          <div class="mt-checkbox-all">
            <label>
              <input
                type="checkbox"
                name="all"
                onchange={toggleAll}
                checked={styleAttributes.every((s) => s.checked)}
              />
              {t("Select All")}
            </label>
          </div>
        {/if}
      </div>
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <button
        type="button"
        title={t("Insert (s)")}
        class="action primary button btn btn-primary"
        bind:this={insertButton}
        onclick={() => {
          const disabledAttributes = styleAttributes.filter((s) => !s.checked).map((s) => s.name);
          const doc = htmlDocument.cloneNode(true) as Document;
          doc.querySelectorAll<HTMLElement>("[style]").forEach((e) => {
            const style = e.style;
            for (let i = style.length - 1; i >= 0; i--) {
              const p = style[i];
              if (disabledAttributes.includes(p)) {
                style.removeProperty(p);
              }
            }
          });

          const disabledData = dataAttributes.filter((d) => !d.checked).map((d) => d.name);
          doc.body.querySelectorAll<HTMLElement>("*").forEach((e) => {
            const data = e.dataset;
            for (const key in data) {
              if (disabledData.includes(key)) {
                delete e.dataset[key];
              }
            }
          });

          onSubmit(doc);
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

<style>
  .mt-checkbox-all {
    margin-top: 0.5rem;
  }

  .help-text {
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
    color: #666;
  }

  h4 {
    font-weight: bold;
    margin-top: 1.5rem;
  }

  h4:first-child {
    margin-top: 0;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  .html-modal-modal-content {
    overflow-y: auto;
    max-height: 580px;
  }
</style>
