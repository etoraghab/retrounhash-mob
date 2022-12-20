<script>
  import "./styles.css";
  import Home from "@svicons/boxicons-regular/home.svelte";
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Settings from "@svicons/boxicons-regular/cog.svelte";
  import Message from "@svicons/boxicons-regular/message-alt.svelte";
  import Account from "@svicons/boxicons-regular/user.svelte";
  import { db, keys, user, username as username_ } from "$lib/gun";
  import { SEA } from "gun";
  import { onMount } from "svelte";
  import Loading from "../comp/loading.svelte";
  import { publickeyGet, usernameGet } from "$lib/utils";

  let username, password, disabled;

  function toast(a) {
    console.log(a);
  }

  let loading = true;
  onMount(() => {
    if (localStorage.getItem("keys")) {
      user.auth(JSON.parse(localStorage.getItem("keys")), function (res) {
        console.log("loggedIN");
        loading = false;
      });
    } else {
      loading = false;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(
        function (registration) {},
        function (err) {
          console.error(err);
        }
      );
    }
  });

  async function auditUsername() {
    if (username) {
      disabled = false;
      await publickeyGet(username).then((val) => {
        if (val) {
          disabled = true;
        }
      });
    } else {
      disabled = true;
    }
  }

  $: username, auditUsername();

  async function handleAuth() {
    loading = true;
    user.auth(username, password, (e) => {
      if (e.err == "Wrong user or password.") {
        user.create(username, password, async (e) => {
          if (e.ok == 0) {
            var data = user.is.pub || user._.sea.pub;
            var hash = await SEA.work(data, null, null, {
              name: "SHA-256",
            });
            db.get(`#${username}`).get(hash).put(data);
            db.get(`#${username}`).get(hash).once(console.log);

            // auth now
            user.auth(username, password, async (e) => {
              const cert = await SEA.certify(
                "*",
                { "*": "followers", "+": "*" },
                user._.sea,
                null,
                {}
              );
              await user.get("followersCert").put(cert);
              await user.get("following").get(user._.sea.pub).put(true);
              await user.get("username").put(username);
              loading = false;
              toast("success");
            });
          } else if (e.err == "User already created!") {
            toast("error", "wrong username/pass");
          } else if (e.err == undefined) {
            toast("success", "user created");
          } else {
            toast("error", e.err);
          }
          loading = false;
        });
      } else if (e.err == "User already created!") {
        toast("error", "wrong username/pass");
      }
    });
  }
</script>

<svelte:head>
  <title>retrounhash</title>
  <meta
    name="description"
    content="retrounhash is a decentralized social media platform to share, interact and socialise around with the world while staying secure and private."
  />
</svelte:head>
<div class="flex h-screen bg-[#141414] text-white text-opacity-75">
  <div
    class="h-full w-12 flex flex-col gap-2 bg-[#19191a] text-white text-opacity-70"
  >
    <div class="pt-1" />
    <div class="mx-auto mt-2 text-white text-opacity-70">
      <img
        class="w-8 rounded-md h-auto aspect-square "
        src="/assets/android-icon-48x48.png"
        alt=""
      />
    </div>
    <a href="/" aria-label="home" class="mx-auto mt-2 p-2 rounded-md">
      <Home width="1.2em" />
    </a>
    <a href="/search" aria-label="search" class="mx-auto mt-2 p-2 rounded-md">
      <Search width="1.2em" />
    </a>
    <a href="/dm" aria-label="messages" class="mx-auto mt-2 p-2 rounded-md ">
      <Message width="1.2em" />
    </a>
    <a href="/profile" aria-label="profile" class="mx-auto mt-2 p-2 rounded-md">
      <Account width="1.2em" />
    </a>

    <a
      href="/settings"
      aria-label="settings"
      class="mx-auto mt-auto mb-3 p-2 rounded-md"
    >
      <Settings width="1.2em" />
    </a>
  </div>
  <div class="w-full h-full overflow-x-scroll">
    {#if $keys.pub}
      <slot />
      <div class="p-2" />
    {:else if loading}
      <div class="w-full h-full flex justify-center items-center">
        <Loading />
      </div>
    {:else}
      <div class="w-full h-full flex justify-center items-center">
        <div class="flex gap-2 items-center flex-col">
          <div class="text-md">retrounhash</div>
          <input
            type="text"
            class="bg-[#19191a] p-2 rounded-md text-sm"
            placeholder="username"
            bind:value={username}
          />
          <input
            type="password"
            class="bg-[#19191a] p-2 rounded-md text-sm"
            placeholder="*********"
            bind:value={password}
          />
          <!-- <button
            on:click={async () => {
              user.auth(username, password, (e) => {
              });
            }}
            class="w-full bg-[#d7d7e0] hover:bg-[#c3c3ca] text-black rounded-md text-sm p-1 transition-colors duration-300"
          >
            login
          </button> -->
          <button
            on:click={handleAuth}
            disabled={username == undefined}
            class="w-full {disabled && username !== undefined
              ? 'bg-blue-900 hover:bg-blue-800'
              : 'bg-[#d7d7e0] hover:bg-[#c3c3ca] text-black'} rounded-md text-sm p-1 transition-colors duration-300"
          >
            {#if username == undefined}
              continue
            {:else if disabled}
              login
            {:else}
              sign up
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
