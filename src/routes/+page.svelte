<script>
  import { SEA } from "gun";
  import moment from "moment";
  moment().format();
  import { db, keys, user } from "$lib/gun";
  import { v4 } from "uuid";
  import Post from "../comp/post.svelte";
  import { onMount } from "svelte";
  import { getUserAvatar, usernameGet } from "$lib/utils";
  import AiOutlineLoading from "svelte-icons-pack/ai/AiOutlineLoading";
  import Icon from "svelte-icons-pack/Icon.svelte";

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

        await user
          .get("location")
          .get("city")
          .once(async (r) => {
            let item = await SEA.decrypt(r, $keys.priv);
            let soul = await Gun.node.soul(data);
            let hash = await SEA.work(soul, null, null, { name: "SHA-256" });
            db.get("search_geo")
              .get("query")
              .get(`#${item}`)
              .get(hash)
              .put(soul);
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
<div class="flex w-full break-all justify-center items-center mt-3">
  <div
    class="w-full p-3 border border-[#dce1e6] dark:border-[#424242] bg-[#ffffff] dark:bg-[#222222] rounded-lg h-auto flex gap-1 items-center"
  >
    {#await getUserAvatar($keys.pub)}
      <div class="animate-spin">
        <Icon src={AiOutlineLoading} color="gray" />
      </div>
    {:then data}
      <img
        src={data}
        class="h-7 w-7 {postFocus
          ? 'mb-auto mt-1'
          : ''} mx-auto aspect-square object-cover rounded-full"
        alt=""
      />
    {/await}
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
          class="text-sm font-thin w-full resize-none bg-[#ffffff] dark:bg-[#222222] rounded p-1"
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
            class="text-lg w-full h-44 resize-none bg-[#ffffff] dark:bg-[#222222] rounded p-1"
          />
          <div class="center p-2 w-full">
            <!-- <button class="">
              <Image width="1.2em" />
            </button> -->
            <div class="mr-auto">
              {(postContent || "").length}/280
            </div>
            <div class="m-2 flex gap-2">
              <button
                class="btn flex items-center text-sm justify-center rounded-lg px-2.5 py-0.5 bg-[#f0f2f5] dark:bg-[#222222]"
                on:click={() => {
                  postContent = null;
                  postFocus = false;
                }}
              >
                close
              </button>
              <button
                on:click={publishPost}
                class="btn flex items-center text-sm justify-center rounded-lg px-2.5 py-0.5 bg-[#383838] text-white dark:bg-[#d2d4d6] dark:text-black text-opacity-70"
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
