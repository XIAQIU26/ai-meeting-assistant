(function(){
var origFetch = window.fetch;
var failed = false;
function mockResp(url){
var body = url.indexOf("/auth/") !== -1 ? '{"data":{"user":null},"error":null}' : "[]";
return Promise.resolve(new Response(body, {status: 200, headers: {"Content-Type": "application/json"}}));
}
window.fetch = function(input, init){
var url = typeof input === "string" ? input : (input && input.url) || "";
if (url.indexOf("supabase") === -1) return origFetch.call(this, input, init);
if (failed) return mockResp(url);
var ctrl = new AbortController();
var tid = setTimeout(function(){ ctrl.abort(); failed = true; }, 5000);
return origFetch.call(this, input, Object.assign({}, init, {signal: ctrl.signal}))
.then(function(res){ clearTimeout(tid); return res; })
.catch(function(err){ clearTimeout(tid); failed = true; return mockResp(url); });
};
})();
