<script lang="ts">
  import type {} from "@movabletype/mt-rich-text-editor/mt-rich-text-editor";

  const { textarea } = $props<{
    textarea: HTMLTextAreaElement;
  }>();

  const embedDefaultParams: {
    maxwidth?: number;
    maxheight?: number;
  } = $state(JSON.parse(textarea.value));

  $effect(() => {
    textarea.value = JSON.stringify(embedDefaultParams);
  });

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    embedDefaultParams[target.name as keyof typeof embedDefaultParams] = Number(target.value);
  };
</script>

<div class="mt-rich-text-editor-embed-default-params-settings">
  <div class="mt-rich-text-editor-embed-default-params-settings-current">
    <div class="mb-3">
      <label for="maxwidth" class="form-label">{window.trans("Width")}</label>
      <input
        type="number"
        class="form-control"
        id="maxwidth"
        name="maxwidth"
        value={embedDefaultParams.maxwidth}
        oninput={handleChange}
      />
    </div>
    <div class="mb-3">
      <label for="maxheight" class="form-label">{window.trans("Height")}</label>
      <input
        type="number"
        class="form-control"
        id="maxheight"
        name="maxheight"
        value={embedDefaultParams.maxheight}
        oninput={handleChange}
      />
    </div>
  </div>
</div>

<style>
  .mt-rich-text-editor-embed-default-params-settings {
    margin-top: 1rem;
  }
</style>
