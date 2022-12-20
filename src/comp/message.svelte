<script>
  export let self, message, time;
  import moment from "moment";
  moment().format();
</script>

{#if message}
  <div class="flex m-1 {self ? 'justify-end mr-4' : 'justify-start ml-4'}">
    <div class="flex flex-col {self ? 'items-end' : 'items-start'}">
      <div
        class="rounded-full {self
          ? 'rounded-br-none'
          : 'rounded-bl-none'} bg-[#333333] bg-opacity-75 py-1.5 px-3 break-all"
      >
        {message}
      </div>
      <div class="text-[9px] text-opacity-40">
        {moment(time).fromNow()}
      </div>
    </div>
  </div>
{/if}
