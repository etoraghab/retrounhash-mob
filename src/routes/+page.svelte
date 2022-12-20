<script>
  import moment from "moment";
  moment().format();
  import Image from "@svicons/boxicons-regular/image.svelte";
  import { avatar, db, keys, user, username } from "$lib/gun";
  import { v4 } from "uuid";
  import Post from "../comp/post.svelte";
  import { onMount } from "svelte";
  import { getUserAvatar, usernameGet } from "$lib/utils";

  let postFocus = false;
  let postContent;
  let textareaVAR;
  let posts = [];

  async function publishPost() {
    if (!postContent) {
      return;
    }
    let id = v4();
    await user
      .get("posts")
      .get(id)
      .put(postContent)
      .then(async () => {
        postContent = postContent.replace(/(\,|\.)/g, "");
        refreshPosts();
      });

    await user
      .get("searchable")
      .get(id)
      .put({
        content: postContent,
      })
      .then(async (data) => {
        let array1 = postContent.split(" ");
        array1.forEach(async (element) => {
          if (element.length > 2) {
            let soul = await Gun.node.soul(data);
            let hash = await SEA.work(soul, null, null, { name: "SHA-256" });
            db.get("search")
              .get("query")
              .get(`#${String(element).toLowerCase()}`)
              .get(hash)
              .put(soul);
          }
        });
      });
    postContent = null;
  }

  function refreshPosts() {
    posts = [];

    user.get("following").once((followers) => {
      if (followers) {
        Object.entries(followers).forEach(async (f) => {
          if (f[0] !== "_" && f[1] !== null && f[1]) {
            let pub = f[0];
            let avatar = await getUserAvatar(pub);
            db.user(pub)
              .get("posts")
              .once((post_) => {
                if (post_) {
                  Object.entries(post_).forEach(async (post) => {
                    if (post[0] !== "_" && post[1] !== null) {
                      let date = new Date(
                        post_["_"][">"][post[0]]
                      ).toUTCString();
                      posts = [
                        {
                          content: post[1],
                          uid: post[0],
                          avatar: avatar,
                          name: await usernameGet(pub),
                          date: moment(date).calendar(),
                          sortDate: date,
                          self: pub == $keys.pub ? true : false,
                          pub: pub,
                        },
                        ...posts,
                      ];
                    }
                  });
                }
              });
          }
        });
      }
    });
    postFocus = false;
  }

  onMount(() => {
    refreshPosts();
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
</script>

<svelte:head>
  <title>home - retrounhash</title>
  <meta
    name="description"
    content="retrounhash is a decentralized social media platform to share, interact and socialise around with the world while staying secure and private."
  />
</svelte:head>
<div class="flex break-all justify-center items-center mt-3">
  <div
    class="w-11/12 p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
  >
    <img
      src={$avatar}
      class="h-6 w-6 {postFocus
        ? 'mb-auto mt-1'
        : ''} mx-auto aspect-square object-cover rounded-md"
      alt=""
    />
    {#if !postFocus}
      <div class="flex items-center w-full justify-center">
        <div
          type="text"
          contenteditable="true"
          on:focus={() => {
            postFocus = true;
            setTimeout(() => {
              textareaVAR.focus();
            }, 0);
          }}
          class="text-sm font-thin w-full resize-none bg-[#19191a] rounded p-1"
        >
          What's new?
        </div>
      </div>
      <!-- <button class="p-1">
        <Image width="1.2em" />
      </button> -->
    {:else}
      <div class="flex w-full">
        <div class="flex flex-col items-center w-full justify-center">
          <textarea
            type="text"
            bind:this={textareaVAR}
            bind:value={postContent}
            placeholder="What's new?"
            maxlength="280"
            class="text-lg w-full h-44 resize-none bg-[#19191a] rounded p-1"
          />
          <div class="flex justify-center items-center p-2 w-full">
            <!-- <button class="">
              <Image width="1.2em" />
            </button> -->
            <div class="mr-auto">
              {(postContent || "").length}/280
            </div>
            <div class="m-2 flex gap-2">
              <button
                class="btn flex items-center text-sm justify-center rounded-md px-2.5 py-0.5 bg-[#222222]"
                on:click={() => {
                  postContent = null;
                  postFocus = false;
                }}
              >
                close
              </button>
              <button
                on:click={publishPost}
                class="btn flex items-center text-sm justify-center rounded-md px-2.5 py-0.5 bg-[#d7d7e0] hover:bg-[#c3c3ca] text-black"
              >
                post
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
<div class="flex flex-col gap-3 justify-start items-center mt-3">
  {#if posts.length == 0}
    <div class="text-sm">
      no posts, <button
        class="underline"
        on:click={() => {
          postFocus = true;
        }}>write one.</button
      >
    </div>
  {/if}
  {#each posts as p}
    <Post data={p} />
  {/each}
</div>
