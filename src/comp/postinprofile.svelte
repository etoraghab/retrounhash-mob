<script>
  import { user } from "$lib/gun";
  import TrashAlt from "@svicons/boxicons-regular/trash-alt.svelte";

  export let p;
  let deleted = false;
</script>

{#if !deleted}
  <div
    class=" truncate p-1.5 text-sm m-1 bg-[#ffffff] dark:bg-[#222222]  rounded-lg flex h-auto"
  >
    <div class="w-3/4 truncate">
      {p.content}
    </div>
    <div class="ml-auto mr-1 center">
      <button
        class="text-red-500"
        on:click={() => {
          user.get("posts").get(p.uid).put(null);
          deleted = true;
        }}
      >
        <TrashAlt width="1.2em" />
      </button>
    </div>
  </div>
{/if}
