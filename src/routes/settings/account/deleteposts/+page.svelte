<script>
  import { username } from "$lib/gun";
  import { goto } from "$app/navigation";
  import { db } from "$lib/gun.js";
  import { deleteAllposts, deleteselectiveposts } from "$lib/utils";
  import { BookmarkAltMinus, Key } from "@svicons/boxicons-regular";
  import Loading from "../../../../comp/loading.svelte";

  let password, filter, loadingfilter, loading;

  async function deleteAccount() {
    loading = true;
    db.user().auth($username, password, async (e) => {
      if (e.err) {
        alert(e.err);
      } else {
        deleteAllposts(true);
        goto("/");
      }
      loading = false;
    });
  }
</script>

<div class="center">
  <div class="w-11/12 md:w-11/12 lg:w-10/12 mt-3">
    <div class="py-2 text-sm">
      Delete posts with certain characters
      <div class="opacity-60 text-xs">
        delete all posts with include the following words
      </div>
    </div>
    <form
      on:submit|preventDefault={async () => {
        loadingfilter = true;
        await deleteselectiveposts(filter, () => {
          loadingfilter = false;
          goto("/");
        });
      }}
    >
      <div class="p-2 bg-[#dbdcdf] dark:bg-[#414141] rounded-md flex">
        <BookmarkAltMinus width="1.4em" />
        <input type="text" class="hidden" autocomplete="username" />
        <input
          bind:value={filter}
          type="text"
          class="w-9/12 bg-transparent pl-2"
          placeholder="matches word in posts"
        />
      </div>
      <div class="py-2">
        <button
          class="bg-red-600 center hover:bg-red-700 transition-all duration-300 disabled:saturate-0 disabled:opacity-75 cursor-pointer text-white rounded-lg h-7 px-5"
          disabled={filter == "" || filter == undefined || loadingfilter}
        >
          {#if loadingfilter}
            <div class="m-2">
              <Loading />
            </div>
          {:else}
            delete selective
          {/if}
        </button>
      </div>
    </form>

    <div class="py-2">
      Delete all posts
      <div class="opacity-60 text-xs">this is irreversible</div>
    </div>
    <form
      on:submit|preventDefault={() => {
        loading = true;
        deleteAccount();
      }}
    >
      <div class="p-2 bg-[#dbdcdf] dark:bg-[#414141] rounded-md flex">
        <Key width="1.4em" />
        <input type="text" class="hidden" autocomplete="username" />
        <input
          autocomplete="current-password"
          bind:value={password}
          type="password"
          class="w-9/12 bg-transparent pl-2"
          placeholder="Enter your password"
        />
      </div>
      <div class="py-2">
        <button
          class="bg-red-600 center hover:bg-red-700 transition-all duration-300 disabled:saturate-0 disabled:opacity-75 cursor-pointer text-white rounded-lg h-7 px-5"
          disabled={password == "" || password == undefined || loading}
        >
          {#if loading}
            <div class="m-2">
              <Loading />
            </div>
          {:else}
            delete
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
