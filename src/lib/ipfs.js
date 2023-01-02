import axios from "axios";

let node;
async function main() {
  node = await window.IpfsCore.create({ repo: "/var/ipfs/data" });
}
main();

export async function add(file) {
  return new Promise(async (r) => {
    let cid__ = await node.add(file);
    console.log(cid__.path);
    r(cid__.path);
  });
}

//QmceFXoEcmaBCbXmboYj9jmBY4TkfkVibEDcNsSJqGr6Mr

export async function fetchData(cid) {
  return new Promise(async (r) => {
    await axios.get("https://ipfs.io/ipfs/" + cid).then((val) => {
      r(val.data);
    });
  });
}
