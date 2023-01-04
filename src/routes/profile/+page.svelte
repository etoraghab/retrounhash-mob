<script>
  import Postinprofile from "./../../comp/postinprofile.svelte";
  import imageCompression from "browser-image-compression";
  import Link from "@svicons/boxicons-regular/link.svelte";
  import Copy from "@svicons/boxicons-regular/copy.svelte";
  import Open from "@svicons/boxicons-regular/window-alt.svelte";
  import { db, keys, user, username } from "$lib/gun";
  import { onMount } from "svelte";
  import { copyToClipboard } from "$lib/utils";
  import TrashAlt from "@svicons/boxicons-regular/trash-alt.svelte";
  import { goto } from "$app/navigation";
  import Loading from "../../comp/loading.svelte";
  import Icon from "svelte-icons-pack";
  import FaMapMarkerAlt from "svelte-icons-pack/fa/FaSolidMapMarkerAlt";

  let editable = false;
  let user_avatar, displayName, saved, location, editting, background;
  let bio_VAL, link_VAL;
  let bio_graph = user.get("bio");
  let avatar_graph = user.get("avatar");
  let background_graph = user.get("background");
  let displayName_graph = user.get("displayName");
  let location_graph = user.get("displayLocation");

  background_graph.once((val) => {
    background =
      val ||
      `https://images.unsplash.com/photo-1578735546632-9ff1f1e7518e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`;
  });

  location_graph.once((l) => {
    location = l;
  });

  displayName_graph.once((n) => {
    displayName = n || $username;
  });

  function save() {
    return new Promise(async (r) => {
      bio_VAL = bio_VAL
        .replace(/#+([a-zA-Z0-9_]+)/gi, '<a href="/search/#$1">#$1</a>')
        .replace(/\n/g, "<br>");
      await displayName_graph.put(displayName);
      await bio_graph.put(bio_VAL);
      await location_graph.put(location);
      saved = true;
      editting = false;
      setTimeout(() => {
        saved = false;
      }, 2000);
      r();
    });
  }

  function blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
  bio_graph.once((val) => {
    // val = val
    //   .replace(/#+([a-zA-Z0-9_]+)/gi, '<a href="/search/#$1">#$1</a>')
    //   .replace(/\\n/g, "<br>");
    bio_VAL = val || "404 no bio found";
  });

  avatar_graph.once((val) => {
    user_avatar =
      val || `https://avatars.dicebear.com/api/identicon/${$username}.svg`;
  });

  function imageUploaded() {
    var file = document.querySelector("#avatar").files[0];
    var reader = new FileReader();
    reader.onload = async function () {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 300,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        let base64IMG = await blobToBase64(compressedFile);
        await avatar_graph.put(base64IMG);
        user_avatar = base64IMG;
        base64IMG = "";
      } catch (error) {
        console.log(error);
      }
    };
    reader.readAsDataURL(file);
  }

  function backdroundUpload() {
    var file = document.querySelector("#background").files[0];
    var reader = new FileReader();
    reader.onload = async function () {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        let base64IMG = await blobToBase64(compressedFile);
        await background_graph.put(base64IMG);
        background = base64IMG;
        base64IMG = "";
      } catch (error) {
        console.log(error);
      }
    };
    reader.readAsDataURL(file);
  }

  let posts = [];

  import moment from "moment";
  import {
    Camera,
    Check,
    Pencil,
    WindowOpen,
    X,
  } from "@svicons/boxicons-regular";

  moment().format();
  user
    .get("posts")
    .map()
    .once(async (p, u) => {
      if (typeof p == "object" && p) {
        let date = Gun.state.is(p, "content");
        posts = [
          {
            content: p.content,
            uid: u,
            date: moment(date).calendar(),
            sortDate: date,
          },
          ...posts,
        ];
      }
    });

  export let data;
</script>

<svelte:head>
  <title>
    {$username} - profile
  </title>
  <meta
    name="description"
    content="Edit and manage your profile on retrounhash, the decentralized social platform."
  />
</svelte:head>
<div
  class="{$username
    ? ''
    : 'hidden'} flex flex-col break-all justify-center items-center mt-1 pl-1"
