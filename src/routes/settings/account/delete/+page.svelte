<script>
  import { username } from "$lib/gun";
  import { goto } from "$app/navigation";
  import { db, keys, user } from "$lib/gun.js";
  import { deleteAllposts } from "$lib/utils";
  import { v4 } from "uuid";
  import { Key } from "@svicons/boxicons-regular";
  import Loading from "../../../../comp/loading.svelte";
  let loading;
  async function deleteAccount() {
    loading = true;
    db.user().auth($username, password, async (e) => {
      if (e.err) {
        alert(e.err);
      } else {
        deleteAllposts(true);
        user.get("bio").put(null);
        user.get("link").put(null);
        user.get("avatar").put(null);
        user.get("followersCert").put(null);
        user.get("username").put(null);
        await db.user().auth($keys, {
          change: String(v4()).replace(/-/g, ""),
        });
        // user.delete($keys);
        user.leave();
        keys.set({
          pub: false,
          epub: "",
          epriv: "",
          priv: "",
        });
        localStorage.clear();
        sessionStorage.clear();
        goto("/");
      }
      loading = false;
    });
  }

  let password;
</script>

<div class="center">
  <div class="w-11/12 md:w-11/12 lg:w-10/12 mt-3">
    <div class="py-2">Confirm account deleteion</div>
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
