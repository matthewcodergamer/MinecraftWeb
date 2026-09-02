/* V16.5 worker-assisted voxel face extraction. No Three.js/DOM dependencies. */
self.onmessage=e=>{
  const m=e.data||{};if(m.type!=='meshFaces')return;
  try{
    const a=new Uint16Array(m.padded),S=18,transparent=new Set(m.transparentIds||[]),special=new Set(m.specialIds||[]),air=Number(m.airId)||0;
    const idx=(x,y,z)=>(y*S+z)*S+x,records=[];
    const dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    const visible=(id,n)=>{if(n===air)return true;if(id===n&&transparent.has(id))return false;if(transparent.has(n))return true;return false};
    for(let ly=0;ly<16;ly++)for(let z=0;z<16;z++)for(let x=0;x<16;x++){
      const id=a[idx(x+1,ly+1,z+1)];if(id===air)continue;
      if(special.has(id)){records.push(x,ly,z,6,id);continue}
      for(let f=0;f<6;f++){const d=dirs[f],n=a[idx(x+1+d[0],ly+1+d[1],z+1+d[2])];if(visible(id,n))records.push(x,ly,z,f,id)}
    }
    const out=new Uint16Array(records);postMessage({ok:true,id:m.id,key:m.key,version:m.version,records:out.buffer},[out.buffer]);
  }catch(error){postMessage({ok:false,id:m.id,key:m.key,error:String(error?.stack||error)})}
};
