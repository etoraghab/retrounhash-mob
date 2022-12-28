<script>
  import { page } from "$app/stores";
</script>

<h1 class="center h-full center text-xl font-thin">{$page.status}: {$page.error.message}</h1>
