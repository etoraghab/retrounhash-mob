<script>
  import { getUserAvatar, usernameGet } from "$lib/utils";
  import imageCompression from "browser-image-compression";
  import { v4 } from "uuid";
  import { db, user, username } from "$lib/gun.js";
  import MessgageUser from "../../comp/messgageUser.svelte";
  import { Plus, TrashAlt } from "@svicons/boxicons-regular";
  import { goto } from "$app/navigation";

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

  function removeDUP_chat() {
    let a = messaging_followers.filter(
      (v, i, a) =>
        a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i
    );
    messaging_followers = a;
  }
  $: messaging_followers, removeDUP_chat();

  function blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async function uploadHighlight() {
    var file = document.querySelector("#highlight-chooser").files[0];
    var reader = new FileReader();
    reader.onload = async function () {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        let base64IMG = await blobToBase64(compressedFile);
        user
          .get("highlights")
          .get(v4())
          .put({
            img: base64IMG,
            caption: prompt("caption"),
          })
          .then((e) => {
            base64IMG = "";
          });
      } catch (error) {
        console.log(error);
      }
    };
    reader.readAsDataURL(file);
  }

  let tab = "Chats";
  let tabs_list = ["Chats", "Requests"];

  let requests = [];
  function refreshRequests() {
    user
      .get("requests")
      .map()
      .once(async (val, val2) => {
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
  <title>messaging - retrounhash</title>
  <meta
    name="description"
    content="Make messagin private, secure and fast with retrounhash, the decentralized social platform."
  />
</svelte:head>
<!-- <div class="flex items-center">
  <img
    src={$avatar}
    class="h-44 w-20 rounded-md brightness-[0.8] object-cover  center border border-[#2c2b2b]"
    alt=""
  />
  <div class="fixed h-44 w-20 flex justify-center items-end mb-4">
    <label for="highlight-chooser">
      <div class="center">
        <Icon src={Plus} size="2.5rem" />
      </div>
      <div class="text-xs text-center">story</div>
    </label>

  </div>
</div>
<div class="overflow-scroll flex ">
  {#each following as f}
    <Highlight pub={f} />
  {/each}
</div> -->
<!-- 
<div class="p-3">
  <div class="flex justify-center flex-col gap-3">
    <div class="flex overflow-x-scroll w-[90px] m-auto">
      {#each following as f}
        <Highlight pub={f} />
      {/each}
    </div>
  </div>
</div>
adwwwwwwww
<input
  type="file"
  name="highlight-chooser"
  id="highlight-chooser"
  on:change={uploadHighlight}
  accept="image/*"
  class="hidden"
/> -->

<div class="w-full flex flex-col justify-center items-center mt-3">
  <div class="text-xl mb-3 w-11/12 text-left">Messages</div>
  <div class="flex w-11/12 gap-1 flex-col justify-center items-center">
    <div class="flex w-full my-2">
      {#each tabs_list as i}
        <button
          on:click={() => {
            tab = i;
          }}
          class="w-1/2 center {tab === i
            ? 'border-b border-[#3c7ab6] dark:border-[#346ca3]'
            : 'border-b dark:border-[#222222] border-[#edeef0]'} pb-1 transition-all duration-500"
        >
          {i}
          {#if i == "Requests"}
            <span class="text-xs my-auto ml-2">({requests.length})</span>
          {/if}
        </button>
      {/each}
    </div>

    {#if tab == "Chats"}
      <div class="text-xs text-left w-full">
        {messaging_followers.length}
        {#if messaging_followers.length >= 2 || messaging_followers.length == 0}
          contacts
        {:else}
          contact
        {/if}
      </div>
      {#if messaging_followers.length == 0}
        <div class="text-xs capitalize ">
          follow people or message them by visiting their profile for them to
          show up here
        </div>
      {/if}
      {#each messaging_followers as f}
        <MessgageUser {f} />
      {/each}
    {:else}
      <div class="flex-1 flex-col overflow-auto w-full center">
        {#if requests.length == 0}
          <div class="text-xs opacity-80 p-2 mx-1">no message requests</div>
        {/if}
        {#each requests as r}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="px-1 w-full flex items-center cursor-pointer dark:hover:bg-[#2b2b2b] hover:bg-[#f2f3f5] transition-all duration-300 rounded-lg"
          >
            <div>
              <img
                on:click={() => {
                  goto("/u/" + r.name);
                }}
                class="h-6 w-6 rounded-full"
                alt=""
                src={r.avatar}
              />
            </div>
            <div
              class="ml-4 flex-1 border-b hover:border-0 border-[#dce1e6] dark:border-[#363636] py-1"
            >
              <div class="flex items-bottom justify-between">
                <p
                  class="text-grey-darkest text-xs truncate w-24"
                  on:click={() => {
                    goto("/u/" + r.name);
                  }}
                >
                  {r.name}
                </p>
                <p class="text-xs text-grey-darkest" />

                <button
                  class="p-1 flex center gap-1 transition-all duration-300 m-auto mr-2 dark:hover:bg-[#363636] hover:bg-[#dadadb] rounded-lg"
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
                  class="p-1 transition-all duration-300 ml-1 mr-1 text-red-600 dark:hover:bg-[#363636] hover:bg-[#dadadb] rounded-lg"
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
</div>
