<script lang="ts">
  const {
    icon,
    label,
  }: {
    icon: string;
    label: string;
  } = $props();
</script>

<button>
  <span class="icon">{@html icon}</span>
  <span>{label}</span>
</button>
