<script>
  import "./styles.css";
  import NProgress from "nprogress";
  import { navigating } from "$app/stores";

  import "nprogress/nprogress.css";

  NProgress.configure({
    showSpinner: false,
    minimum: 0.16,
    template:
      '<div class="bar" role="bar" style="background: #155fe5;"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>',
  });

  $: {
    if ($navigating) {
      NProgress.start();
    }
    if (!$navigating) {
      NProgress.done();
    }
  }

  import Home from "@svicons/boxicons-regular/home.svelte";
  import Search from "@svicons/boxicons-regular/search.svelte";
  import Settings from "@svicons/boxicons-regular/cog.svelte";
  import Compass from "@svicons/boxicons-regular/compass.svelte";
  import Message from "@svicons/boxicons-regular/message-alt.svelte";
  import Account from "@svicons/boxicons-regular/user.svelte";
  import { db, keys, user, username as username_ } from "$lib/gun";
  import { SEA } from "gun";
  import { onMount } from "svelte";
  import Loading from "../comp/loading.svelte";
  import { publickeyGet, usernameGet } from "$lib/utils";

  onMount(() => {
    const mobileAndTabletCheck = function () {
      let check = false;
      (function (a) {
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
            a
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
          )
        )
          check = true;
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    };

    if (mobileAndTabletCheck() !== true) {
      location.href = "https://retrounhash.eu.org";
    }
  });
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

  import axios from "axios";
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
                  .put(await SEA.encrypt((res.data.city).toLowerCase(), $keys.priv))
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
</script>

<svelte:head>
  <title>retrounhash</title>
  <meta
    name="description"
    content="retrounhash is a decentralized social media platform to share, interact and socialise around with the world while staying secure and private."
  />
</svelte:head>
<div
  class="h-full bg-[#edeef0] dark:bg-[#141414] text-black dark:text-white text-opacity-75"
>
  <div
    class="w-12 h-full fixed left-0 top-0 flex flex-col gap-2 bg-[#ffffff] dark:bg-[#19191a] text-black dark:text-white text-opacity-70"
  >
    <div class="mx-auto mt-2 text-black dark:text-white text-opacity-70">
      <a href="/">
        <img
          class="w-8 rounded-md h-auto aspect-square"
          src="/assets/android-icon-48x48.png"
          alt=""
        /></a
      >
    </div>
    <a href="/" aria-label="home" class="mx-auto mt-2 p-2 rounded-md">
      <Home width="1.2em" />
    </a>
    <a href="/search" aria-label="search" class="mx-auto mt-2 p-2 rounded-md">
      <Search width="1.2em" />
    </a>
    <a href="/explore" aria-label="explore" class="mx-auto mt-2 p-2 rounded-md">
      <Compass width="1.2em" />
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
  <div class="w-full">
    {#if $keys.pub}
      <div class="flex">
        <div class="w-12" />
        <div
          class="w-full break-all pb-2.5 bg-[#edeef0] dark:bg-[#141414] text-black dark:text-white text-opacity-75"
        >
          <slot />
        </div>
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
              class="bg-[#ffffff] dark:bg-[#19191a] p-2 rounded-md text-sm"
              placeholder="username"
              bind:value={username}
            />
            <input
              autocomplete="current-password"
              type="password"
              class="bg-[#ffffff] dark:bg-[#19191a] p-2 rounded-md text-sm"
              placeholder="*********"
              bind:value={password}
            />
            <button
              on:click={handleAuth}
              disabled={username == undefined}
              class="w-full {disabled && username !== undefined
                ? 'bg-blue-900 hover:bg-blue-800'
                : 'bg-[#383838] text-white text-opacity-70'} rounded-md text-sm p-1 transition-colors duration-300"
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
  </div>
</div>
