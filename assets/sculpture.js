/* A real 3D, polished-metal torus knot. No library, trackers, or remote assets.
   Geometry is uploaded once; drawing sleeps when offscreen or the tab is hidden. */
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let paused = false;
  const motionButtons = [...document.querySelectorAll('.motion-toggle')];
  const updateMotionButtons = () => motionButtons.forEach(button => {
    const en = button.closest('.lang').id === 'lang-en';
    button.textContent = paused ? '▶' : 'Ⅱ';
    button.setAttribute('aria-label', paused ? (en ? 'Resume animation' : 'Retomar animação') : (en ? 'Pause animation' : 'Pausar animação'));
  });
  motionButtons.forEach(button => button.addEventListener('click', () => {
    paused = !paused;
    updateMotionButtons();
    document.dispatchEvent(new Event('motionchange'));
  }));
  updateMotionButtons();
  const vertexSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform mat3 uRotation;
    uniform float uAspect;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 p = uRotation * aPosition;
      vPosition = p;
      vNormal = uRotation * aNormal;
      float z = 7.8 - p.z;
      gl_Position = vec4(p.x * 2.65 / uAspect, p.y * 2.65, (z - 0.2) * 1.02, z);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vPosition;
    float band(float a, float center, float width) {
      return exp(-pow((a-center)/width,2.0));
    }
    void main() {
      vec3 n = normalize(vNormal);
      vec3 view = normalize(vec3(0.0,0.0,7.8)-vPosition);
      vec3 r = reflect(-view,n);
      // Broad studio softboxes, narrow white strip lights and colored edge cards.
      vec3 color = vec3(0.045,0.035,0.07);
      float horizon = smoothstep(-0.28,0.3,r.y);
      color += mix(vec3(0.19,0.12,0.25),vec3(0.37,0.39,0.47),horizon);
      color += vec3(0.87,0.84,0.94) * band(r.y,0.54,0.24) * 0.95;
      color += vec3(1.0,0.98,1.0) * band(r.y,0.69,0.035) * 1.15;
      color += vec3(0.67,0.73,0.94) * band(r.x,-0.63,0.11) * 0.9;
      color += vec3(0.9,0.40,0.68) * band(r.x,0.63,0.17) * (0.7-0.25*r.y);
      color += vec3(0.37,0.70,0.93) * band(r.x,-0.84,0.2) * (0.65+0.2*r.y);
      color *= 1.0 - 0.83 * band(r.y,0.05,0.075);
      color += vec3(0.72,0.57,0.83) * band(r.y,-0.55,0.12);
      color += vec3(0.86,0.84,0.96) * band(r.x,0.10,0.04) * smoothstep(0.1,0.7,r.z) * 0.65;
      float fresnel = pow(1.0-max(0.0,dot(n,view)),3.0);
      color += vec3(0.40,0.29,0.53) * fresnel * 0.35;
      float occlusion = smoothstep(0.15,1.9,length(vPosition.xy));
      color *= mix(0.66,1.0,occlusion);
      color = color/(color+vec3(0.6));
      color = pow(color,vec3(0.88));
      gl_FragColor = vec4(color,1.0);
    }
  `;
  const normalize = v => { const l = Math.hypot(...v); return v.map(a => a/l); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function center(t) {
    const r = 1.43 + .49*Math.cos(3*t);
    return [r*Math.cos(2*t),r*Math.sin(2*t),.61*Math.sin(3*t)];
  }
  const positions=[], normals=[], indices=[];
  const tubular=240, radial=40;
  for (let i=0;i<=tubular;i++) {
    const t=i/tubular*Math.PI*2, p=center(t), p2=center(t+.001);
    const tangent=normalize(p2.map((v,k)=>v-p[k]));
    const normal=normalize(cross(tangent,[0,0,1]));
    const binormal=normalize(cross(tangent,normal));
    for(let j=0;j<=radial;j++) {
      const angle=j/radial*Math.PI*2;
      const n=normal.map((v,k)=>v*Math.cos(angle)+binormal[k]*Math.sin(angle));
      const radius=.355;
      positions.push(...p.map((v,k)=>v+n[k]*radius));
      normals.push(...n);
      if(i<tubular && j<radial) {
        const a=i*(radial+1)+j,b=a+radial+1;
        indices.push(a,b,a+1,b,b+1,a+1);
      }
    }
  }
  function rotation(x,y,z) {
    const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);
    return new Float32Array([cy*cz,cy*sz,-sy,sx*sy*cz-cx*sz,sx*sy*sz+cx*cz,sx*cy,cx*sy*cz+sx*sz,cx*sy*sz-sx*cz,cx*cy]);
  }
  document.querySelectorAll('.chrome-sculpture').forEach(canvas => {
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
    if(!gl) return;
    function shader(type,source) {
      const result=gl.createShader(type);
      gl.shaderSource(result,source);gl.compileShader(result);
      if(!gl.getShaderParameter(result,gl.COMPILE_STATUS)) { gl.deleteShader(result); return null; }
      return result;
    }
    const vs=shader(gl.VERTEX_SHADER,vertexSource),fs=shader(gl.FRAGMENT_SHADER,fragmentSource);
    if(!vs||!fs) return;
    const program=gl.createProgram();
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
    gl.useProgram(program);
    function attribute(name,values) {
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
      const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);
    }
    attribute('aPosition',positions);attribute('aNormal',normals);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
    const rot=gl.getUniformLocation(program,'uRotation'),aspect=gl.getUniformLocation(program,'uAspect');
    gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
    let frame=0,visible=false,lost=false,elapsed=0,last=0,px=0,py=0,tx=0,ty=0;
    const parent=canvas.parentElement;
    const active=()=>visible&&!document.hidden&&!canvas.closest('.lang').hidden&&!lost;
    function draw(now) {
      frame=0;
      if(!active()) {last=0;return;}
      const rect=canvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      const dpr=Math.min(devicePixelRatio||1,1.6),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
      if(last&&!motion.matches&&!paused)elapsed+=Math.min(now-last,50)*.00012;
      last=now;px+=(tx-px)*.04;py+=(ty-py)*.04;
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(aspect,w/h);
      gl.uniformMatrix3fv(rot,false,rotation(.38+py*.18,elapsed+px*.25,-.28));
      gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
      canvas.classList.add('ready');
      if(!motion.matches&&!paused)frame=requestAnimationFrame(draw);
    }
    function wake(){if(active()&&!frame)frame=requestAnimationFrame(draw);}
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:0});
    observer.observe(canvas);
    new ResizeObserver(wake).observe(parent);
    parent.addEventListener('pointermove',event=>{
      if(motion.matches||paused||!finePointer.matches)return;
      const r=parent.getBoundingClientRect();tx=(event.clientX-r.left)/r.width*2-1;ty=(event.clientY-r.top)/r.height*2-1;
    },{passive:true});
    parent.addEventListener('pointerleave',()=>{tx=ty=0;},{passive:true});
    document.addEventListener('visibilitychange',wake);
    document.addEventListener('languagechange',wake);
    document.addEventListener('motionchange',()=>{last=0;wake();});
    motion.addEventListener('change',()=>{tx=ty=0;wake();});
    canvas.addEventListener('webglcontextlost',()=>{lost=true;cancelAnimationFrame(frame);frame=0;canvas.classList.remove('ready');});
  });
})();
