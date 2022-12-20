<script>
  import { goto } from "$app/navigation";
  export let f;
</script>

<div
  class="w-full p-1 bg-[#19191a] border border-[#313131] rounded-md h-auto flex flex-col"
>
  <button
    on:click={() => {
      goto(`/dm/${f.username}`);
    }}
  >
    <div class="flex items-center">
      <div class="flex w-full">
        <img
          src={f.avatar}
          class="h-6 w-6 aspect-square object-cover rounded-md m-1"
          alt=""
        />
        <div class="flex flex-col justify-center pl-1">
          <span class="text-xs m-auto ml-0">
            {f.username}
          </span>
        </div>
      </div>
    </div>
  </button>
</div>
