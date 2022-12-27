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
  let content = data.content.replace(
    /#+([a-zA-Z0-9_]+)/gi,
    '<a href="/search/#$1">#$1</a>'
  );

  import { parse } from "twemoji-parser";
  const entities = parse(content);

  entities.forEach((e) => {
    content = content.replace(
      new RegExp(e.text, "g"),
      `<img src="${e.url}" draggable="false" class="h-3 my-auto selector" alt="" />`
    );
  });
</script>

<div
  bind:this={elmUID}
  class="w-full p-3 border border-[#dce1e6] dark:border-[#424242] bg-[#ffffff] dark:bg-[#222222]  rounded-lg h-auto flex flex-col"
>
  {#if option}
    <div class="text-sm font-thin flex gap-1 items-center justify-center">
      <button
        class="flex px-2 py-1 rounded-lg bg-[#f2f3f5] dark:bg-[#222222] dark:text-white gap-1 justify-center items-center"
      >
        <span class="text-red-600">
          <Report width="1.2em" />
        </span>
        report
      </button>
      {#if data.self}
        <button
          class="flex px-2 py-1 rounded-lg bg-[#f2f3f5] dark:bg-[#222222] dark:text-white gap-1 justify-center items-center"
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
        class="p-1 bg-[#f2f3f5] dark:bg-[#222222] dark:text-white rounded-lg my-auto ml-auto"
      >
        <X width="1.2em" />
      </button>
    </div>
  {:else}
    <div>
      <div class="flex items-center mb-1 mt-2">
        <div class="flex w-full">
          <button
            on:click={() => {
              goto(`/u/${data.name}`);
            }}
          >
            <img
              src={data.avatar}
              class="h-9 w-9 aspect-square object-cover rounded-full m-1"
              alt=""
            />
          </button>
          <div class="flex flex-col justify-center pl-1">
            <span class="text-sm m-auto ml-0">
              {data.name}
            </span>
            <span class="text-[10px] opacity-90 mb-auto">
              {data.date}
            </span>
          </div>
          <div class="m-auto mr-2 center opacity-90">
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
      <div class="text-sm pl-2 p-2 break-words flex gap-1">
        {@html content}
      </div>
    </div>
  {/if}
</div>