>
  <div class="w-full flex items-center justify-start pl-2 pr-1">
    <div class="center w-full">
      <img
        src={background}
        class="w-full h-40 object-cover brightness-50 rounded-lg rounded-t-md"
        alt=""
      />
      <div class="absolute">
        <div class="flex gap-2">
          <label
            for="background"
            class="p-2 bg-[#646464] bg-opacity-30 rounded-full"
          >
            <Pencil width="1.6em" />
          </label>
          <button
            on:click={() => {
              background_graph.put(
                "https://images.unsplash.com/photo-1578735546632-9ff1f1e7518e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
              );
              background =
                "https://images.unsplash.com/photo-1578735546632-9ff1f1e7518e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80";
            }}
            class="p-2 bg-[#646464] bg-opacity-30 rounded-full"
          >
            <X width="1.6em" />
          </button>
        </div>
      </div>
    </div>
    <div class="center z-[99999999] absolute mt-40 ml-3">
      <img
        src={user_avatar}
        class="w-20 brightness-50 h-20 object-cover rounded-full shadow-sm shadow-black"
        alt=""
      />
      <div class="absolute">
        <div class="flex gap-2">
          <label
            for="avatar"
            class="p-2 cursor-pointer bg-[#646464] bg-opacity-30 rounded-full"
          >
            <Camera width="1em" />
          </label>
          <button
            on:click={async () => {
              await avatar_graph.put(
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
              );
              user_avatar =
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
            }}
            class="p-2 cursor-pointer bg-[#646464] bg-opacity-30 rounded-full"
          >
            <X width="1em" />
          </button>
        </div>
      </div>
    </div>

    <input
      type="file"
      name="avatar"
      id="avatar"
      on:change={imageUploaded}
      accept="image/*"
      class="hidden"
    />

    <input
      type="file"
      name="background"
      id="background"
      on:change={backdroundUpload}
      accept="image/*"
      class="hidden"
    />
  </div>
  <div class="h-16 w-full flex justify-end pr-5">
    <button
      on:click={() => {
        editting = true;
        bio_VAL = bio_VAL
          .replace(/\<a href\=\"\/search\/(.*)\"\>(.*)\<\/a\>/g, "$1")
          .replace(/\<br\>/g, "\n");
      }}
      class="dark:bg-[#d2d4d6] m-auto mr-3 dark:text-black gap-3 h-7 my-auot transition-all duration-300 text-sm p-1 dark:hover:bg-[#b6b9bb] rounded-lg px-3"
    >
      edit profile
    </button>
    <button
      on:click={() => {
        goto("/u/" + $username);
      }}
      class="dark:bg-[#d2d4d6] my-auto dark:text-black gap-3 h-7 transition-all duration-300 text-sm p-1 dark:hover:bg-[#b6b9bb] rounded-lg px-2"
    >
      <WindowOpen width="1.2em" />
    </button>
  </div>
  <div class="text-left flex-col flex truncate w-full pl-3 text-lg">
    <div class="flex gap-1 items-center">
      <span>
        {displayName}
      </span>
      {#if data.isVerified}
        <span>
          <Check width="1.2em" />
        </span>
      {/if}
    </div>
    <span class="text-sm opacity-75">
      @{$username}
    </span>
  </div>
  {#if editting}
    <div class="w-full pl-3 pt-3 justify-start">
      <div
        class="border border-[#3c7ab6] dark:border-[#346ca3] border-opacity-50 rounded-lg p-2 mb-2"
      >
        <div class="opacity-90 text-xs pl-1 capitalize">Name</div>
        <input
          type="text"
          bind:value={displayName}
          placeholder={$username}
          class="pl-2 h-4 text-lg w-full bg-transparent rounded-lg resize-none"
        />
      </div>
      <div
        class="border border-[#3c7ab6] dark:border-[#346ca3] border-opacity-50 rounded-lg p-2 mb-2"
      >
        <div class="opacity-90 text-xs pl-1 capitalize">about you</div>
        <textarea
          type="text"
          bind:value={bio_VAL}
          placeholder=""
          class="pl-2 h-16 text-lg w-full bg-transparent rounded-lg resize-none"
        />
      </div>
      <div
        class="border border-[#3c7ab6] dark:border-[#346ca3] border-opacity-50 rounded-lg p-2 mb-2"
      >
        <div class="opacity-90 text-xs pl-1 capitalize">Location</div>
        <input
          type="text"
          bind:value={location}
          placeholder="New York"
          class="pl-2 h-4 text-lg w-full bg-transparent rounded-lg resize-none"
        />
      </div>
      <div class="w-full flex">
        <button
          on:click={() => {
            editting = false;
          }}
          class="flex ml-1 mt-2 gap-3 transition-all duration-300 text-sm p-1 rounded-lg px-3 dark:hover:bg-[#2c2c2c] hover:bg-[#f2f3f5]"
        >
          close
        </button>
        <button
          on:click={save}
          class="flex dark:bg-[#d2d4d6] dark:text-black mr-auto ml-1 mt-2 gap-3 transition-all duration-300 text-sm p-1 dark:hover:bg-[#b6b9bb] rounded-lg mx-auto px-3"
        >
          {#if saved}
            <Check width="1.4em" />
          {:else}
            save
          {/if}
        </button>
      </div>
    </div>
  {:else}
    <div class="w-full pt-4 pl-3 justify-start">
      <div class="text-md  flex flex-col gap-1">
        <span class="text-[14px] line-clamp-6">
          {@html bio_VAL || "404: bio not found"}
        </span>
        {#if location}
          <span
            class="flex opacity-60 text-[13px] gap-1 capitalize items-center"
          >
            <Icon src={FaMapMarkerAlt} color="gray" size="15" />
            {location}
          </span>
        {/if}
      </div>
    </div>
  {/if}
  <div class="w-11/12 mt-12">
    <div class="text-lg">Post Management</div>
    {#each posts as p}
      <Postinprofile {p} />
    {/each}
    {#if posts.length == 0}
      <div class="text-sm">
        no posts, <button
          class="underline"
          on:click={() => {
            goto("/");
          }}>write one.</button
        >
      </div>
    {/if}
  </div>
</div>

{#if !$username}
  <div class="w-full h-screen center">
    <Loading />
  </div>
{/if}
