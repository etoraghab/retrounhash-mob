<script>
  /** @type {import('./$types').PageData} */
  export let data;
  const username = data.slug;
  let pub = data.pub;
  import { db, keys, user as user_, avatar } from "$lib/gun";
  import { getUserAvatar, postRender } from "$lib/utils";
  import moment from "moment";
  import Post from "../../../comp/post.svelte";
  import Loading from "../../../comp/loading.svelte";
  import Icon from "svelte-icons-pack";
  import FaMapMarkerAlt from "svelte-icons-pack/fa/FaSolidMapMarkerAlt";
  import { Check, Message } from "@svicons/boxicons-regular";
  import { currentuserposts } from "$lib/store";
  import { goto } from "$app/navigation";

  let user = db.user(pub);
  let following = null;
  let user_avatar;

  let posts = [];
  getUserAvatar(pub).then((val) => {
    user_avatar = val;
  });

  user_
    .get("following")
    .get(pub)
    .once((val) => {
      following = val || false;
    });

  // db.user(pub)
  //   .get("posts")
  //   .once(async (post_) => {
  //     if (post_) {
  //       Object.entries(post_).forEach(async (post) => {
  //         if (post[0] !== "_" && post[1] !== null) {
  //           let date = new Date(post_["_"][">"][post[0]]).toUTCString();
  //           posts = [
  //             {
  //               content: post[1],
  //               uid: post[0],
  //               avatar: await getUserAvatar(pub),
  //               name: username,
  //               date: moment(date).calendar(),
  //               self: pub == $keys.pub ? true : false,
  //               sortDate: date,
  //               pub: pub,
  //             },
  //             ...posts,
  //           ];
  //         }
  //       });
  //     }
  //   });

  // let pinned;
  // db.user(pub)
  //   .get("pinned")
  //   .once((v) => {
  //     // db.user(pub)
  //     //   .get("posts")
  //     //   .get(v)
  //     //   .once(async (p, u) => {
  //     //     if (typeof p == "object" && p) {
  //     //       let date = Gun.state.is(p, "content");
  //     //       pinned = {
  //     //         content: p.content,
  //     //         uid: u,
  //     //         avatar: user_avatar,
  //     //         name: username,
  //     //         date: moment(date).calendar(),
  //     //         self: pub == $keys.pub ? true : false,
  //     //         sortDate: date,
  //     //         pub: pub,
  //     //       };
  //     //     }
  //     //   });
  //     pinned = v;
  //   });

  let requested;
  currentuserposts.subscribe((v) => {
    if (v) {
      posts = v;
    }
  });

  async function sendreq() {
    await user.get("msgCert").once(async (val) => {
      await user
        .get("requests")
        .get($keys.pub)
        .put(true, null, {
          opt: {
            cert: val,
          },
        });
    });

    await user
      .get("canMessage")
      .get(pub)
      .put(true)
      .then(() => {});
    requested = true;
  }

  async function cancelreq() {
    await user.get("msgCert").once(async (val) => {
      await user
        .get("requests")
        .get($keys.pub)
        .put(false, null, {
          opt: {
            cert: val,
          },
        });
    });

    await user_
      .get("canMessage")
      .get(pub)
      .put(false)
      .then(() => {});

    requested = false;
  }
</script>

<svelte:head>
  <title>
    {username} - retrounhash
  </title>
  <meta name="description" content={data.bio} />
