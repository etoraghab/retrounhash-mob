<script>
  import { Pin, UserPlus } from "@svicons/boxicons-regular";
  import { goto } from "$app/navigation";
  import { user } from "$lib/gun";
  import Menu from "@svicons/boxicons-regular/dots-horizontal-rounded.svelte";
  import Report from "@svicons/boxicons-regular/flag.svelte";
  import TrashAlt from "@svicons/boxicons-regular/trash-alt.svelte";
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

  let following;
  user
    .get("following")
    .get(data.pub)
    .once((isFollowing) => {
      following = isFollowing || false;
    });

  // export let pinned;
</script>

<div
  bind:this={elmUID}
  class="w-11/12 p-3 bg-[#ffffff] dark:bg-[#19191a] border border-[#dce1e6] dark:border-[#313131] rounded-md h-auto flex flex-col"
>
  {#if option}
    <div class="flex items-center p-2">
      <div class="flex flex-col gap-1">
        {#if data.self}
          <button
            class="flex text-red-500 gap-1 transition-all duration-300 text-sm p-1 dark:hover:bg-[#474040] hover:bg-[#f2f3f5] rounded-lg my-auto px-3"
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
            <TrashAlt width="1.2em" />
            Delete
          </button>
        {:else}
          <div>
            {#if following}
              <button
                on:click={() => {
                  user.get("following").get(data.pub).put(false);
                  following = false;
                }}
                class="flex gap-1 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg my-auto px-3"
              >
                <UserPlus width="1.2em" />
                Unfollow @{data.name}
              </button>
            {:else}
              <button
                on:click={() => {
                  user.get("following").get(data.pub).put(true);
                  following = true;
                }}
                class="flex gap-1 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg my-auto px-3"
              >
                <UserPlus width="1.2em" />
                Follow @{data.name}
              </button>
            {/if}
          </div>
        {/if}
        <button
          class="flex gap-1 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg my-auto px-3"
        >
          <Report width="1.2em" />
          Report
        </button>
      </div>
      <button
        on:click={() => {
          option = false;
        }}
        class="ml-auto mr-2 mb-auto mt-2 flex gap-1 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg cursor-pointer"
      >
        <X width="1.2em" />
      </button>
    </div>
  {:else}
    <div>
      <div class="text-sm break-words flex gap-1 flex-wrap">
        {@html content}
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
