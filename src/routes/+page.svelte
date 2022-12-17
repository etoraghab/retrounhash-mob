<script>
  import Menu from "@svicons/boxicons-regular/dots-horizontal-rounded.svelte";
  import Report from "@svicons/boxicons-regular/flag.svelte";
  import X from "@svicons/boxicons-regular/x-circle.svelte";
  import Image from "@svicons/boxicons-regular/image.svelte";

  let option = false;
  let postFocus = false;
  let postContent;
  let textareaVAR;
</script>

<div class="flex break-all justify-center items-center mt-3">
  <div
    class="w-11/12 p-2 border border-[#313131] bg-[#19191a] rounded-md h-auto flex gap-1 items-center"
  >
    <img
      src="/favicon.png"
      class="h-6 w-6 {postFocus
        ? 'mb-auto mt-1'
        : ''} mx-auto aspect-square object-cover rounded-md"
      alt=""
    />
    {#if !postFocus}
      <div class="flex items-center w-full justify-center">
        <div
          type="text"
          contenteditable="true"
          on:focus={() => {
            postFocus = true;
            setTimeout(() => {
              textareaVAR.focus();
            }, 500);
          }}
          class="text-sm font-thin w-full resize-none bg-[#19191a] rounded p-1"
        >
          What's new?
        </div>
      </div>
      <!-- <button class="p-1">
        <Image width="1.2em" />
      </button> -->
    {:else}
      <div class="flex w-full">
        <div class="flex flex-col items-center w-full justify-center">
          <textarea
            type="text"
            bind:this={textareaVAR}
            bind:value={postContent}
            placeholder="What's new?"
            maxlength="280"
            class="text-lg w-full h-44 resize-none bg-[#19191a] rounded p-1"
          />
          <div class="flex justify-center items-center p-2 w-full">
            <!-- <button class="">
              <Image width="1.2em" />
            </button> -->
            <div class="mr-auto">
              {(postContent || "").length}/280
            </div>
            <div class="m-2 flex gap-2">
              <button
                class="btn flex items-center text-sm justify-center rounded-md px-2.5 py-0.5 bg-[#222222]"
                on:click={() => {
                  postContent = null;
                  postFocus = false;
                }}
              >
                cancel
              </button>
              <button
                class="btn flex items-center text-sm justify-center rounded-md px-2.5 py-0.5 bg-[#222222]"
              >
                post
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
<div class="flex justify-center items-center mt-3">
  <div
    class="w-11/12 p-3 bg-[#19191a] border border-[#313131] rounded-md h-auto flex flex-col"
  >
    {#if option}
      <div class="text-sm font-thin flex items-center justify-center">
        <button
          class="flex px-2 py-1 rounded-md bg-[#464242] gap-1 justify-center items-center"
        >
          <span class="text-red-600">
            <Report width="1.2em" />
          </span>
          report
        </button>
        <button
          on:click={() => {
            option = false;
          }}
          class="p-1 bg-[#464242] rounded-md my-auto ml-auto"
        >
          <X width="1.2em" />
        </button>
      </div>
    {:else}
      <div>
        <div class="text-xs break-all">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae a
          doloremque, earum ad iste nisi? Voluptatem quibusdam a odit quis
          officia molestias laborum, accusamus at esse tempora ipsam incidunt
          culpa.
        </div>
        <div class="flex items-center mb-1 mt-2">
          <div class="flex w-full">
            <img
              src="/favicon.png"
              class="h-6 w-6 aspect-square rounded-md m-1"
              alt=""
            />
            <div class="flex flex-col justify-center pl-1">
              <span class="text-xs m-auto ml-0"> name </span>
              <span class="text-[9px] text-opacity-60 my-auto">
                2 days ago
              </span>
            </div>
            <div class="m-auto mr-2 flex justify-center items-center">
              <button
                on:click={() => {
                  option = true;
                }}
              >
                <Menu width="1.2em" />
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
