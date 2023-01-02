import { writable } from "svelte/store";
import { db, user } from "./gun";
import moment from "moment";
moment().format();

export async function getUserPosts(pub) {
  return new Promise(async (r) => {
    db.user(pub)
      .get("posts")
      .once((post_) => {
        if (post_) {
          Object.entries(post_).forEach(async (post) => {
            if (post[0] !== "_" && post[1] !== null) {
              let date = new Date(post_["_"][">"][post[0]]).toUTCString();
              posts = [
                {
                  content: post[1],
                  uid: post[0],
                  avatar: await getUserAvatar(pub),
                  name: await usernameGet(pub),
                  date: moment(date).calendar(),
                  self: true,
                },
                ...posts,
              ];
            }
          });
        }
      });
  });
}

// export async function getUserName(pub) {
//   return new Promise(async (r) => {
//     await db
//       .user(pub.replace(/~/g, ""))
//       .get("displayName")
//       .then((alias) => {
//         r(alias);
//       });
//   });
// }

export async function copyToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData("Text", text);
  } else if (
    document.queryCommandSupported &&
    document.queryCommandSupported("copy")
  ) {
    var textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy"); // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
      return prompt("Copy to clipboard: Ctrl+C, Enter", text);
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

export async function publickeyGet(username) {
  return new Promise(async (r) => {
    db.get(`#${username}`)
      .map()
      .once((pub) => {
        if (pub) {
          r(pub);
        }
      });
  });
}

export async function getuserbio(pub) {
  return new Promise(async (r) => {
    db.user(pub)
      .get("bio")
      .once((pub) => {
        if (pub) {
          r(pub);
        }
      });
  });
}

export async function usernameGet(pub) {
  return new Promise(async (r, re) => {
    db.user(pub)
      .get("username")
      .once(async (usern_) => {
        if ((await publickeyGet(usern_)) == pub) {
          r(usern_);
        } else {
          re("verification failed");
        }
      });
  });
}

export async function getUserAvatar(pub) {
  return new Promise(async (r) => {
    await db
      .user(pub.replace(/~/g, ""))
      .get("avatar")
      .then(async (avatar) => {
        if (avatar) {
          r(avatar);
        } else {
          let name = await usernameGet(pub);
          r(`https://avatars.dicebear.com/api/identicon/${name}.svg`);
        }
      });
  });
}

export function Timer(fn, t) {
  var timerObj = setInterval(fn, t);
  this.stop = function () {
    if (timerObj) {
      clearInterval(timerObj);
      timerObj = null;
    }
    return this;
  };
  this.start = function () {
    if (!timerObj) {
      this.stop();
      timerObj = setInterval(fn, t);
    }
    return this;
  };
  this.reset = function (newT = t) {
    t = newT;
    return this.stop().start();
  };
}

async function deleteposts() {
  return new Promise(async (r) => {
    await user
      .get("posts")
      .map()
      .once(async (val, uid) => {
        if (val && uid) {
          await user
            .get("posts")
            .get(uid)
            .put(null)
            .then(async () => {
              await user
                .get("searchable")
                .get(uid)
                .put(null)
                .then(() => {});
            });
        }
      });
  }).finally(() => {
    r(true);
  });
}

export async function deleteAllposts(override) {
  if (override) {
    await deleteposts();
    return;
  } else {
    if (confirm("delete all posts?\nThis action is not reversible.")) {
      deleteposts();
      return;
    }
  }
}

import { parse } from "twemoji-parser";

export async function postRender(t) {
  return new Promise((r) => {
    let entities = parse(t);
    for (const e of entities) {
      t = t.replace(
        new RegExp(e.text, "g"),
        `<img src="${e.url}" draggable="false" class="h-3 my-auto selector" alt="" />`
      );
    }
    r(t.replace(/#+([a-zA-Z0-9_]+)/gi, '<a href="/search/#$1">#$1</a>'));
  });
}
