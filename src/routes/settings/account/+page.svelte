<script>
  import { db, keys, user } from "$lib/gun.js";
  import { v4 } from "uuid";

  let posts = [];

  user
    .get("posts")
    .map()
    .once((val, uid) => {
      if (val && uid) {
        posts = [
          {
            uid: uid,
            content: val,
          },
          ...posts,
        ];
      }
    });

  async function deleteallposts(override) {
    if (
      confirm("This action is not reversibe! continue?") ||
      override == true
    ) {
      posts.forEach(async (p) => {
        await user.get("posts").get(p.uid).put(null);
      });
      posts = [];
    }
  }

  async function deleteaccount() {
    if (
      confirm(
        "All your data will be deleted and your username will be locked forever! \ndelete account?"
      )
    ) {
      if (
        confirm(
          "Last confirmation before erazing all data and deleting your account.\n proceed?"
        )
      ) {
        await deleteallposts(true).then(async () => {
          await db
            .user()
            .auth($keys, {
              change: String(v4()).replace(/-/g, ""),
            })
            .then(() => {
              user.delete($keys, () => {
                user.leave();
              });
              localStorage.clear();
              sessionStorage.clear();
            });
        });
      }
    }
  }
</script>

<div class="center">
  <div
    class="p-2 w-11/12 border border-dashed center flex-col mt-5 border-red-700 rounded-md"
  >
    <div class="text-[20px] capitalize w-full center">sensitive area</div>
    <button
      on:click={deleteallposts}
      class="px-3 mb-2 bg-yellow-600 text-white rounded-md"
    >
      delete all posts
    </button>
    <button
      on:click={deleteaccount}
      class="px-3 mb-2 bg-[#b32b2b] text-white rounded-md"
    >
      delete account
    </button>
  </div>
</div>
