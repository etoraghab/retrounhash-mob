<script>
  import { getUserAvatar, publickeyGet, usernameGet } from "$lib/utils";
  import Arrow from "@svicons/boxicons-regular/right-arrow-alt.svelte";
  import { onMount } from "svelte";
  import { db, keys, user } from "$lib/gun";
  import Message from "../../../comp/message.svelte";
  import Icon from "svelte-icons-pack/Icon.svelte";
  import BsArrowLeftShort from "svelte-icons-pack/bs/BsArrowLeftShort";
  import { goto } from "$app/navigation";

  export let data;
  const pub = data.slug;
  let scrollBottom;
  let messages = [];
  let username;
  usernameGet(pub).then((u) => {
    username = u;
  });

  let q;

  function scroll() {
    setTimeout(() => scrollBottom?.scrollIntoView({ behavior: "auto" }), 50);
  }

  async function sendMessage() {
    if (q !== undefined || (q !== "" && q)) {
      let time = new Date().toISOString();
      user
        .get("dm")
        .get(pub)
        .get(time)
        .put({
          message: q,
        })
        .then((data) => {
          q = "";
        });
    }
  }

  let removeDUP = () => {
    messages.sort(
      (d1, d2) => new Date(d1.time).getTime() - new Date(d2.time).getTime()
    );
  };

  $: messages, removeDUP();

  db.user(pub)
    .get("dm")
    .get($keys.pub)
    .map()
    .once((a) => {
      messages = [
        {
          message: a.message,
          time: Gun.state.is(a, "message"),
          self: false,
        },
        ...messages,
      ];
    });

  user
    .get("dm")
    .get(pub)
    .map()
    .once((a) => {
      if (a) {
        messages = [
          {
            message: a.message,
            time: Gun.state.is(a, "message"),
            self: true,
          },
          ...messages,
        ];
      }
    });

  $: messages, scroll();
</script>

<svelte:head>
  <title>{username || "loading"} - retrounhash</title>
</svelte:head>
<div class="flex centered justify-center items-center mt-3">
  <div
    class="mx-4 w-full p-2  bg-[#ffffff] dark:bg-[#222222] rounded-lg h-auto flex gap-1 items-center"
  >
    <button
      on:click={() => {
        goto("/dm/");
      }}
    >
      <Icon src={BsArrowLeftShort} size={20} />
    </button>
    <div
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-lg"
    >
      {#if pub}
        {#await getUserAvatar(pub) then data}
          <img src={data} class="rounded-lg" alt="" />
        {/await}
      {/if}
    </div>
    <button
      on:click={() => {
        goto(`/u/${username}`);
      }}
      class="text-sm font-thin w-full resize-none bg-[#ffffff] dark:bg-[#222222] rounded p-1"
    >
      {username}
    </button>
  </div>
</div>

<div class="w-full mt-20">
  <div class="flex flex-col gap-1 chat">
    {#each messages as m}
      <Message message={m.message} self={m.self} time={m.time} />
    {/each}
  </div>
  <div bind:this={scrollBottom} class="mb-12" />
</div>

<div class="flex centered_bottom justify-center items-center mt-3">
  <div
    class="mx-4 w-full p-2  bg-[#ffffff] dark:bg-[#222222] rounded-lg h-auto flex gap-1 items-center"
  >
    <!-- <div
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-lg"
    >
      <Search width="1.2em" />
    </div> -->
    <form
      autocomplete="off"
      on:submit|preventDefault={() => {
        sendMessage(q);
      }}
      class="flex w-full"
    >
      <input
        bind:value={q}
        type="text"
        placeholder="Type a message"
        class="text-sm font-thin w-full resize-none bg-[#ffffff] dark:bg-[#222222] rounded p-1"
      />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button
        on:click={() => {
          sendMessage[q];
        }}
        type="submit"
        class="h-6 center w-6 m-auto aspect-square object-cover rounded-lg"
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
    bottom: 88.5%;
    left: calc(50vw);
    padding-left: 2.73rem;
    transform: translate(-50%, -50%);
  }

  .centered_bottom {
    position: fixed;
    width: 100vw;
    top: 93%;
    left: calc(50vw);
    padding-left: 2.73rem;
    transform: translate(-50%, -50%);
  }
</style>
