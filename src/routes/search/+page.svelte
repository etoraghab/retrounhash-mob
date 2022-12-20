<script>
  import { goto } from "$app/navigation";
  import GUN from "gun";
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Arrow from "@svicons/boxicons-regular/right-arrow-alt.svelte";
  import { db, keys } from "$lib/gun";
  import moment from "moment";
  import Post from "../../comp/post.svelte";
  import {
    getUserAvatar,
    getuserbio,
    publickeyGet,
    usernameGet,
  } from "$lib/utils";
  let q;
  let posts = [];
  let recentSerch;
  let accounts = [];

  function search(query) {
    if (!query || query == "" || query == "") {
      return;
    }
    posts = [];
    accounts = [];
    recentSerch = query;
    query.split(" ").forEach(async (query) => {
      await publickeyGet(query).then(async (val) => {
        accounts = [
          {
            pub: val,
            username: query,
            avatar: await getUserAvatar(val),
            // bio: await getuserbio(val),
          },
          ...accounts,
        ];
      });

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
                          self:
                            post.split(/~/)[1].split(/\//)[0] == $keys.pub
                              ? true
                              : false,
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

  function removeDUP_accounts() {
    let a = accounts.filter(
      (v, i, a) =>
        a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i
    );
    accounts = a;
  }

  $: accounts, removeDUP_accounts();
</script>

<svelte:head>
  <title>search - retrounhash</title>
  <meta
    name="description"
    content="search among various posts, accounts and communities across retrounhash, the decentralized social platform."
  />
</svelte:head>

<div class="flex flex-col gap-3 justify-start items-center mt-3">
  {#if recentSerch == undefined || recentSerch == ""}
    <div class="text-center text-xs pt-3 px-4">
      Search across all posts and accounts that match to your query
    </div>
  {/if}

  <div class="w-11/12 flex flex-col justify-center items-center gap-2">
    {#if accounts.length !== 0}
      <div class="text-xl w-full text-left">People</div>
    {/if}
    {#each accounts as a}
      <div
        class="w-full p-1 bg-[#19191a] border border-[#313131] rounded-md h-auto flex flex-col"
      >
        <button
          on:click={() => {
            goto(`/u/${a.username}`);
          }}
        >
          <div class="flex items-center">
            <div class="flex w-full">
              <img
                src={a.avatar}
                class="h-6 w-6 aspect-square object-cover rounded-md m-1"
                alt=""
              />
              <div class="flex flex-col justify-center pl-1">
                <span class="text-xs m-auto ml-0">
                  {a.username}
                </span>
                <!-- <span class="text-[9px] text-opacity-60 my-auto">
                  {a.bio}
                </span> -->
              </div>
            </div>
          </div>
        </button>
      </div>
    {/each}
  </div>

  <div class="w-full flex flex-col justify-center items-center gap-2">
    {#if posts.length !== 0}
      <div class="text-xl w-11/12 text-left">Posts</div>
    {/if}
    {#each posts as p}
      <Post data={p} />
    {/each}
  </div>
</div>
<div class="pt-14" />
<div class="flex centered justify-center items-center mt-3">
  <div
    class="mx-4 p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
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

<style>
  .centered {
    position: fixed;
    width: 100vw;
    top: 92%;
    left: calc(50vw);
    padding-left: 2.73rem;
    transform: translate(-50%, -50%);
  }
</style>
