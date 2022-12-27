<script>
  export let data;
  let query = data.slug;
  import { goto } from "$app/navigation";
  import GUN from "gun";
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Arrow from "@svicons/boxicons-regular/right-arrow-alt.svelte";
  import { db, keys } from "$lib/gun";
  import moment from "moment";

  import {
    getUserAvatar,
    getuserbio,
    publickeyGet,
    usernameGet,
  } from "$lib/utils";
  import Post from "../../../comp/post.svelte";

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
      query = query.replace(/ /, "");
      if (!(query.length <= 2)) {
        db.get("search")
          .get("query")
          .get("#" + String(query).toLowerCase())
          .map()
          .once((post) => {
            db.get(post).once((val) => {
              if (val) {
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
              }
            });
          });
      }
    });
  }

  async function searchAccounts(query_) {
    query_
      .replace(/@/g, "")
      .split(" ")
      .forEach(async (query) => {
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
      });

    let tags = query_.match(/@[a-z0-9_]+/g) || [];
    tags.forEach(async (query) => {
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

  let tab = "posts";
  let tabs_list = ["posts", "accounts"];

  search(query);
  searchAccounts(query);

  function relevant() {
    if (accounts.length > posts.length) {
      tab = "accounts";
    } else {
      tab = "posts";
    }
  }

  $: accounts | posts, relevant();
</script>

<svelte:head>
  <title>search - retrounhash</title>
  <meta
    name="description"
    content="search among various posts, accounts and communities across retrounhash, the decentralized social platform."
  />
</svelte:head>

<div class="flex flex-col gap-3 justify-start items-center mt-3 w-full">
  {#if recentSerch == undefined || recentSerch == ""}
    <div class="text-center text-xs pt-3 px-4">
      Search across all posts and accounts that match to your query
    </div>
  {:else}
    <div class="flex w-full">
      {#each tabs_list as i}
        <button
          on:click={() => {
            tab = i;
          }}
          class="w-1/2 center {tab === i
            ? 'border-b border-blue-600'
            : 'border-b dark:border-[#141414] border-[#edeef0]'} pb-1 transition-all duration-500"
        >
          {i}
        </button>
      {/each}
    </div>
  {/if}

  {#if tab == "accounts"}
    <div class="w-11/12 flex flex-col justify-center items-center gap-2">
      {#if accounts.length !== 0}
        <div class="text-xl w-full text-left">Accounts</div>
      {:else if accounts.length == 0 && recentSerch}
        <div class="text-xl">no results</div>
      {/if}
      {#each accounts as a}
        <div
          class="w-full p-1 bg-[#ffffff] dark:bg-[#222222] rounded-lg h-auto flex flex-col"
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
                  class="h-10 w-10 aspect-square object-cover rounded-full m-1"
                  alt=""
                />
                <div class="flex flex-col justify-center pl-1">
                  <span class="text-sm m-auto ml-0">
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
  {:else if tab == "posts"}
    <div class="w-full flex flex-col justify-center items-center gap-2">
      {#if posts.length !== 0}
        <div class="text-xl  text-left">Posts</div>
      {:else if posts.length == 0 && recentSerch}
        <div class="text-xl">no results</div>
      {/if}
      {#each posts as p}
        <Post data={p} />
      {/each}
    </div>
  {/if}
</div>
<div class="pt-14" />
<!-- <div class="flex centered justify-center items-center mt-3">
  <div
    class="mx-4 p-2  bg-[#ffffff] dark:bg-[#222222] rounded-lg h-auto flex gap-1 items-center"
  >
    <div
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-lg"
    >
      <Search width="1.2em" />
    </div>
    <form
      autocomplete="off"
      on:submit|preventDefault={() => {
        search(q);
        searchAccounts(q);
      }}
      class="flex w-full"
    >
      <input
        bind:value={q}
        type="text"
        contenteditable="true"
        placeholder="Search"
        class="text-sm font-thin w-full resize-none bg-[#ffffff] dark:bg-[#222222] rounded p-1"
      />
      <button
        on:click={() => {
          searchAccounts(q);
          search(q);
        }}
        type="submit"
        class="h-6 center w-6 m-auto aspect-square object-cover rounded-lg"
      >
        <Arrow width="1.2em" />
      </button>
    </form>
  </div>
</div> -->
