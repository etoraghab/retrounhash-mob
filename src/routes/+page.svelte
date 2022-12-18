<script>
  import Image from "@svicons/boxicons-regular/image.svelte";
  import { user } from "$lib/gun";
  import { v4 } from "uuid";
  import Post from "../comp/post.svelte";
  import { onMount } from "svelte";

  let option = false;
  let postFocus = false;
  let postContent;
  let textareaVAR;
  let posts = [];

  async function publishPost() {
    let id = v4();
    await user
      .get("posts")
      .get(id)
      .put(postContent)
      .then((e) => {
        postContent = null;
        refreshPosts();
      });
  }

  function refreshPosts() {
    posts = [];
    user.get("posts").once((post) => {
      delete post._;
      Object.entries(post).forEach((post) => {
        posts = [
          {
            content: post[1],
            uid: post[0],
          },
          ...posts,
        ];
        console.log(posts);
      });
    });
  }

  onMount(() => {
    refreshPosts();
  });
</script>

<div class="flex break-all justify-center items-center mt-3">
  <div
    class="w-11/12 p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
  >
    <img
      src="/favicon.png"
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
            }, 500);
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
                class="btn flex items-center text-sm justify-center rounded-md px-2.5 py-0.5 bg-[#222222]"
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
<div class="flex flex-col gap-3 justify-center items-center mt-3">
  {#each posts as p}
    <Post data={p} />
  {/each}
</div>
