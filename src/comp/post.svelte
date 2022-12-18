<script>
  import Menu from "@svicons/boxicons-regular/dots-horizontal-rounded.svelte";
  import Report from "@svicons/boxicons-regular/flag.svelte";
  import X from "@svicons/boxicons-regular/x-circle.svelte";

  let option;
  export let data;
</script>

<div
  class="w-11/12 p-3 bg-[#19191a] border border-[#313131] rounded-md h-auto flex flex-col"
>
  {#if option}
    <div class="text-sm font-thin flex items-center justify-center">
      <button
        class="flex px-2 py-1 rounded-md bg-[#272626] gap-1 justify-center items-center"
      >
        <span class="text-red-600">
          <Report width="1.2em" />
        </span>
        report
      </button>
      <button
        on:click={() => {
          option = false;
        }}
        class="p-1 bg-[#272626] rounded-md my-auto ml-auto"
      >
        <X width="1.2em" />
      </button>
    </div>
  {:else}
    <div>
      <div class="text-xs break-all">
        {data.content}
      </div>
      <div class="flex items-center mb-1 mt-2">
        <div class="flex w-full">
          <img
            src="/favicon.png"
            class="h-6 w-6 aspect-square rounded-md m-1"
            alt=""
          />
          <div class="flex flex-col justify-center pl-1">
            <span class="text-xs m-auto ml-0"> name </span>
            <span class="text-[9px] text-opacity-60 my-auto"> 2 days ago </span>
          </div>
          <div class="m-auto mr-2 flex justify-center items-center">
            <button
              on:click={() => {
                option = true;
              }}
            >
              <Menu width="1.2em" />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
