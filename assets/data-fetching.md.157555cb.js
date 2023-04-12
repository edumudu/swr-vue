import{_ as s,c as a,o as n,N as o}from"./chunks/framework.4fa43063.js";const F=JSON.parse('{"title":"Data Fetching","description":"","frontmatter":{},"headers":[],"relativePath":"data-fetching.md","lastUpdated":1681257585000}'),l={name:"data-fetching.md"},e=o(`<h1 id="data-fetching" tabindex="-1">Data Fetching <a class="header-anchor" href="#data-fetching" aria-label="Permalink to &quot;Data Fetching&quot;">​</a></h1><p>The basic use is of <code>useSWR</code> composable is:</p><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> data</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> error </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">useSWR</span><span style="color:#A6ACCD;">(key</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> fetcher)</span><span style="color:#89DDFF;">;</span></span></code></pre></div><p>Here, the <code>fetcher</code> is a function and receives the key as the first argument, then return the data to be cached.</p><p>The returned value will be avaiable in <code>data</code> and if fetcher throws, the error will be caught in <code>error</code>.</p><h2 id="fetcher" tabindex="-1">Fetcher <a class="header-anchor" href="#fetcher" aria-label="Permalink to &quot;Fetcher&quot;">​</a></h2><p>You can use any library to fetch the data.</p><h3 id="native-fetch" tabindex="-1">Native <code>fetch</code> <a class="header-anchor" href="#native-fetch" aria-label="Permalink to &quot;Native \`fetch\`&quot;">​</a></h3><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;font-style:italic;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">useSWR</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">swr-vue</span><span style="color:#89DDFF;">&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> fetcher </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">url</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">fetch</span><span style="color:#A6ACCD;">(url)</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">then</span><span style="color:#A6ACCD;">(</span><span style="color:#A6ACCD;font-style:italic;">response</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> response</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">json</span><span style="color:#A6ACCD;">())</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> data</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> error </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">useSWR</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">/api/todos</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> fetcher)</span></span></code></pre></div><h3 id="axios" tabindex="-1">Axios <a class="header-anchor" href="#axios" aria-label="Permalink to &quot;Axios&quot;">​</a></h3><div class="language-ts"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki material-theme-palenight"><code><span class="line"><span style="color:#89DDFF;font-style:italic;">import</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#F07178;"> </span><span style="color:#A6ACCD;">useSWR</span><span style="color:#F07178;"> </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;font-style:italic;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">swr-vue</span><span style="color:#89DDFF;">&#39;</span></span>
<span class="line"><span style="color:#89DDFF;font-style:italic;">import</span><span style="color:#A6ACCD;"> axios </span><span style="color:#89DDFF;font-style:italic;">from</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">axios</span><span style="color:#89DDFF;">&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> fetcher </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#A6ACCD;font-style:italic;">url</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> axios</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">get</span><span style="color:#A6ACCD;">(url)</span><span style="color:#89DDFF;">.</span><span style="color:#82AAFF;">then</span><span style="color:#A6ACCD;">(</span><span style="color:#A6ACCD;font-style:italic;">res</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">=&gt;</span><span style="color:#A6ACCD;"> res</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">data)</span><span style="color:#89DDFF;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#C792EA;">const</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span><span style="color:#A6ACCD;"> data</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> error </span><span style="color:#89DDFF;">}</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">useSWR</span><span style="color:#A6ACCD;">(</span><span style="color:#89DDFF;">&#39;</span><span style="color:#C3E88D;">/api/data</span><span style="color:#89DDFF;">&#39;</span><span style="color:#89DDFF;">,</span><span style="color:#A6ACCD;"> fetcher)</span><span style="color:#89DDFF;">;</span></span></code></pre></div>`,11),p=[e];function t(c,r,D,y,A,C){return n(),a("div",null,p)}const h=s(l,[["render",t]]);export{F as __pageData,h as default};
