import fs from 'node:fs';
import path from 'node:path';
import minecraftData from 'minecraft-data';

const VERSION=process.env.MC_DATA_VERSION||'1.21.8';
const mc=minecraftData(VERSION);
if(!mc)throw new Error(`minecraft-data does not contain Java ${VERSION}`);
const byId=new Map((mc.itemsArray||Object.values(mc.items||{})).map(v=>[Number(v.id),v]));
const itemName=id=>byId.get(Number(id))?.name||null;
function ingredient(v){
  if(v==null||v===-1)return null;
  if(typeof v==='number')return itemName(v);
  if(Array.isArray(v)){const a=v.map(ingredient).filter(Boolean);return a.length===1?a[0]:a;}
  if(typeof v==='object'){
    if(v.id!=null)return ingredient(v.id);
    if(v.item!=null)return ingredient(v.item);
  }
  return null;
}
const out=[];
for(const [resultIdRaw,list] of Object.entries(mc.recipes||{})){
  const resultId=Number(resultIdRaw),resultName=itemName(resultId);
  if(!resultName||!Array.isArray(list))continue;
  list.forEach((r,index)=>{
    const count=Number(r?.result?.count||r?.result?.itemCount||1)||1;
    if(Array.isArray(r?.inShape)){
      const shape=r.inShape.map(row=>(row||[]).map(ingredient));
      if(shape.some(row=>row.some(Boolean)))out.push({id:`minecraft-data:${resultName}:shaped:${index}`,type:'minecraft:crafting_shaped',name:resultName,shape,output:{item:resultName,count}});
    }else if(Array.isArray(r?.ingredients)){
      const ingredients=r.ingredients.map(ingredient).filter(Boolean);
      if(ingredients.length)out.push({id:`minecraft-data:${resultName}:shapeless:${index}`,type:'minecraft:crafting_shapeless',name:resultName,ingredients,output:{item:resultName,count}});
    }
  });
}
const payload={format:1,edition:'java',version:VERSION,source:'PrismarineJS/minecraft-data',generatedAt:new Date().toISOString(),recipes:out};
const dest=path.resolve('assets/java/data/recipes-v165.json');
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.writeFileSync(dest,JSON.stringify(payload,null,2)+'\n');
console.log(`Exported ${out.length} Java crafting recipes for ${VERSION} -> ${dest}`);
