<script>
  import { username } from "$lib/gun";
  import { goto } from "$app/navigation";
  import { db, keys, user } from "$lib/gun.js";
  import { deleteAllposts } from "$lib/utils";
  import { v4 } from "uuid";
</script>

<div class="center">
  <div
    class="p-2 w-10/12 border border-dashed center flex-col mt-5 border-red-700 rounded-lg"
  >
    <div class="text-[20px] capitalize w-full center">sensitive area</div>
    <button
      on:click={async () => {
        await deleteAllposts();
      }}
      class="px-3 mb-2 bg-[#e4cd81] rounded-lg"
    >
      delete all posts
    </button>
    <button
      on:click={async () => {
        if (
          confirm(
            "delete account and all associated data?\nThis is the last confirmation."
          )
        ) {
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
      }}
      class="px-3 mb-2 bg-[#a13242] text-white rounded-lg"
    >
      delete account
    </button>
  </div>
</div>
