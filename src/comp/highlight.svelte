<script>
  import { db } from "$lib/gun";
  import { getUserAvatar, usernameGet } from "$lib/utils";
  export var pub;

  let highlights = [];
  let featureImg;
  let counter = 0;
  let displayIMG;
  let displayCAPTION;

  db.user(pub)
    .get("highlights")
    .map()
    .once((a, b) => {
      // if (!featureImg) {
      //   featureImg = a.img;
      // }
      highlights = [a, ...highlights];
    });

  let name, avatar;
  usernameGet(pub).then((val) => {
    name = val;
  });
  getUserAvatar(pub).then((val) => {
    avatar = val;
  });

  let overlay,
    progress = 0;
</script>

<!-- <button
    class="flex items-center"
    on:click={() => {
      overlay = true;

      let loadin = setInterval(() => {
        if (!(progress >= 100)) {
          progress += 20;
        } else {
          progress = 0;
          counter++;
          if (highlights.length !== counter) {
            displayIMG = highlights[counter].img;
            displayCAPTION = highlights[counter].caption;
          } else {
            clearInterval(loadin);
            overlay = false;
            counter = 0;
          }
        }
      }, 1000);
    }}
  >
    <img
      src={featureImg}
      class="h-44 w-20 ring ring-[#2b6ba0] ring-opacity-60 rounded-md brightness-[0.8] object-cover  center border border-[#2c2b2b]"
      alt=""
    />
    <div class="fixed h-44 w-20 flex justify-center items-end mb-4">
      <div>
        <img class="rounded-full object-cover h-10 w-10" src={avatar} alt="" />
        <div class="text-xs text-center">{name}</div>
      </div>
    </div>
  </button> -->

<button
  on:click={() => {
    overlay = true;

    let loadin = setInterval(() => {
      if (!(progress >= 100)) {
        progress += 20;
      } else {
        progress = 0;
        counter++;
        if (highlights.length !== counter) {
          displayIMG = highlights[counter].img;
          displayCAPTION = highlights[counter].caption;
        } else {
          clearInterval(loadin);
          overlay = false;
          counter = 0;
        }
      }
    }, 1000);
  }}
  class="flex w-16 z container m-2 flex-col justify-center items-center gap-2"
>
  <div>
    <div class="indicator">
      <!-- <Plus width="1.2em" /> -->
      <div>
        <img
          draggable="false"
          src={avatar}
          class="h-14 w-14 aspect-square object-cover rounded-full 
            {highlights.length !== 0
            ? 'border-2 border-offset-2 border-[#3c7ab6] hover:border-sky-700 transition-all duration-500'
            : ''}"
          alt=""
        />
      </div>
    </div>
  </div>
  <div class="truncate max-w-10 text-xs">
    {name}
  </div>
</button>

{#if overlay}
  <div class="overlay">
    <div class="relative">
      <div class="overflow-hidden h-1 mb-0 text-xs flex rounded-b-md ">
        <div
          style="width: {progress}%"
          class="shadow-none flex transition-all duration-1000 ease-linear flex-col text-center whitespace-nowrap text-black dark:text-white justify-center bg-[#346ca3]"
        />
      </div>
    </div>
    <img
      src={displayIMG || highlights[0].img}
      class="h-full w-full object-cover"
      alt=""
    />
    <div
      class="fixed bottom-8 w-full min-h-6  backdrop-blur bg-black bg-opacity-50 text-center break-all line-clamp-2 z-10"
    >
      {displayCAPTION || highlights[0].caption}
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
  }
</style>
