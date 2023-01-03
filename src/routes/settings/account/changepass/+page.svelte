<script>
  import { username } from "$lib/gun";
  import { goto } from "$app/navigation";
  import { db, keys, user } from "$lib/gun.js";
  import { deleteAllposts } from "$lib/utils";
  import { v4 } from "uuid";
  import { Check, Key } from "@svicons/boxicons-regular";
  import Loading from "../../../../comp/loading.svelte";
  let loading, done;
  let password, new_password;

  async function deleteAccount() {
    loading = true;
    db.user().auth($username, password, async (e) => {
      if (e.err) {
        alert(e.err);
      } else {
        await db.user().auth($keys, {
          change: new_password,
        });
        done = true;
        setTimeout(() => {
          goto("/");
        }, 2000);
      }
      loading = false;
    });
  }
</script>

<div class="center">
  <div class="w-11/12 md:w-11/12 lg:w-10/12 mt-3">
    <div class="py-2">Old Password</div>
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
          placeholder="Enter old password"
        />
      </div>
      <div class="py-2">New Password</div>
      <div class="p-2 bg-[#dbdcdf] dark:bg-[#414141] rounded-md flex">
        <Key width="1.4em" />
        <input type="text" class="hidden" autocomplete="username" />
        <input
          autocomplete="new-password"
          bind:value={new_password}
          type="password"
          class="w-9/12 bg-transparent pl-2"
          placeholder="Enter new password"
        />
      </div>
      <div class="py-2">
        <button
          class="bg-blue-600 center hover:bg-blue-700 transition-all duration-300 disabled:saturate-0 disabled:opacity-75 cursor-pointer text-white rounded-lg h-7 px-5"
          disabled={password == "" || password == undefined || loading}
        >
          {#if loading}
            <div class="m-2">
              <Loading />
            </div>
          {:else if done}
            <Check width="1.3em" />
          {:else}
            change
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
