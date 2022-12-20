<script>
  import { getUserAvatar, usernameGet } from "$lib/utils";
  import imageCompression from "browser-image-compression";
  import { v4 } from "uuid";
  import { db, user, username } from "$lib/gun.js";
  import MessgageUser from "../../comp/messgageUser.svelte";

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
    class="h-44 w-20 rounded-md brightness-[0.8] object-cover  flex justify-center items-center border border-[#2c2b2b]"
    alt=""
  />
  <div class="fixed h-44 w-20 flex justify-center items-end mb-4">
    <label for="highlight-chooser">
      <div class="flex justify-center items-center">
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
        follow people or message them by visiting their profile for them to show
        up here
      </div>
    {/if}
    {#each messaging_followers as f}
      <MessgageUser {f} />
    {/each}
  </div>
</div>
