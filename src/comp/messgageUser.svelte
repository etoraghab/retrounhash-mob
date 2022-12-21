<script>
  import { user } from "$lib/gun";
  import { goto } from "$app/navigation";
  import TrashAlt from "@svicons/boxicons-regular/trash-alt.svelte";
  import ChevronRight from "@svicons/boxicons-regular/chevron-right.svelte";
  export let f;
  let deleted = false;
</script>

{#if !deleted}
  <div
    class="w-full p-1 bg-[#ffffff] dark:bg-[#19191a] border border-[#dce1e6] dark:border-[#313131] rounded-md h-auto flex flex-col"
  >
    <button
      on:click={() => {
        goto(`/dm/${f.pub}`);
      }}
    >
      <div class="flex items-center">
        <div class="flex w-full">
          <img
            src={f.avatar}
            class="h-6 w-6 aspect-square object-cover rounded-md m-1"
            alt=""
          />
          <div class="flex w-full justify-center pl-1">
            <button class="text-xs m-auto ml-0">
              {f.username}
            </button>
            <!-- <span class="ml-auto mr-2 my-auto text-red-500">
              <button
                class="center"
                on:click={() => {
                  user.get("canMessage").get(f.pub).put(false);
                  deleted = true;
                }}
              >
                <TrashAlt width="1.2em" />
              </button>
            </span> -->
            <span class="ml-auto mr-2 my-auto">
              <ChevronRight width="1.4em" />
            </span>
          </div>
        </div>
      </div>
    </button>
  </div>
{/if}
