const originalGenerateDocx=window.generateDocx;
let docxReady=null;
function ensureDocx(){
  if(window.docx)return Promise.resolve(window.docx);
  if(!docxReady){
    docxReady=import('https://esm.sh/docx@9.5.1?bundle').then(module=>{
      window.docx=module;
      return module;
    });
  }
  return docxReady;
}

function stripContractExtras(value){
  let text=String(value||'').trim();
  text=text.replace(/\s+та\s+рахунок\s+№\s*[^,.;]+(?:\s+від\s+\d{2}\.\d{2}\.\d{4})?\.?\s*$/iu,'');
  text=text.replace(/\s+від\s+\d{2}\.\d{2}\.\d{4}\.?\s*$/u,'');
  text=text.replace(/^договір\s+№\s*[^\s]+\s*/iu,'');
  return text.trim().replace(/[.,;]+$/,'');
}

window.contractLine=function(d){
  if(!d.contractNumber&&!d.contractDate&&!d.contractTitle)return'';
  const cleanTitle=stripContractExtras(d.contractTitle);
  const number=d.contractNumber?`Договір № ${d.contractNumber}`:'Договір';
  const title=cleanTitle?` ${cleanTitle}`:'';
  const date=d.contractDate?` від ${dateShort(d.contractDate)}`:'';
  return `${number}${title}${date}`;
};

window.periodSuffix=function(d){
  if(!d.periodFrom||!d.periodTo)return'';
  const period=`за період з ${dateShort(d.periodFrom)} по ${dateShort(d.periodTo)}`;
  const alreadyIncluded=(d.services||[]).some(service=>String(service.name||'').toLocaleLowerCase('uk-UA').includes(period.toLocaleLowerCase('uk-UA')));
  return alreadyIncluded?'':` ${period}`;
};

window.paymentPurpose=function(d){
  const names=(d.services||[]).map(service=>String(service.name||'').trim()).filter(Boolean);
  const service=names.length===1?names[0].toLowerCase():'надані послуги';
  return `Оплата за ${service}${d.sellerVat==='Без ПДВ'?', без ПДВ':''}`;
};

window.generateDocx=async function(d,type){
  await ensureDocx();
  return originalGenerateDocx(d,type);
};

if(typeof refresh==='function')refresh();