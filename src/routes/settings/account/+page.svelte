<script>
  import ChevronRight from "@svicons/boxicons-regular/chevron-right.svelte";
  import { goto } from "$app/navigation";
  import { Check, FolderMinus, Key, TrashAlt } from "@svicons/boxicons-regular";
</script>

<div class="center">
  <div class="flex justify-center gap-2 flex-col w-11/12 mt-3">
    <button
      on:click={() => {
        goto("/settings/account/verification");
      }}
      class="md:w-11/12 lg:w-10/12 p-2 flex gap-2 items-center bg-[#ffffff] dark:bg-[#222222]  rounded-lg h-auto"
    >
      <Check width="1.3em" />
      Get Verified
      <div class="ml-auto mr-1">
        <ChevronRight width="1.2em" />
      </div>
    </button>
    <button
      on:click={() => {
        goto("/settings/account/changepass");
      }}
      class="md:w-11/12 lg:w-10/12 p-2 flex gap-2 items-center bg-[#ffffff] dark:bg-[#222222]  rounded-lg h-auto"
    >
      <Key width="1.3em" />
      Change password
      <div class="ml-auto mr-1">
        <ChevronRight width="1.2em" />
      </div>
    </button>
    <button
      on:click={() => {
        goto("/settings/account/deleteposts");
      }}
      class="md:w-11/12 lg:w-10/12 p-2 flex gap-2 items-center bg-[#ffffff] dark:bg-[#222222]  rounded-lg h-auto"
    >
      <FolderMinus width="1.3em" />
      Delete all posts
      <div class="ml-auto mr-1">
        <ChevronRight width="1.2em" />
      </div>
    </button>
    <button
      on:click={() => {
        goto("/settings/account/delete");
      }}
      class="md:w-11/12 lg:w-10/12 p-2 flex gap-2 items-center bg-[#ffffff] dark:bg-[#222222]  rounded-lg h-auto"
    >
      <TrashAlt width="1.3em" />
      Delete account
      <div class="ml-auto mr-1">
        <ChevronRight width="1.2em" />
      </div>
    </button>
  </div>
</div>
