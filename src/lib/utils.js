import { db } from "./gun";
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
                  name: await getUserName(pub),
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

export async function getUserName(pub) {
  return new Promise(async (r) => {
    await db
      .user(pub)
      .get("alias")
      .then((alias) => {
        r(alias);
      });
  });
}

export async function getUserAvatar(pub) {
  return new Promise(async (r) => {
    await db
      .user(pub)
      .get("avatar")
      .then(async (avatar) => {
        if (avatar) {
          r(avatar);
        } else {
          let name = await getUserName(pub);
          r(`https://avatars.dicebear.com/api/identicon/${name}.svg`);
        }
      });
  });
}

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
