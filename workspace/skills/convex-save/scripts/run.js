async function save(table, data) {
  const res = await fetch(`${process.env.convex_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': process.env.convex_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.convex_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  console.log(res.ok ? `✅ Saved to ${table}` : `❌ Failed`);
}
const [table, ...rest] = process.argv.slice(2);
save(table, JSON.parse(rest.join(' ')));
