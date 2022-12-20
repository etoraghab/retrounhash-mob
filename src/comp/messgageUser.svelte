<script>
  import { user } from "$lib/gun";
  import { goto } from "$app/navigation";
  import TrashAlt from "@svicons/boxicons-regular/trash-alt.svelte";
  export let f;
  let deleted = false;
</script>

{#if !deleted}
  <div
    class="w-full p-1 bg-[#19191a] border border-[#313131] rounded-md h-auto flex flex-col"
  >
    <div>
      <div class="flex items-center">
        <div class="flex w-full">
          <button
            on:click={() => {
              goto(`/dm/${f.username}`);
            }}
          >
            <img
              src={f.avatar}
              class="h-6 w-6 aspect-square object-cover rounded-md m-1"
              alt=""
            />
          </button>
          <div class="flex w-full justify-center pl-1">
            <button
              class="text-xs m-auto ml-0"
              on:click={() => {
                goto(`/dm/${f.username}`);
              }}
            >
              {f.username}
            </button>
            <span class="ml-auto mr-2 my-auto text-red-500">
              <button
                class="flex justify-center items-center"
                on:click={() => {
                  user.get("canMessage").get(f.pub).put(false);
                  deleted = true;
                }}
              >
                <TrashAlt width="1.2em" />
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
