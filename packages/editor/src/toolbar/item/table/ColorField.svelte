<script lang="ts">
  import { cssColorToHex } from "../../../util/html";

  let {
    id,
    value = $bindable(),
  }: {
    id: string;
    value: string;
  } = $props();

  let picker: HTMLInputElement;
  $effect(() => {
    const hex = cssColorToHex(value);
    if (picker && hex) {
      picker.value = hex;
    }
  });
</script>

<div class="color-field">
  <input type="text" {id} class="form-control" bind:value />
  <input
    type="color"
    bind:this={picker}
    oninput={() => {
      value = picker.value;
    }}
  />
</div>

<style>
  .color-field {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .color-field .form-control {
    flex: 1;
  }
</style>
