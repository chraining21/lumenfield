// 在 <head> 執行，畫面出現前就套用主題，避免閃一下。
// 沒有存過選擇時跟隨系統設定。
export const themeScript = `(function(){try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

