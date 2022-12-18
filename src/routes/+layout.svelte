<script>
  import "./styles.css";
  import Home from "@svicons/boxicons-regular/home.svelte";
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Settings from "@svicons/boxicons-regular/cog.svelte";
  import Message from "@svicons/boxicons-regular/message-alt.svelte";
  import Account from "@svicons/boxicons-regular/user.svelte";
  import { db, keys, user, username as username_ } from "$lib/gun";
  import { SEA } from "gun";

  let username, password;

  function toast(a) {
    console.log(a);
  }
</script>

<div class="flex h-screen bg-[#141414] text-white text-opacity-75">
  <div
    class="h-full w-12 flex flex-col gap-2 bg-[#19191a] text-white text-opacity-70"
  >
    <div class="mx-auto mt-3 text-white text-opacity-70">
      <img
        class="w-5 rounded-md h-auto aspect-square "
        src="/assets/logo.svg"
        alt=""
      />
    </div>
    <a href="/" class="mx-auto mt-2 p-2 rounded-md bg-[#202020]">
      <Home width="1.2em" />
    </a>
    <a href="/search" class="mx-auto mt-2 p-2 rounded-md bg-[#202020]">
      <Search width="1.2em" />
    </a>
    <a href="/dm" class="mx-auto mt-2 p-2 rounded-md bg-[#202020]">
      <Message width="1.2em" />
    </a>
    <a href="/profile" class="mx-auto mt-2 p-2 rounded-md bg-[#202020]">
      <Account width="1.2em" />
    </a>

    <div class="mx-auto mt-auto mb-3 p-2 rounded-md bg-[#202020]">
      <Settings width="1.2em" />
    </div>
  </div>
  <div class="w-full h-full overflow-scroll">
    {#if $username_}
      <slot />
      <div class="p-2" />
    {:else}
      <div class="w-full h-full flex justify-center items-center">
        <div class="flex gap-2 items-center flex-col">
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
          <button
            on:click={() => {
              user.auth(username, password, (e) => {
                if (e.err == "Wrong user or password.") {
                  user.create(username, password, (e) => {
                    if (e.ok == 0) {
                      user.auth(username, password, async (e) => {
                        const cert = await SEA.certify(
                          "*",
                          { "*": "followers", "+": "*" },
                          user._.sea,
                          null,
                          {}
                        );
                        await user.get("followersCert").put(cert);
                        await user
                          .get("following")
                          .get(user._.sea.pub)
                          .put(true);
                        location.reload();
                        toast("success");
                      });
                    } else if (e.err == "User already created!") {
                      toast("error", "wrong username/pass");
                    } else if (e.err == undefined) {
                      toast("success", "user created");
                    } else {
                      toast("error", e.err);
                    }
                  });
                } else if (e.err == "User already created!") {
                  toast("error", "wrong username/pass");
                }
              });
            }}
            class="w-full bg-[#d7d7e0] text-black rounded-md text-sm p-1 transition-colors duration-300 hover:bg-[#c3c3ca]"
          >
            continue
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
