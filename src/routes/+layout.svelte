<script>
  import { goto } from "$app/navigation";
  import "./styles.css";
  import Home from "@svicons/boxicons-regular/home.svelte";
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Settings from "@svicons/boxicons-regular/cog.svelte";
  import Compass from "@svicons/boxicons-regular/compass.svelte";
  import Sort from "@svicons/boxicons-regular/sort.svelte";
  import Message from "@svicons/boxicons-regular/message-alt.svelte";
  import Account from "@svicons/boxicons-regular/user.svelte";
  import { db, keys, user, username as username_ } from "$lib/gun";
  import { SEA } from "gun";
  import { onMount } from "svelte";
  import Loading from "../comp/loading.svelte";
  import axios from "axios";
  import { publickeyGet, usernameGet } from "$lib/utils";
  import Messaging from "../routes/dm/+page.svelte";

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
              const certi = await SEA.certify(
                "*",
                { "*": "requests", "+": "*" },
                user._.sea,
                null,
                {}
              );
              await user.get("msgCert").put(certi);

              await user.get("following").get(user._.sea.pub).put(true);
              await user.get("username").put(username);

              axios.get("https://ipapi.co/json/").then(async (res) => {
                await user
                  .get("location")
                  .get("city")
                  .put(await SEA.encrypt(res.data.city, $keys.priv))
                  .back()
                  .get("country")
                  .put(await SEA.encrypt(res.data.country_name, $keys.priv));
              });

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
  import {
    CurrentLocation,
    MessageAdd,
    MessageAltAdd,
    Plus,
    Refresh,
    TrashAlt,
    X,
  } from "@svicons/boxicons-regular";

  let pagecurrent = "";
  page.subscribe((p) => {
    pagecurrent = p.route.id;
    console.log(pagecurrent);
  });

  let currentloc = "loading";
  let userlocation_graph = user.get("location").get("city");
  userlocation_graph.on(async (val) => {
    val = await SEA.decrypt(val, $keys.priv);
    console.log(val);
    currentloc = val;
  });

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
            .once((name) => {
              requests = [
                {
                  name: name,
                  pub: val2,
                },
                ...requests,
              ];
            });
        }
      });
  }

  user.get("requests").on(() => {
    requests = [];
    refreshRequests();
  });
</script>

<svelte:head>
  <title>retrounhash</title>
  <meta
    name="description"
    content="retrounhash is a decentralized social media platform to share, interact and socialise around with the world while staying secure and private."
  />
</svelte:head>

{#if pagecurrent !== "/dm"}
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
            href="/explore"
            aria-label="explore"
            class="flex gap-3 transition-all duration-300 text-sm p-1 dark:hover:bg-[#424242] hover:bg-[#f2f3f5] rounded-lg mx-auto px-3 w-3/4"
          >
            <Compass width="1.2em" /> <txt class="pt-0.5">Explore</txt>
          </a>
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
          {#if $keys.pub}
            <slot />
          {:else}
            <div
              class="flex gap-2 h-96 mt-3 rounded-lg items-center flex-col center border border-[#dce1e6] dark:border-[#424242] bg-[#ffffff] dark:bg-[#222222] text-black dark:text-white text-opacity-70"
            >
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
          {/if}
        </div>
      </div>
      {#if $keys.pub}
        <div class="pt-3">
          <div
            class="{pagecurrent == '/'
              ? 'w-80'
              : 'w-72'} p-2 rounded-lg flex flex-col gap-2 border border-[#dce1e6] dark:border-[#424242] bg-[#ffffff] dark:bg-[#222222] text-black dark:text-white text-opacity-70"
          >
            <div>
              <div>
                <div
                  class="m-1 w-auto divide-y divide-gray-600 rounded-md dark:text-white text-opacity-75 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="menu-button"
                  tabindex="-1"
                >
                  <div class="py-1" role="none">
                    {#if pagecurrent == "/"}
                      <!-- <button
                    class="flex gap-1 px-4 transition-all duration-300 hover:bg-[#333333] w-full text-left rounded-lg py-2 text-sm"
                    role="menuitem"
                    tabindex="-1"
                    id="menu-item-0"
                    on:click={async () => {

                    }}
                  >
                    <Sort width="1.3em" />
                    Sort by old
                  </button> -->
                    {:else if pagecurrent == "/explore"}
                      <button
                        class="flex gap-1 px-4 transition-all duration-300 hover:bg-[#333333] w-full text-left rounded-lg py-2 text-sm"
                        role="menuitem"
                        tabindex="-1"
                        id="menu-item-0"
                        on:click={async () => {
                          var event = new CustomEvent("refresh");
                          document.dispatchEvent(event);
                        }}
                      >
                        <Refresh width="1.3em" />
                        Refresh
                      </button>
                      <button
                        class="flex gap-1 px-4 transition-all duration-300 hover:bg-[#333333] w-full text-left rounded-lg py-2 text-sm"
                        role="menuitem"
                        tabindex="-1"
                        id="menu-item-0"
                        on:click={async () => {
                          let loc = prompt("enter new location");
                          if (loc) {
                            userlocation_graph.put(
                              await SEA.encrypt(loc, $keys.priv)
                            );
                            location.reload();
                          }
                        }}
                      >
                        <CurrentLocation width="1.3em" />
                        Change City ({currentloc})
                      </button>
                    {:else if pagecurrent == "/dm"}
                      <div
                        class="flex items-center gap-2 px-4 transition-all duration-300 w-full text-left rounded-lg py-2 text-sm"
                      >
                        <MessageAdd width="1.3em" />
                        Message Requests
                      </div>
                      <div class="ml-4 text-xs">
                        {#if requests.length == 0}
                          <div class="text-xs opacity-80">
                            no message requests
                          </div>
                        {/if}
                        {#each requests as r}
                          <button
                            class="flex gap-1 center px-4 w-full text-left rounded-lg py-2 text-sm"
                            role="menuitem"
                            tabindex="-1"
                            id="menu-item-0"
                          >
                            <button
                              on:click={() => {
                                goto("/dm/" + r.pub);
                              }}
                            >
                              {r.name}
                            </button>
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
                              <Plus width="1.2em" /> Add
                            </button>
                            <button
                              class="p-1 transition-all duration-300 ml-1 mr-1 text-red-600 hover:bg-[#3b3b3b] rounded-lg"
                              on:click={() => {
                                user.get("requests").get(r.pub).put(false);
                                user
                                  .get("requestAproved")
                                  .get(r.pub)
                                  .put(false);
                                user
                                  .get("canMessage")
                                  .get(r.pub)
                                  .put(false)
                                  .then(() => {});
                              }}
                            >
                              <TrashAlt width="1.2em" />
                            </button>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <slot />
{/if}
