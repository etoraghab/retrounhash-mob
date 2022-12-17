<script>
  import "./styles.css";
  import Home from "@svicons/boxicons-regular/home.svelte";
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Settings from "@svicons/boxicons-regular/cog.svelte";
  import Message from "@svicons/boxicons-regular/message-alt.svelte";
  import { db, user } from "$lib/gun";
</script>

<div class="flex h-screen bg-[#141414] text-white text-opacity-75">
  <div
    class="h-full w-12 flex flex-col gap-2 bg-[#19191a] text-white text-opacity-70"
  >
    <div class="mx-auto mt-3 text-white text-opacity-70">
      <img
        class="w-5 rounded-md h-auto aspect-square "
        src="/assets/logo.svg"
        alt=""
      />
    </div>
    <a href="/" class="mx-auto mt-2 p-2 rounded-md bg-[#202020]">
      <Home width="1.2em" />
    </a>
    <a href="/search" class="mx-auto mt-2 p-2 rounded-md bg-[#202020]">
      <Search width="1.2em" />
    </a>
    <a href="/dm" class="mx-auto mt-2 p-2 rounded-md bg-[#202020]">
      <Message width="1.2em" />
    </a>
    <div class="mx-auto mt-auto mb-3 p-2 rounded-md bg-[#202020]">
      <Settings width="1.2em" />
    </div>
  </div>
  <div class="w-full h-full">
    {#if user.is}
      <slot />
    {:else}
      <div class="w-full h-full flex justify-center items-center">
        <div>
          <input type="text">
        </div>
      </div>
    {/if}
  </div>
</div>
