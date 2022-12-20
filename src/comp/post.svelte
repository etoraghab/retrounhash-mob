<script>
  import { goto } from "$app/navigation";
  import { user } from "$lib/gun";
  import Menu from "@svicons/boxicons-regular/dots-horizontal-rounded.svelte";
  import Report from "@svicons/boxicons-regular/flag.svelte";
  import Delete from "@svicons/boxicons-regular/trash-alt.svelte";
  import X from "@svicons/boxicons-regular/x.svelte";

  let option;
  export let data;
  let elmUID;
</script>

<div
  bind:this={elmUID}
  class="w-11/12 p-3 bg-[#19191a] border border-[#313131] rounded-md h-auto flex flex-col"
>
  {#if option}
    <div class="text-sm font-thin flex gap-1 items-center justify-center">
      <button
        class="flex px-2 py-1 rounded-md bg-[#292626] gap-1 justify-center items-center"
      >
        <span class="text-red-600">
          <Report width="1.2em" />
        </span>
        report
      </button>
      {#if data.self}
        <button
          class="flex px-2 py-1 rounded-md bg-[#292626] gap-1 justify-center items-center"
          on:click={async () => {
            await user
              .get("posts")
              .get(data.uid)
              .put(null)
              .then(async () => {
                await user
                  .get("searchable")
                  .get(data.uid)
                  .put(null)
                  .then(() => {
                    elmUID.remove();
                  });
              });
          }}
        >
          <span class="text-red-600">
            <Delete width="1.2em" />
          </span>
          delete
        </button>
      {/if}
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
      <div class="text-sm break-words">
        {data.content}
      </div>
      <div class="flex items-center mb-1 mt-2">
        <div class="flex w-full">
          <button
            on:click={() => {
              goto(`/u/${data.name}`);
            }}
          >
            <img
              src={data.avatar}
              class="h-6 w-6 aspect-square object-cover rounded-md m-1"
              alt=""
            />
          </button>
          <div class="flex flex-col justify-center pl-1">
            <span class="text-xs m-auto ml-0">
              {data.name}
            </span>
            <span class="text-[9px] text-opacity-60 my-auto">
              {data.date}
            </span>
          </div>
          <div class="m-auto mr-2 center">
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
