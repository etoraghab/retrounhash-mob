<script>
  import { goto } from "$app/navigation";
  /** @type {import('./$types').PageData} */
  export let data;
  const username = data.slug;
  let pub;
  import imageCompression from "browser-image-compression";
  import Link from "@svicons/boxicons-regular/link.svelte";
  import { db, keys, user as user_, avatar } from "$lib/gun";
  import { onMount } from "svelte";
  import { getUserAvatar, publickeyGet, usernameGet } from "$lib/utils";
  import moment from "moment";
  import Post from "../../../comp/post.svelte";

  let user = db.user(pub);
  let following = null;
  let user_avatar;
  let bio_VAL, link_VAL;
  let bio_graph = user.get("bio");
  let link_graph = user.get("link");
  // let avatar_graph = user.get("avatar");
  let user_bio;

  let posts = [];

  onMount(() => {
    publickeyGet(username).then(async (pke) => {
      pub = pke;

      user = db.user(pub);
      following = null;
      bio_graph = user.get("bio");
      link_graph = user.get("link");
      //avatar_graph = user.get("avatar");

      bio_graph.once((val) => {
        user_bio = val;
        bio_VAL.innerHTML = val || "404 no bio found";
      });
      link_graph.once((val) => {
        link_VAL.innerHTML = val || location.href.split(/\//)[2];
      });
      /*avatar_graph.once((val) => {
        user_avatar =
          val || `https://avatars.dicebear.com/api/identicon/${username}.svg`;
      });*/

      db.user(pub)
        .get("posts")
        .once(async (post_) => {
          if (post_) {
            Object.entries(post_).forEach(async (post) => {
              if (post[0] !== "_" && post[1] !== null) {
                let date = new Date(post_["_"][">"][post[0]]).toUTCString();
                posts = [
                  {
                    content: post[1],
                    uid: post[0],
                    avatar: await getUserAvatar(pub),
                    name: username,
                    date: moment(date).calendar(),
                    self: pub == $keys.pub ? true : false,
                    sortDate: date,
                    pub: pub,
                  },
                  ...posts,
                ];
              }
            });
          }
        });

      user_
        .get("following")
        .get(pub)
        .once((val) => {
          following = val || false;
        });
    });
  });
</script>

<svelte:head>
  <title>
    {username} - retrounhash
  </title>
  <meta name="description" content={user_bio} />
</svelte:head>
<div class="flex flex-col break-all justify-center items-center mt-3">
  <img
    src={$avatar}
    class="h-20 w-20 aspect-square object-cover rounded-full"
    alt=""
  />
  <span class="mt-1">@{username}</span>
  <div bind:this={bio_VAL} class="w-10/12 text-left text-xs py-2">loading</div>
  <button
    class="text-xs items-center text-blue-500 flex gap-1 text-opacity-75 text-left w-11/12 p-3 pt-1"
    on:click={() => {
      open(link_VAL.innerHTML);
    }}
  >
    <Link width="1em" />
    <span bind:this={link_VAL}> loading </span>
  </button>
  <div class="flex gap-2 w-11/12 break-all justify-center items-center">
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
          ? 'bg-[#272626] hover:bg-[#383737] text-white'
          : 'bg-[#d7d7e0] hover:bg-[#c3c3ca] text-black'} rounded-md text-sm p-1 transition-colors duration-300"
      >
        {following ? "unfollow" : "follow"}
      </button>
      <button
        on:click={async () => {
          await user_
            .get("canMessage")
            .get(pub)
            .put(true)
            .then(() => {
              goto("/dm/" + username);
            });
        }}
        class="w-4/12 bg-[#272626] hover:bg-[#383737] text-white rounded-md text-sm p-1 transition-colors duration-300"
      >
        message
      </button>
    {/if}
  </div>
</div>

<div class="flex flex-col gap-3 justify-start items-center mt-3">
  {#each posts as p}
    <Post data={p} />
  {/each}
</div>
