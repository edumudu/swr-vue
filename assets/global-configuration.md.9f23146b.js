import{_ as s,c as a,o,N as n}from"./chunks/framework.4fa43063.js";const C=JSON.parse('{"title":"Global Configuration","description":"","frontmatter":{},"headers":[],"relativePath":"global-configuration.md","lastUpdated":1681258129000}'),e={name:"global-configuration.md"},l=n(`<h1 id="global-configuration" tabindex="-1">Global Configuration <a class="header-anchor" href="#global-configuration" aria-label="Permalink to &quot;Global Configuration&quot;">​</a></h1><p>You can use <code>configureGlobalSWR</code> function to create a configuration scope (this uses <a href="https://vuejs.org/guide/components/provide-inject.html" target="_blank" rel="noreferrer">provide/inject</a> under the hood) and provide a sharable configuration to all composables under this scope.</p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;font-style:italic;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">configureGlobalSWR</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">swr-vue</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#82AAFF;">configureGlobalSWR</span><span style="color:#A6ACCD;">(options)</span></span></code></pre></div><blockquote><p><a href="./options.html">Available options</a></p></blockquote><h2 id="extra-options" tabindex="-1">Extra options <a class="header-anchor" href="#extra-options" aria-label="Permalink to &quot;Extra options&quot;">​</a></h2><h3 id="cache-provider" tabindex="-1">Cache Provider <a class="header-anchor" href="#cache-provider" aria-label="Permalink to &quot;Cache Provider&quot;">​</a></h3><p><code>configureGlobalSWR</code> also accepts an optional cache provider.</p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#82AAFF;">configureGlobalSWR</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> </span><span style="color:#F07178;">cacheProvider</span><span style="color:#89DDFF;">:</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">new</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">Map</span><span style="color:#A6ACCD;">() </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;">)</span><span style="color:#89DDFF;">;</span></span></code></pre></div><h2 id="access-current-scope-configurations" tabindex="-1">Access Current Scope Configurations <a class="header-anchor" href="#access-current-scope-configurations" aria-label="Permalink to &quot;Access Current Scope Configurations&quot;">​</a></h2><p>You can use the <code>useSWRConfig</code> composable to get the scope configurations, as well as mutate and cache.</p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;font-style:italic;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">useSWRConfig</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">swr-vue</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> config</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> mutate </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">useSWRConfig</span><span style="color:#A6ACCD;">()</span><span style="color:#89DDFF;">;</span></span></code></pre></div><p>Nested configurations will be extended. If no <code>configureGlobalSWR</code> is used, it will return the default ones.</p>`,12),t=[l];function p(c,r,i,D,u,d){return o(),a("div",null,t)}const F=s(e,[["render",p]]);export{C as __pageData,F as default};