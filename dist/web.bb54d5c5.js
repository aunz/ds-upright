parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r},p.cache={};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"Focm":[function(require,module,exports) {
const t=480,e=9*t/16,n="/",o=1,i=!0,s=16,a=.5,c=.5,l={color:"#2ECC40",showDot:!0,play:0,predictMode:"lr"},r=document.getElementById("output"),d=document.getElementById("message");function u(t){return function(e){l.play?t.pause():t.play(),l.play=!l.play,["icon-play","icon-pause"].forEach(t=>{e.currentTarget.classList.toggle(t)})}}function m(){return navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:"user",width:t,height:e}}).then(n=>{const o=document.getElementById("video");return o.width=t,o.height=e,o.srcObject=n,new Promise(t=>{o.onloadedmetadata=(()=>{t(o)})})})}function p(n,o){n.clearRect(0,0,t,e),n.save(),n.scale(-1,1),n.translate(-t,0),n.drawImage(o,0,0,t,e),n.restore()}function f(t,e,n,o=1){for(let i=0;i<t.length;i++){const s=t[i];if(s.score<e)continue;const{y:a,x:c}=s.position;n.beginPath(),n.arc(c*o,a*o,3,0,2*Math.PI),n.fillStyle=l.color,n.fill()}}function h(t,e){return t.estimateSinglePose(e,o,i,s)}function y({int:e,coefs:n},o){let i=e;for(let s=0;s<o.length;s++){const{x:e,y:a}=o[s].position;i+=e*n[s]/t+a*n[s+17]/t}return i=1/(1+Math.exp(-i))}function g(e,n){const o=[],i=[];for(const t of n)o.push(t.position.x),i.push(t.position.y);const s=tf.tensor1d([].concat(o,i)).div(t).expandDims(0);return e.predict(s).dataSync()[0]}function x(t,e){const n=[];for(let i=-1;++i<135;){n[i]=[];for(let t=-1;++t<240;)n[i][t]=[0]}e.forEach(t=>{let{x:e,y:o}=t.position;e=Math.max(Math.min(Math.round(e/2),239),0),o=Math.max(Math.min(Math.round(o/2),134),0),n[o][e]=[1],console.log(e,o)});const o=tf.tensor3d(n).expandDims(0);return 1-t.predict(o).dataSync()[0]}async function v(t,e,n,o,i){if(l.play){const n=await h(t,o);p(i,o),d.classList.remove("blink"),d.textContent="",l.showDot&&f(n.keypoints,c,i);const s=g(e,n.keypoints);r.textContent=s.toFixed(3)}else d.classList.remove("blink"),d.textContent="",r.textContent="";requestAnimationFrame(()=>{v(t,e,n,o,i)})}!async function(){const[n,o,i,s]=await Promise.all([posenet.load(),tf.loadModel("/trained_models/model_NN_2_0/model.json"),fetch("/trained_models/intercept_coefs.json").then(t=>t.json()),m()]);document.getElementById("initial-loader").remove(),document.getElementById("play-stop").classList.toggle("display-none"),document.getElementById("play-stop").addEventListener("click",u(s));const a=document.getElementById("canvas");a.classList.remove("display-none"),a.width=t,a.height=e,v(n,o,i,s,a.getContext("2d"))}();
},{}]},{},["Focm"], null)
//# sourceMappingURL=dist/web.bb54d5c5.map