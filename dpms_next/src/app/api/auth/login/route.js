// app/api/auth/login/route.js

// Loggedin route
export async function POST(req) {
  const body = await req.json();
  const { username, password } = body;
  const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  try {
    const strapiRes = await fetch(`${API_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: username,
        password,
      }),
    });

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      return new Response(JSON.stringify({ error: data.error }), { status: 400 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Login failed" }), { status: 500 });
  }
}
  