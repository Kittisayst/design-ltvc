import{c as l,i as m}from"./lucide-C9PvAY0C.js";let d=[],r="all",c="";async function u(){l({icons:m});try{let e=await fetch("data/templates.json");if(e.ok||(e=await fetch("public/data/templates.json")),!e.ok)throw new Error("Failed to load templates");d=await e.json(),i(),g()}catch(e){console.error("Error:",e),document.getElementById("template-grid").innerHTML=`
            <div style="grid-column: 1/-1; text-align: center; color: #ef4444;">
                Failed to load templates. Please try again later.
            </div>
        `}}function g(){const e=document.getElementById("search-input");e&&e.addEventListener("input",t=>{c=t.target.value.toLowerCase(),i()});const a=document.getElementById("category-tabs");if(a){const t=a.querySelectorAll(".tab");t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(o=>o.classList.remove("active")),n.classList.add("active"),r=n.dataset.category,i()})})}}function i(){const e=d.filter(a=>{const t=r==="all"||a.category&&a.category.toLowerCase()===r.toLowerCase(),n=!c||a.title.toLowerCase().includes(c);return t&&n});f(e)}function f(e){const a=document.getElementById("template-grid");if(a.innerHTML="",e.length===0){a.innerHTML=`<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
            No templates found matching your criteria.
        </div>`;return}e.forEach(t=>{const n=document.createElement("div");n.className="card";const o=t.file?`canvas.html?template=${encodeURIComponent(t.file)}`:"canvas.html";n.onclick=()=>{window.location.href=o};const s=t.updatedAt?new Date(t.updatedAt).toLocaleDateString("en-GB"):"";n.innerHTML=`
            <img src="${t.thumbnail}" alt="${t.title}" class="card-img">
            <div class="card-body">
                <div class="card-title">${t.title}</div>
                <div class="card-meta">Updated: ${s}</div>
            </div>
        `,a.appendChild(n)})}document.addEventListener("DOMContentLoaded",u);
