import { db, keys } from "$lib/gun";
import { currentuserposts } from "$lib/store";
import { checkVerification, getUserAvatar, postRender, publickeyGet } from "$lib/utils";
import { error } from "@sveltejs/kit";
import moment from "moment";

/** @type {import('./$types').PageLoad} */

async function getLoc(pub) {
  let location;
  return new Promise((r) => {
    let location_graph = db.user(pub).get("displayLocation");
    location_graph.once((l) => {
      location = l;
      r(location);
    });
  });
}

async function getDisplayName(pub, name) {
  return new Promise((r) => {
    let displayName_graph = db.user(pub).get("displayName");
    displayName_graph.once((n) => {
      r(n || name);
    });
  });
}

async function getbackground(pub) {
  let background;
  return new Promise((r) => {
    let background_graph = db.user(pub).get("background");
    background_graph.once((val) => {
      background =
        val ||
        `https://images.unsplash.com/photo-1578735546632-9ff1f1e7518e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`;
      r(background);
    });
  });
}

async function getBio(pub) {
  return new Promise((r) => {
    let bio_graph = db.user(pub).get("bio");
    bio_graph.once((val) => {
      r(val || "404 no bio found");
    });
  });
}

export async function load({ params }) {
  let pub = await publickeyGet(params.slug);
  let posts = [];

  currentuserposts.subscribe((p) => {
    posts = p;
  });
  currentuserposts.set([]);
  db.user(pub)
    .get("posts")
    .map()
    .once(async (p, u) => {
      if (typeof p == "object" && p) {
        let date = Gun.state.is(p, "content");
        // if (u !== pinned) {

        await checkVerification(pub).then(async (v) => {
          currentuserposts.set([
            {
              content: await postRender(p.content),
              uid: u,
              avatar: await getUserAvatar(pub),
              name: params.slug,
              date: moment(date).calendar(),
              self: false,
              sortDate: date,
              pub: pub,
              verified: v.isVerified,
            },
            ...posts,
          ]);
        })
        // } else {
        //   posts = [
        //     {
        //       content: p.content,
        //       uid: u,
        //       avatar: user_avatar,
        //       name: username,
        //       date: moment(date).calendar(),
        //       self: pub == $keys.pub ? true : false,
        //       sortDate: date,
        //       pub: pub,
        //       pinned: true,
        //     },
        //     ...posts,
        //   ];
        // }
      }
    });



  return {
    slug: params.slug,
    pub: pub,
    posts: posts,
    displayName: await getDisplayName(pub, params.slug),
    background: await getbackground(pub),
    bio: await getBio(pub),
    location: await getLoc(pub),
    verification: await checkVerification(pub),
  };

  throw error(404, "Not found");
}
export const ssr = false;
export const csr = true;
