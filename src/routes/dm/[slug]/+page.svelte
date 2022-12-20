<script>
  import { getUserAvatar, publickeyGet } from "$lib/utils";
  import Arrow from "@svicons/boxicons-regular/right-arrow-alt.svelte";
  import { onMount } from "svelte";
  import { db, keys, user } from "$lib/gun";
  import Message from "../../../comp/message.svelte";
  import Icon from "svelte-icons-pack/Icon.svelte";
  import BsArrowLeftShort from "svelte-icons-pack/bs/BsArrowLeftShort";
  import { goto } from "$app/navigation";

  export let data;
  const username = data.slug;
  let pub;
  let dummy;
  let messages = [];
  let refreshMesages = () => {};

  onMount(async () => {
    await publickeyGet(username).then((pubb) => {
      pub = pubb;
    });
    messages = [];
    await user
      .get("dm")
      .get(pub)
      .once()
      .map()
      .once((a, b) => {
        messages = [
          {
            message: a.message,
            time: Gun.state.is(a, "message"),
            self: true,
          },
          ...messages,
        ];
      });

    await db
      .user(pub)
      .get("dm")
      .get(user.is.pub)
      .on(() => {
        if (dummy) {
          dummy.scrollIntoView();
        }
      })
      .map()
      .once((a, b) => {
        messages = [
          {
            message: a.message,
            time: Gun.state.is(a, "message"),
            self: false,
          },
          ...messages,
        ];
      });
  });

  let q;

  async function sendMessage() {
    if (q !== undefined || (q !== "" && q)) {
      await user
        .get("dm")
        .get(pub)
        .get(new Date().toISOString())
        .put({
          message: q,
        })
        .then((data) => {
          q = "";
          if (dummy) {
            dummy.scrollIntoView();
          }
        });

      // messages = [
      //   {
      //     message: data.message,
      //     time: Gun.state.is(data, "message"),
      //     self: true,
      //   },
      //   ...messages,
      // ];
    }
  }

  let removeDUP = () => {
    messages.sort(
      (d1, d2) => new Date(d1.time).getTime() - new Date(d2.time).getTime()
    );
  };

  $: messages, removeDUP();
</script>

<div class="flex centered justify-center items-center mt-3">
  <div
    class="mx-4 w-full p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
  >
    <button
      on:click={() => {
        goto("/dm/");
      }}
    >
      <Icon src={BsArrowLeftShort} size={20} />
    </button>
    <div
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-md"
    >
      {#if pub}
        {#await getUserAvatar(pub) then data}
          <img src={data} class="rounded-md" alt="" />
        {/await}
      {/if}
    </div>
    <button
      on:click={() => {
        goto(`/u/${username}`);
      }}
      class="text-sm font-thin w-full resize-none bg-[#19191a] rounded p-1"
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
  <div bind:this={dummy} class="mb-10" />
</div>

<div class="flex centered_bottom justify-center items-center mt-3">
  <div
    class="mx-4 w-full p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
  >
    <!-- <div
      class="h-6 flex justify-center w-6 m-auto aspect-square object-cover rounded-md"
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
        class="text-sm font-thin w-full resize-none bg-[#19191a] rounded p-1"
      />
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button
        on:click={() => {
          sendMessage[q];
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
