<script>
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Arrow from "@svicons/boxicons-regular/right-arrow-alt.svelte";
  import { db } from "$lib/gun";
  import moment from "moment";
  import Post from "../../comp/post.svelte";
  import { getUserAvatar, getUserName } from "$lib/utils";
  let q;
  let posts = [];

  function search(query) {
    /*db.get("search")
      .get("query")
      .get(`#${q}`)
      .once((map) => {
        Object.entries(map).forEach((e) => {
        });
      });*/

    query.split(" ").forEach((query) => {
      query = query.replace(/ /, "");
      if (!(query.length <= 2)) {
        db.get("search")
          .get("query")
          .get("#" + String(query).toLowerCase())
          .once((post) => {
            Object.entries(post).forEach((e) => {
              if (e[0] !== "_") {
                db.get(String(e[1]).split("/")[0])
                  .get("searchable")
                  .get(String(e[1]).split("/")[2])
                  .once(async (n) => {
                    if (n) {
                      let pub__ = String(e[1]).split("/")[0];
                      let date = new Date(n["_"][">"].content).toUTCString();
                      posts = [
                        {
                          content: n.content,
                          pub: pub__,
                          date: moment(date).calendar(),
                          name: await getUserName(pub__),
                          avatar: await getUserAvatar(pub__),
                          sortDate: n["_"][">"].content,
                        },
                        ...posts,
                      ];
                      console.log(posts);
                    }
                  });
              }
            });
          });
      }
    });
  }

  function removeDUP() {
    let a = posts.filter(
      (v, i, a) =>
        a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i
    );
    posts = a;
    posts.sort(
      (d1, d2) =>
        new Date(d2.sortDate).getTime() - new Date(d1.sortDate).getTime()
    );
  }
  $: posts, removeDUP();
</script>

<div class="flex justify-center items-center mt-3">
  <div
    class="w-11/12 p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
  >
    <div
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-md"
    >
      <Search width="1.2em" />
    </div>
    <input
      bind:value={q}
      type="text"
      contenteditable="true"
      placeholder="Search"
      class="text-sm font-thin w-full resize-none bg-[#19191a] rounded p-1"
    />
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => {
        search(q);
      }}
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-md"
    >
      <Arrow width="1.2em" />
    </div>
  </div>
</div>

<div class="flex flex-col gap-3 justify-start items-center mt-3">
  {#each posts as p}
    <Post data={p} />
  {/each}
</div>
