<script>
  import imageCompression from "browser-image-compression";
  import Link from "@svicons/boxicons-regular/link.svelte";
  import { user, username } from "$lib/gun";
  import { onMount } from "svelte";

  let editable = false;
  let user_avatar;
  let username_VAL, bio_VAL, link_VAL;
  let alias_graph = user.get("alias");
  let bio_graph = user.get("bio");
  let link_graph = user.get("link");
  let avatar_graph = user.get("avatar");

  function save() {
    return new Promise(async (r) => {
      await alias_graph.put(username_VAL.innerHTML);
      await bio_graph.put(bio_VAL.innerHTML);
      await link_graph.put(link_VAL.innerHTML);
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
</script>

<div class="flex flex-col break-all justify-center items-center mt-3">
  <label for="avatar">
    <img
      src={user_avatar}
      class="h-20 w-20 aspect-square object-cover rounded-full"
      alt=""
    />
  </label>
  <input
    type="file"
    name="avatar"
    id="avatar"
    on:change={imageUploaded}
    accept="image/*"
    class="hidden"
  />
  <span class="mt-1" contenteditable={editable} bind:this={username_VAL}>
    {$username}
  </span>
  <div
    bind:this={bio_VAL}
    class="w-10/12 text-left text-xs py-2"
    contenteditable={editable}
  >
    loading
  </div>
  <div
    class="text-xs items-center text-blue-500 flex gap-1 text-opacity-75 text-left w-11/12 p-3 pt-1"
  >
    <Link width="1em" />
    <span bind:this={link_VAL} contenteditable={editable}> loading </span>
  </div>
  <button
    on:click={async () => {
      if (editable) {
        editable = false;
        await save().then(() => {
          console.log("saved");
        });
      } else {
        editable = true;
        setTimeout(function () {
          username_VAL.focus();
        }, 0);
      }
    }}
    class="w-10/12 bg-[#d7d7e0] text-black rounded-md text-sm p-1 transition-colors duration-300 hover:bg-[#c3c3ca]"
  >
    {editable ? "save" : "edit"}
  </button>
</div>
