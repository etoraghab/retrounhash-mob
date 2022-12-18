import Gun from "gun";
import "gun/sea";
// import "gun/axe";
import { writable } from "svelte/store";
export const db = new Gun({
  peers: ["https://gun-manhattan.herokuapp.com/gun"],
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
db.on("auth", () => {
  localStorage.setItem("keys", JSON.stringify(user._.sea));
  user.get("alias").once((name) => {
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
