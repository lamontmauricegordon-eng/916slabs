import { slabs } from "../api/client";

export default async function TestPage() {
  const status = await slabs.status();
  console.log("STATUS:", status);

  return (
    <div>
      <h1>API Test Page</h1>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
