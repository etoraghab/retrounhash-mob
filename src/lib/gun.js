import Gun from "gun";
import "gun/sea";
// import "gun/axe";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";

import { writable } from "svelte/store";
import { usernameGet } from "./utils";

export const db = new Gun({
  peers: [
    "https://relay.129.153.59.37.nip.io/gun",
    "https://gun-manhattan.herokuapp.com/gun",
  ],
  localStorage: false,
});
let username_local;
export const user = db.user().recall({ sessionStorage: true });
export const username = writable();
export const avatar = writable();
var avatar_graph = user.get("avatar");
export const keys = writable({
  pub: "",
  epub: "",
  epriv: "",
  priv: "",
});
db.on("auth", async () => {
  localStorage.setItem("keys", JSON.stringify(user._.sea));
  await usernameGet(user.is.pub).then((name) => {
    username.set(name);
    username_local = name;
  });
  keys.set(user._.sea);
  avatar_graph.once((val) => {
    avatar.set(
      val || `https://avatars.dicebear.com/api/identicon/${username_local}.svg`
    );
  });
});