<script>
  import { goto } from "$app/navigation";
  import { user } from "$lib/gun.js";
  import ChevronRight from "@svicons/boxicons-regular/chevron-right.svelte";
  import User from "@svicons/boxicons-regular/user.svelte";

  let pages = [
    {
      name: "account",
      icon: User,
    },
  ];
</script>

<svelte:head>
  <title>settings - retrounhash</title>
  <meta name="description" content="Customise retrounhash the way you want" />
</svelte:head>

<div class="center flex-col w-full mt-3">
  {#each pages as p}
    <button
      on:click={() => {
        goto("/settings/" + p.name);
      }}
      class="w-11/12 p-2 flex gap-2 items-center bg-[#ffffff] dark:bg-[#19191a] border border-[#dce1e6] dark:border-[#313131] rounded-md h-auto"
    >
      <svelte:component this={p.icon} width="1.3em" />
      {p.name}
      <div class="ml-auto mr-1">
        <ChevronRight width="1.2em" />
      </div>
    </button>
  {/each}
  <div class="p-2 text-xs w-11/12">
    <button
      class="w-full bg-[#b32b2b] hover:bg-[#811f1f] text-black dark:text-white rounded-md text-sm p-1 px-2 transition-colors duration-300"
      on:click={() => {
        user.leave();
        localStorage.clear();
        location.href = "/";
      }}
    >
      log out
    </button>
  </div>
</div>