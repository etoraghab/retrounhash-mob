import Gun from "gun";
import "gun/sea";
// import "gun/axe";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";
import "gun/lib/webrtc";

import { writable } from "svelte/store";
import { getUserAvatar, usernameGet } from "./utils";

export const db = new Gun({
  peers: [
    "https://relay.129.153.59.37.nip.io/gun",
    "https://gun-manhattan.herokuapp.com/gun",
  ],
  localStorage: false,
  axe: false,
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
  keys.set(db.user()._.sea);
  localStorage.setItem("keys", JSON.stringify(user._.sea));
  await usernameGet(user.is.pub).then((name) => {
    username.set(name);
    username_local = name;
  });
  await getUserAvatar(user.is.pub).then((val) => {
    avatar.set(val);
  });
  /*avatar_graph.on((val) => {
    avatar.set(
      val || `https://avatars.dicebear.com/api/identicon/${username_local}.svg`
    );
  });*/
});