</svelte:head>
<div class="flex flex-col break-all justify-center items-center pl-1.5 mt-0.5">
  <div class="w-full flex items-center justify-start p-1">
    <div class="center w-full">
      <img
        src={data.background}
        class="w-full h-40 object-cover rounded-lg rounded-t-md"
        alt=""
      />
    </div>
    <div class="center z-[99999999] absolute mt-40 ml-3">
      <img
        src={user_avatar}
        class="w-20 h-20 object-cover rounded-full shadow-sm shadow-black"
        alt=""
      />
    </div>
  </div>
  <div class="h-16 w-full flex justify-end pr-5">
    {#if $keys.pub !== pub}
      {#if following}
        <button
          on:click={() => {
            following = false;
            user_.get("canMessage").get(pub).put(false);
            user_.get("following").get(pub).put(false);
          }}
          class="dark:bg-[#d2d4d631] m-auto mr-3 gap-3 h-7 my-auot transition-all duration-300 text-sm p-1 dark:hover:bg-[#303030a9] rounded-lg px-3"
        >
          unfollow
        </button>
      {:else}
        <button
          on:click={() => {
            following = true;
            user_.get("following").get(pub).put(true);
            user_.get("canMessage").get(pub).put(true);
          }}
          class="dark:bg-[#d2d4d6] m-auto mr-3 dark:text-black gap-3 h-7 my-auot transition-all duration-300 text-sm p-1 dark:hover:bg-[#b6b9bb] rounded-lg px-3"
        >
          follow
        </button>
      {/if}
      {#if requested}
        <button
          on:click={cancelreq}
          class="dark:bg-[#d2d4d6] my-auto dark:text-black gap-3 h-7 transition-all duration-300 text-sm p-1 dark:hover:bg-[#b6b9bb] rounded-lg px-2"
        >
          <Check width="1.2em" />
        </button>
      {:else}
        <button
          on:click={sendreq}
          class="dark:bg-[#d2d4d6] my-auto dark:text-black gap-3 h-7 transition-all duration-300 text-sm p-1 dark:hover:bg-[#b6b9bb] rounded-lg px-2"
        >
          <Message width="1.2em" />
        </button>
      {/if}
    {/if}
  </div>
  <div class="text-left flex-col flex truncate w-full pl-3 text-lg">
    {data.displayName}
    <span class="text-sm opacity-75">
      @{username}
    </span>
  </div>
  <div class="w-full pt-4 pl-3 justify-start">
    <div class="text-md  flex flex-col gap-1">
      <span class="text-[14px] line-clamp-6">
        {@html data.bio || "404: bio not found"}
      </span>
      {#if data.location}
        <span class="flex opacity-60 text-[13px] gap-1 capitalize items-center">
          <Icon src={FaMapMarkerAlt} color="gray" size="15" />
          {data.location}
        </span>
      {/if}
    </div>
  </div>
</div>

<div class="center w-full">
  <div class="flex flex-col gap-3 justify-start items-center mt-3 w-11/12">
    {#each posts as p}
      <div
        class="w-full break-all p-3 border border-[#dce1e6] dark:border-[#424242] bg-[#ffffff] dark:bg-[#222222]  rounded-lg h-auto flex flex-col"
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
</div>

{#if !user_avatar}
  <div class="w-full h-screen center">
    <Loading />
  </div>
{/if}

<!-- <img
    src={user_avatar}
    class="h-20 w-20 aspect-square object-cover rounded-full"
    alt=""
  />
  <span class="mt-1">@{username}</span>
  <div class="w-10/12 text-left text-xs py-2">{user_bio}</div>
  <button
    class="text-xs w-10/12 items-center text-blue-700 dark:text-blue-500 flex gap-1 text-opacity-75 text-left  m-3"
    on:click={() => {
      open(user_link);
    }}
  >
    <Link width="1em" />
    <span>{user_link}</span>
  </button>
  <div class="flex gap-2 w-10/12 break-all justify-center items-center">
    {#if following !== null && pub !== $keys.pub}
      <button
        on:click={async () => {
          if (following) {
            following = false;
            user_.get("canMessage").get(pub).put(false);
            user_.get("following").get(pub).put(false);
          } else {
            following = true;
            user_.get("following").get(pub).put(true);
            user_.get("canMessage").get(pub).put(true);
          }
        }}
        class="w-8/12 {following
          ? 'bg-[#f0f2f5] dark:bg-[#222222] dark:text-white'
          : 'bg-[#383838] text-white dark:bg-[#d2d4d6] dark:text-black text-opacity-70'} rounded-lg text-sm p-1 transition-colors duration-300"
      >
        {following ? "unfollow" : "follow"}
      </button>
      {#if requested}
        <button
          on:click={async () => {
            await user.get("msgCert").once(async (val) => {
              await user
                .get("requests")
                .get($keys.pub)
                .put(false, null, {
                  opt: {
                    cert: val,
                  },
                });
            });

            await user_
              .get("canMessage")
              .get(pub)
              .put(false)
              .then(() => {});

            requested = false;
          }}
          class="{requested
            ? ''
            : 'w-4/12'} bg-[#f0f2f5] dark:bg-[#222222] dark:text-white rounded-lg text-sm p-1 transition-colors duration-300"
        >
          <X width="1.4em" />
        </button>
      {:else}
        <button
          on:click={async () => {
            await user.get("msgCert").once(async (val) => {
              await user
                .get("requests")
                .get($keys.pub)
                .put(true, null, {
                  opt: {
                    cert: val,
                  },
                });
            });

            await user
              .get("canMessage")
              .get(pub)
              .put(true)
              .then(() => {});
            requested = true;
          }}
          class="w-4/12 bg-[#f0f2f5] dark:bg-[#222222] dark:text-white rounded-lg text-sm p-1 transition-colors duration-300"
        >
          request
        </button>
      {/if}
    {/if}
  </div> -->
