<script>
  /** @type {import('./$types').PageData} */
  export let data;
  const pub = data.slug;

  import imageCompression from "browser-image-compression";
  import Link from "@svicons/boxicons-regular/link.svelte";
  import { db, keys, user as user_ } from "$lib/gun";
  import { onMount } from "svelte";
  import { getUserAvatar, getUserName } from "$lib/utils";
  import moment from "moment";
  import Post from "../../../comp/post.svelte";

  let user = db.user(pub);
  let following = null;
  let user_avatar;
  let username_VAL, bio_VAL, link_VAL;
  let alias_graph = user.get("alias");
  let bio_graph = user.get("bio");
  let link_graph = user.get("link");
  let avatar_graph = user.get("avatar");

  onMount(() => {
    alias_graph.once((val) => {
      username_VAL.innerHTML = val;
    });
    bio_graph.once((val) => {
      bio_VAL.innerHTML = val || "404 no bio found";
    });
    link_graph.once((val) => {
      link_VAL.innerHTML = val || location.href.split(/\//)[2];
    });
    avatar_graph.once((val) => {
      user_avatar =
        val ||
        `https://avatars.dicebear.com/api/identicon/${username_VAL.innerHTML}.svg`;
    });
  });

  let posts = [];
  db.user(pub)
    .get("posts")
    .once(async (post_) => {
      if (post_) {
        let name = await getUserName(pub);
        let avatar = await getUserAvatar(pub);
        Object.entries(post_).forEach(async (post) => {
          if (post[0] !== "_" && post[1] !== null) {
            let date = new Date(post_["_"][">"][post[0]]).toUTCString();
            posts = [
              {
                content: post[1],
                uid: post[0],
                avatar: avatar,
                name: name,
                date: moment(date).calendar(),
                self: false,
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
</script>

<div class="flex flex-col break-all justify-center items-center mt-3">
  <img
    src={user_avatar}
    class="h-20 w-20 aspect-square object-cover rounded-full"
    alt=""
  />
  <span class="mt-1" bind:this={username_VAL}> loading... </span>
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
  {#if following !== null && pub !== $keys.pub}
    <button
      on:click={async () => {
        if (following) {
          following = false;
          user_.get("following").get(pub).put(false);
        } else {
          following = true;
          user_.get("following").get(pub).put(true);
        }
      }}
      class="w-10/12 {following
        ? 'bg-[#272626] hover:bg-[#383737] text-white'
        : 'bg-[#d7d7e0] hover:bg-[#c3c3ca] text-black'} rounded-md text-sm p-1 transition-colors duration-300"
    >
      {following ? "unfollow" : "follow"}
    </button>
  {/if}
</div>

<div class="flex flex-col gap-3 justify-start items-center mt-3">
  {#each posts as p}
    <Post data={p} />
  {/each}
</div>
