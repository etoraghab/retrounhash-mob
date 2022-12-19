<script>
  import GUN from "gun";
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Arrow from "@svicons/boxicons-regular/right-arrow-alt.svelte";
  import { avatar, db, keys } from "$lib/gun";
  import moment from "moment";
  import Post from "../../comp/post.svelte";
  import { getUserAvatar, usernameGet } from "$lib/utils";
  let q;
  let posts = [];

  function search(query) {
    posts = [];
    query.split(" ").forEach((query) => {
      query = query.replace(/ /, "");
      if (!(query.length <= 2)) {
        db.get("search")
          .get("query")
          .get("#" + String(query).toLowerCase())
          .map()
          .once((post) => {
            db.get(post).once((val) => {
              usernameGet(post.split(/~/)[1].split(/\//)[0]).then(
                (username) => {
                  getUserAvatar(post.split(/~/)[1].split(/\//)[0]).then(
                    (avatar) => {
                      let date = GUN.state.is(val, "content");
                      posts = [
                        {
                          content: val.content,
                          uid: post.split(/~/)[1].split(/\//)[2],
                          avatar: avatar,
                          name: username,
                          date: moment(date).calendar(),
                          sortDate: date,
                          self: post.split(/~/)[1].split(/\//)[0] == $keys.pub ? true : false,
                          pub: post.split(/~/)[1].split(/\//)[0],
                        },
                        ...posts,
                      ];
                    }
                  );
                }
              );
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

<svelte:head>
  <title>search - retrounhash</title>
  <meta
    name="description"
    content="search among various posts, accounts and communities across retrounhash, the decentralized social platform."
  />
</svelte:head>

<div class="flex flex-col gap-3 justify-start items-center mt-3">
  {#each posts as p}
    <Post data={p} />
  {/each}
</div>

<div class="flex justify-center items-center mt-3">
  <div
    class="w-11/12 p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
  >
    <div
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-md"
    >
      <Search width="1.2em" />
    </div>
    <form
      autocomplete="off"
      on:submit|preventDefault={() => {
        search(q);
      }}
      class="flex w-full"
    >
      <input
        bind:value={q}
        type="text"
        contenteditable="true"
        placeholder="Search"
        class="text-sm font-thin w-full resize-none bg-[#19191a] rounded p-1"
      />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button
        on:click={() => {
          search(q);
        }}
        type="submit"
        class="h-6 flex justify-center items-center w-6 m-auto aspect-square object-cover rounded-md"
      >
        <Arrow width="1.2em" />
      </button>
    </form>
  </div>
</div>
