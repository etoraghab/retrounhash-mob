<script>
  import { onMount } from "svelte";
  import moment from "moment";
  moment().format();
  import { getUserAvatar, usernameGet } from "$lib/utils";
  import { db, keys, user } from "$lib/gun.js";
  import SEA from "gun/sea";

  let posts = [];
  function refreshExploreFeed() {
    user
      .get("location")
      .get("city")
      .once(async (city) => {
        let city_ = await SEA.decrypt(city, $keys.priv);
        db.get("search_geo")
          .get("query")
          .get(`#${city_}`)
          .map()
          .once((post) => {
            db.get(post).once(async (val) => {
              if (val) {
                await usernameGet(post.split(/~/)[1].split(/\//)[0]).then(
                  async (username) => {
                    await getUserAvatar(post.split(/~/)[1].split(/\//)[0]).then(
                      (avatar) => {
                        let date = GUN.state.is(val, "content");
                        post = val["_"]["#"];
                        let fuckingpostobj = {
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
                        };
                        posts = [fuckingpostobj, ...posts];
                      }
                    );
                  }
                );
              }
            });
          });
      });
  }

  onMount(() => {
    refreshExploreFeed();
  });

  document.addEventListener("refresh", () => {
    posts = [];
    refreshExploreFeed();
  });

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

  import { goto } from "$app/navigation";
</script>
<svelte:head>
  <title>explore - retrounhash</title>
  <meta
    name="description"
    content="retrounhash is a decentralized social media platform to share, interact and socialise around with the world while staying secure and private."
  />
</svelte:head>
<div class="flex flex-col gap-3 justify-start items-center mt-3">
  <div class="text-left w-11/12">
    Explore <sub class="text-red-700">beta</sub>
    <div class="text-xs">feed from around your city</div>
  </div>
  {#if posts.length == 0}
    <div class="text-sm">
      no posts, <button
        class="underline"
        on:click={() => {
          goto("/");
        }}>write one.</button
      >
    </div>
  {/if}
  {#each posts as p}
    <div
      class="w-full p-3 border border-[#dce1e6] dark:border-[#424242] bg-[#ffffff] dark:bg-[#222222]  rounded-lg h-auto flex flex-col"
    >
      <div>
        <div class="flex items-center mb-1 mt-2">
          <div class="flex w-full">
            <button
              on:click={() => {
                goto(`/u/${p.name}`);
              }}
            >
              <img
                src={p.avatar}
                class="h-9 w-9 aspect-square object-cover rounded-full m-1"
                alt=""
              />
            </button>
            <div class="flex flex-col justify-center pl-1">
              <span class="text-sm m-auto ml-0">
                {p.name}
              </span>
              <span class="text-[10px] opacity-90 mb-auto">
                {p.date}
              </span>
            </div>
          </div>
        </div>
        <div class="text-sm pl-2 p-2 break-words flex gap-1">
          {@html p.content}
        </div>
      </div>
    </div>
  {/each}
</div>
