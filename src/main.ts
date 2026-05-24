import { slabs } from "./api/client";

async function load() {
  const status = await slabs.status();
  console.log(status);
}

load();
