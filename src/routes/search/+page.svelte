<script>
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Arrow from "@svicons/boxicons-regular/right-arrow-alt.svelte";
  let q;
  

  function search(q) {
    
  }
</script>

<div class="flex justify-center items-center mt-3">
  <div
    class="w-11/12 p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
  >
    <div
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-md"
    >
      <Search width="1.2em" />
    </div>
    <input
      bind:value={q}
      type="text"
      contenteditable="true"
      placeholder="Search"
      class="text-sm font-thin w-full resize-none bg-[#19191a] rounded p-1"
    />
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => {
        search(q);
      }}
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-md"
    >
      <Arrow width="1.2em" />
    </div>
  </div>
</div>
