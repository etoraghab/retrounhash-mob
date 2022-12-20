<script>
  import { user } from "$lib/gun.js";
</script>

<svelte:head>
  <title>settings - retrounhash</title>
  <meta name="description" content="Customise retrounhash the way you want" />
</svelte:head>

<div class="flex justify-center items-center w-full mt-3">
  <div class="text-xl w-11/12">
    Account
    <div class="p-2 text-xs">
      <button
        class="bg-[#b32b2b] hover:bg-[#811f1f] text-white rounded-md text-sm p-1 px-2 transition-colors duration-300"
        on:click={() => {
          user.leave();
          localStorage.clear();
          location.href = "/";
        }}
      >
        sign out
      </button>
    </div>
  </div>
</div>
