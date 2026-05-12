/**
 * well this is one way to do it if we're sticking to Cloudflare worker.
 * But we can do Supabase's Edge Functions instead, which is more straightforward and has better integration with Supabase.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Simple Routing
    if (url.pathname === "/api/data") {
      
      // 2. Add your secret key (stored in env.GEMINI_API_KEY)
      const modifiedRequest = new Request("https://api.thirdparty.com/v1/resource", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      // 3. Fetch and return
      const response = await fetch(modifiedRequest);
      return response;
    }

    return new Response("Not Found", { status: 404 });
  }
} satisfies ExportedHandler<Env>;
