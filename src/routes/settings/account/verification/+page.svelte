<script>
  import { keys } from "$lib/gun";
  import { info } from "$lib/info";
  import { Check } from "@svicons/boxicons-regular";
  export let data;
</script>

<div class="center">
  <div class="w-full md:w-11/12 lg:w-10/12 mt-3 mx-3">
    <div class="py-2 w-full center h-10 text-lg">Get Verified</div>
    {#if data.isVerified}
      <div class="flex gap-2 p-2 text-sm center">
        <Check width="1.4em" />
        <span>
          you are already verified as {data.type}!
        </span>
      </div>
    {:else}
      <div class="flex gap-2 p-2 text-sm">
        by getting verified, you will get a check on your profile indicating
        that you have verified your account.
      </div>
      <div class="pl-2 w-11/12 flex flex-col justify-start">
        <button
          on:click={() => {
            let openwin = open(`${info.api}/?p=${$keys.pub}`);
            
          }}
          class="flex cursor-pointer center w-fit mt-2 dark:bg-[#d2d4d6] dark:text-black gap-2 transition-all duration-300 text-sm p-1 dark:hover:bg-[#b6b9bb] rounded-lg px-3"
        >
          <Check width="1.2em" /> get verified
        </button>
      </div>
    {/if}
  </div>
</div>
