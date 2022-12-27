<script>
  import { goto } from "$app/navigation";
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

  let q;
  import { page } from "$app/stores";

  let pagecurrent = "";
  page.subscribe((p) => {
    pagecurrent = p.route.id;
    console.log(pagecurrent);
  });
</script>

<svelte:head>
  <title>retrounhash</title>
  <meta
    name="description"
    content="retrounhash is a decentralized social media platform to share, interact and socialise around with the world while staying secure and private."
  />
</svelte:head>
<div
  class="flex w-full z-50 fixed top-0 center h-12 bg-[#ffffff] dark:bg-[#222222] text-black dark:text-white text-opacity-75"
>
  <div class="md:w-2/3 lg:w-2/3 center">
    <div class="w-full">
      <div class="flex">
        <a href="/">
          <img
            class="w-8 rounded-full h-auto aspect-square"
            src="/assets/android-icon-48x48.png"
            alt=""
          /></a
        >
        <div class="w-32" />
        <div class="w-2" />
        <div class="flex bg-[#edeef0] dark:bg-[#424242] rounded-lg p-1 pl-2">
          <div class="opacity-50 flex center">
            <Search width="1.2em" />
          </div>
          <form
            on:submit|preventDefault={() => {
              goto("/search/" + q);
            }}
          >
            <input
              type="text"
              bind:value={q}
              class="pl-2 bg-[#edeef0] dark:bg-[#424242] rounded-lg text-sm"
              placeholder="Search"
            />
            <button type="submit" class="hidden" />
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="h-12" />
<div
  class="w-full flex justify-center items-center bg-[#edeef0] dark:bg-[#141414] text-black dark:text-white text-opacity-75"
>
  <div class="md:w-3/4 lg:w-2/3 flex h-screen">
    <div class="pt-3">
      <div
        class="w-40 pt-2 rounded-lg border border-[#dce1e6] dark:border-[#424242] flex flex-col gap-2 bg-[#ffffff] dark:bg-[#222222] text-black dark:text-white text-opacity-70"
      >
        <a
          href="/"
          aria-label="home"
          class="flex gap-3 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg mx-auto px-3 w-3/4"
        >
          <Home width="1.2em" /> <txt class="pt-0.5">Home</txt>
        </a>
        <!-- <a
          href="/search"
          aria-label="home"
          class="flex gap-3 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg mx-auto px-3 w-3/4"
        >
          <Search width="1.2em" /> <txt class="pt-0.5">Search</txt>
        </a> -->
        <a
          href="/dm"
          aria-label="home"
          class="flex gap-3 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg mx-auto px-3 w-3/4"
        >
          <Message width="1.2em" /> <txt class="pt-0.5">Messages</txt>
        </a>
        <a
          href="/profile"
          aria-label="home"
          class="flex gap-3 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg mx-auto px-3 w-3/4"
        >
          <Account width="1.2em" /> <txt class="pt-0.5">Profile</txt>
        </a>
        <div class="h-60" />
        <a
          href="/settings"
          aria-label="home"
          class="flex gap-3 mb-2 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg mx-auto px-3 w-3/4"
        >
          <Settings width="1.2em" /> <txt class="pt-0.5">Settings</txt>
        </a>
      </div>
    </div>
    <div class="overflow-scroll w-full flex justify-center h-full">
      <div class="w-full px-2">
        <slot />
      </div>
    </div>
    <div class="pt-3">
      <div
        class="{pagecurrent == '/'
          ? 'w-80'
          : 'w-72'} h-52 p-2 rounded-lg flex flex-col gap-2 bg-[#ffffff] dark:bg-[#222222] dark:hover:bg-[#424242] text-black dark:text-white text-opacity-70"
      >
        <div />
      </div>
    </div>
  </div>
</div>
<!-- <div class="h-full ">
  <div class="w-full">
    {#if $keys.pub}
      <div class="flex">
        <div class="w-12" />
        <div
          class="w-full pb-2.5 bg-[#edeef0] dark:bg-[#141414] text-black dark:text-white text-opacity-75"
        />
      </div>
    {:else if loading}
      <div class="pl-10 w-screen h-screen center">
        <Loading />
      </div>
    {:else}
      <div class="pl-10 w-screen h-screen center">
        <div class="flex gap-2 items-center flex-col">
          <div class="text-xl">retrounhash</div>
          <form
            on:submit|preventDefault={handleAuth}
            class="flex gap-1 items-center flex-col"
          >
            <input
              type="text"
              autocomplete="current-username"
              class="bg-[#ffffff] dark:bg-[#222222] p-2 rounded-lg text-sm"
              placeholder="username"
              bind:value={username}
            />
            <input
              autocomplete="current-password"
              type="password"
              class="bg-[#ffffff] dark:bg-[#222222] p-2 rounded-lg text-sm"
              placeholder="*********"
              bind:value={password}
            />
            <button
              on:click={handleAuth}
              disabled={username == undefined}
              class="w-full {disabled && username !== undefined
                ? 'bg-blue-900 hover:bg-blue-800'
                : 'bg-[#383838] text-white text-opacity-70'} rounded-lg text-sm p-1 transition-colors duration-300"
            >
              {#if username == undefined}
                continue
              {:else if disabled}
                login
              {:else}
                sign up
              {/if}
            </button>
          </form>
        </div>
      </div>
    {/if}
  </div> -->
<!-- </div> -->
