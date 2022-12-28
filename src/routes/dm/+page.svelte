<script>
  import moment from "moment";
  moment().format();
  import { getUserAvatar, publickeyGet, usernameGet } from "$lib/utils";
  import { db, keys, user } from "$lib/gun";
  import { goto } from "$app/navigation";
  import {
    ArrowBack,
    MessageAlt,
    Plus,
    Search,
    Send,
    TrashAlt,
  } from "@svicons/boxicons-regular";

  let activepub;
  let scrollBottom;
  let messages = [];
  let username;

  let q;

  function scroll() {
    setTimeout(() => scrollBottom?.scrollIntoView({ behavior: "auto" }), 50);
  }

  async function sendMessage() {
    if (q !== undefined || (q !== "" && q)) {
      let time = new Date().toISOString();
      user
        .get("dm")
        .get(activepub)
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

  let activename, activeavatar;

  function loadChat(pub, name, avatar) {
    activepub = pub;
    messages = [];
    activename = name;
    activeavatar = avatar;
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
  }

  $: messages, scroll();

  let sendButton;

  let following = [];
  let messaging_followers = [];
  user
    .get("following")
    .map()
    .once(async (a, b) => {
      if (a) {
        following = [b, ...following];
      }
    });

  function updateList() {
    user
      .get("canMessage")
      .map()
      .once(async (a, b) => {
        if (a == true) {
          messaging_followers = [
            {
              pub: b,
              username: await usernameGet(b),
              avatar: await getUserAvatar(b),
            },
            ...messaging_followers,
          ];
        }
      });
  }

  user.get("canMessage").on(() => {
    messaging_followers = [];
    updateList();
  });

  let tab = "Chats";
  let tabs_list = ["Chats", "Requests"];

  let requests = [];
  function refreshRequests() {
    user
      .get("requests")
      .map()
      .once(async (val, val2) => {
        console.log(val);
        if (val == true) {
          await db
            .user(val2)
            .get("alias")
            .once(async (name) => {
              await db
                .user(val2)
                .get("avatar")
                .once((av) => {
                  requests = [
                    {
                      name: name,
                      pub: val2,
                      avatar:
                        av ||
                        `https://avatars.dicebear.com/api/identicon/${name}.svg`,
                    },
                    ...requests,
                  ];
                });
            });
        }
      });
  }

  user.get("requests").on(() => {
    requests = [];
    refreshRequests();
  });

  function removeDUP_req() {
    let a = requests.filter(
      (v, i, a) =>
        a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i
    );
    requests = a;
  }
  $: requests, removeDUP_req();
</script>

<svelte:head>
  <title>{username || "loading"} - retrounhash</title>
</svelte:head>

<div>
  <div class="w-full h-32" style="" />

  <div class="container mx-auto" style="margin-top: -128px;">
    <div class="py-6 h-screen">
      <div
        class="flex border border-[#dce1e6] dark:border-[#424242] rounded-lg border-grey shadow-lg h-full"
      >
        <!-- Left -->
        <div class="w-1/3 flex flex-col">
          <!-- Header -->
          <div class="py-2 px-3 flex flex-row justify-between items-center" />

          <button
            on:click={() => {
              goto("/");
            }}
            class="py-2 mx-2 px-2 flex gap-2 items-center opacity-80"
          >
            <div class="hover:bg-[#424242] p-1 rounded-lg">
              <ArrowBack width="1.4em" />
            </div>
            Back
          </button>
          <!-- Search -->
          <div class="py-2 px-2">
            <div class="flex gap-2 px-2">
              <Search width="1.3em" />
              <input
                type="text"
                class="w-full px-2 py-2 text-sm rounded-lg bg-transparent"
                placeholder="Search or start new chat"
              />
            </div>
          </div>

          <div class="flex m-2">
            {#each tabs_list as i}
              <button
                on:click={() => {
                  tab = i;
                }}
                class="w-1/2 center {tab === i
                  ? 'border-b border-blue-600'
                  : 'border-b dark:border-[#222222] border-[#edeef0]'} pb-1 transition-all duration-500"
              >
                {i}
                {#if i == "Requests"}
                  <span class="text-xs my-auto ml-2">({requests.length})</span>
                {/if}
              </button>
            {/each}
          </div>

          <!-- Contacts -->
          {#if tab == "Chats"}
            <div class=" flex-1 overflow-auto">
              {#each messaging_followers as f}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="px-3 flex items-center cursor-pointer dark:hover:bg-[#2b2b2b] hover:bg-[#f2f3f5] transition-all duration-300 rounded-lg mx-2"
                  on:click={() => {
                    if (activepub !== f.pub) {
                      loadChat(f.pub, f.username, f.avatar);
                    }
                  }}
                >
                  <div>
                    <img class="h-12 w-12 rounded-full" alt="" src={f.avatar} />
                  </div>
                  <div
                    class="ml-4 flex-1 border-b hover:border-0 border-[#dce1e6] dark:border-[#424242] py-4"
                  >
                    <div class="flex items-bottom justify-between">
                      <p class="text-grey-darkest">{f.username}</p>
                      <p class="text-xs text-grey-darkest" />
                    </div>
                    <p class="text-grey-dark mt-1 text-sm" />
                  </div>
                </div>
              {/each}
              {#if messaging_followers.length == 0}
                <div class="text-xs capitalize opacity-80 p-2 mx-1">
                  follow people or message them by visiting their profile for
                  them to show up here
                </div>
              {/if}
            </div>
          {:else}
            <div class="flex-1 overflow-auto">
              {#if requests.length == 0}
                <div class="text-xs opacity-80 p-2 mx-1">
                  no message requests
                </div>
              {/if}
              {#each requests as r}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                  class="px-3 flex items-center cursor-pointer dark:hover:bg-[#2b2b2b] hover:bg-[#f2f3f5] transition-all duration-300 rounded-lg mx-2"
                  on:click={() => {}}
                >
                  <div>
                    <img class="h-12 w-12 rounded-full" alt="" src={r.avatar} />
                  </div>
                  <div
                    class="ml-4 flex-1 border-b hover:border-0 border-[#dce1e6] dark:border-[#424242] py-4"
                  >
                    <div class="flex items-bottom justify-between">
                      <p class="text-grey-darkest">{r.name}</p>
                      <p class="text-xs text-grey-darkest" />

                      <button
                        class="p-1 flex center gap-1 transition-all duration-300 m-auto mr-2 hover:bg-[#3b3b3b] rounded-lg"
                        on:click={() => {
                          user.get("requests").get(r.pub).put(false);
                          user.get("requestAproved").get(r.pub).put(true);
                          user
                            .get("canMessage")
                            .get(r.pub)
                            .put(true)
                            .then(() => {});
                        }}
                      >
                        <Plus width="1.2em" /> <span class="text-xs">Add</span>
                      </button>
                      <button
                        class="p-1 transition-all duration-300 ml-1 mr-1 text-red-600 hover:bg-[#3b3b3b] rounded-lg"
                        on:click={() => {
                          user.get("requests").get(r.pub).put(false);
                          user.get("requestAproved").get(r.pub).put(false);
                          user
                            .get("canMessage")
                            .get(r.pub)
                            .put(false)
                            .then(() => {});
                        }}
                      >
                        <TrashAlt width="1.2em" />
                      </button>
                    </div>
                    <p class="text-grey-dark mt-1 text-sm" />
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Right -->
        <div
          class="w-2/3 border-l border-[#dce1e6] dark:border-[#424242] flex flex-col"
        >
          {#if activepub}
            <!-- Header -->
            <div class="py-2 px-3 flex flex-row justify-between items-center">
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <div
                class="flex items-center cursor-pointer"
                on:click={() => {
                  goto(`/u/${activename}`);
                }}
              >
                <div>
                  <img
                    class="w-10 h-10 rounded-full"
                    alt=""
                    src={activeavatar}
                  />
                </div>
                <div class="ml-4">
                  <p class="text-grey-darkest">{activename}</p>
                  <p class="text-grey-darker text-xs mt-1" />
                </div>
              </div>
            </div>
            <!-- Messages -->
            <div class="flex-1 overflow-auto" style="">
              <div class="py-2 px-3">
                <!-- messages -->
                {#each messages as m}
                  {#if m.self}
                    <div class="flex justify-end mb-2">
                      <div class="rounded py-2 px-3 bg-[#333333]">
                        <p class="text-sm mt-1">{m.message}</p>
                        <p class="text-right text-xs text-grey-dark mt-1">
                          {moment(m.time).fromNow()}
                        </p>
                      </div>
                    </div>
                  {:else}
                    <div class="flex mb-2">
                      <div class="rounded py-2 px-3 bg-[#333333]">
                        <p class="text-sm mt-1">{m.message}</p>
                        <p class="text-right text-xs text-grey-dark mt-1">
                          {moment(m.time).fromNow()}
                        </p>
                      </div>
                    </div>
                  {/if}
                {/each}
                <div bind:this={scrollBottom} class="mb-2" />
              </div>
            </div>

            <!-- Input -->
            <div class=" px-4 py-4 flex items-center">
              <form
                autocomplete="off"
                on:submit|preventDefault={() => {
                  sendButton.click();
                }}
                class="flex w-full"
              >
                <div class="flex-1 mx-4">
                  <input
                    bind:value={q}
                    class="w-full border text-sm rounded-lg border-[#dce1e6] dark:border-[#424242] px-2 py-2 bg-transparent"
                    placeholder="Type a message.."
                    type="text"
                  />
                </div>
                <button
                  bind:this={sendButton}
                  type="submit"
                  class="cursor-pointer"
                  on:click={() => {
                    sendMessage(q);
                  }}
                >
                  <Send width="1.7em" />
                </button>
              </form>
            </div>
          {:else}
            <div class="w-full h-full center flex-col opacity-80">
              <MessageAlt width="3em" />
              pick a contact to start messaging
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
