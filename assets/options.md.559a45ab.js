import{_ as e,c as a,o,a as t}from"./app.e275d43e.js";const A=JSON.parse('{"title":"API Options","description":"","frontmatter":{},"headers":[{"level":2,"title":"Parameters","slug":"parameters"},{"level":2,"title":"Return Values","slug":"return-values"},{"level":2,"title":"Options","slug":"options"}],"relativePath":"options.md","lastUpdated":1657595364000}'),s={name:"options.md"},n=t(`<h1 id="api-options" tabindex="-1">API Options <a class="header-anchor" href="#api-options" aria-hidden="true">#</a></h1><div class="language-js"><span class="copy"></span><pre><code><span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> data</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> error</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> isValidating</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> mutate </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">useSWR</span><span style="color:#A6ACCD;">(key</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> fetcher</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> options)</span></span>
<span class="line"></span></code></pre></div><h2 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-hidden="true">#</a></h2><ul><li><code>key</code> - A unique key for the request. Can be an <code>string | array | function | falsy value</code></li><li><code>fetcher</code> - A Promise that resolves to the data that you want to use</li><li><code>options</code> - (optional) an object of options for this SWR composable</li></ul><h2 id="return-values" tabindex="-1">Return Values <a class="header-anchor" href="#return-values" aria-hidden="true">#</a></h2><ul><li><code>data</code> - data for the given key resolved by fetcher (or undefined if not loaded)</li><li><code>error</code> - error thrown by fetcher (or undefined if nothing threw)</li><li><code>isValidating</code> - if there&#39;s the first request or revalidation going on</li><li><code>mutate(data)</code> - function to mutate the cached data</li></ul><h2 id="options" tabindex="-1">Options <a class="header-anchor" href="#options" aria-hidden="true">#</a></h2><ul><li><code>cacheProvider = new Map()</code> - Provider that should be used as cache source for this composable</li><li><code>revalidateOnFocus = true</code> - Automatically revalidate when window gets focused</li><li><code>revalidateOnReconnect = true</code> - Automatically revalidate when the browser regains a network connection</li><li><code>revalidateIfStale = true</code> - Automatically revalidate if there is stale data</li></ul>`,8),r=[n];function l(i,c,d,p,h,u){return o(),a("div",null,r)}var f=e(s,[["render",l]]);export{A as __pageData,f as default};
