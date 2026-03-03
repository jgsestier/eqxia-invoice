import { useState } from "react";
import { jsPDF } from "jspdf";

const B = {
  dark: "#1A1A2E", teal: "#C3D2D2", mid: "#4A5568", txt: "#2D3748",
  txt2: "#718096", bg: "#F7F8F9", white: "#fff", bdr: "#E2E8F0",
  red: "#E53E3E", tblAlt: "#F1F3F5",
};

const LOGO_B64 = "data:image/png;base64,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";

const TERMS = [
  { label: "Due end of next month", calc: "end_next_month" },
  { label: "Due on receipt", calc: "on_receipt" },
  { label: "Net 15", calc: "net_15" },
  { label: "Net 30", calc: "net_30" },
  { label: "Net 45", calc: "net_45" },
  { label: "Net 60", calc: "net_60" },
];

const TAX_OPTS = [
  { label: "No taxe (0%)", rate: 0 },
  { label: "VAT (15%)", rate: 0.15 },
];

function calcDue(dateStr, calc) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const r = new Date(d);
  switch (calc) {
    case "on_receipt": return dateStr;
    case "net_15": r.setDate(r.getDate() + 15); break;
    case "net_30": r.setDate(r.getDate() + 30); break;
    case "net_45": r.setDate(r.getDate() + 45); break;
    case "net_60": r.setDate(r.getDate() + 60); break;
    default: return new Date(d.getFullYear(), d.getMonth() + 2, 0).toISOString().split("T")[0];
  }
  return r.toISOString().split("T")[0];
}

function fmtDate(s) {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtN(n) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

const newItem = () => ({ id: Date.now() + Math.random(), name: "", desc: "", qty: 1, rate: 0 });

function generatePDF(doc, f, items, taxOpt) {
  const PW = 210, ML = 16, CW = PW - ML - 16, R = PW - 16, MT = 18;
  let y;
  const hex2rgb = (hex) => [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  const setC = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setTextColor(r,g,b); };
  const setF = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setFillColor(r,g,b); };
  const setD = (hex) => { const [r,g,b] = hex2rgb(hex); doc.setDrawColor(r,g,b); };

  // Teal bar + logo
  setF(B.teal); doc.rect(ML, MT, 1.4, 23, "F");
  try { doc.addImage(LOGO_B64, "PNG", ML+4, MT-1, 52, 17); } catch(e) {}

  // Invoice title right
  doc.setFont("helvetica","bold"); doc.setFontSize(28); setC(B.dark);
  doc.text("Invoice", R, MT+8, {align:"right"});
  doc.setFont("helvetica","normal"); doc.setFontSize(9); setC(B.txt2);
  doc.text("# "+f.inv_num, R, MT+14, {align:"right"});
  doc.text("Balance Due", R, MT+21, {align:"right"});
  doc.setFont("helvetica","bold"); doc.setFontSize(15); setC(B.dark);
  doc.text("MUR"+fmtN(f.total), R, MT+28, {align:"right"});

  // Company
  y = MT+40;
  doc.setFont("helvetica","bold"); doc.setFontSize(9); setC(B.dark);
  doc.text("Eqxia Ltd", ML, y);
  doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt);
  const comp = ["Company ID : C25225434","Tax ID : VAT28437661","20, Bois d\u2019Olive Forestia","Wolmar 90922","Mauritius"];
  comp.forEach((ln,i) => doc.text(ln, ML, y+5+i*4.5));

  // Bill To
  y += 32;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt2);
  doc.text("Bill To", ML, y);
  doc.setFont("helvetica","bold"); doc.setFontSize(9); setC(B.dark);
  doc.text(f.client, ML, y+5.5);
  doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt);
  const addr = [f.addr1,f.addr2,f.postal,f.country].filter(Boolean);
  if(f.client_brn) addr.push("BRN: "+f.client_brn);
  if(f.client_vat) addr.push("VAT: "+f.client_vat);
  addr.forEach((ln,i) => doc.text(ln, ML, y+10+i*4.5));

  // Meta right
  const meta = [["Invoice Date :",f.inv_date_fmt],["Terms :",f.terms_label],["Due Date :",f.due_fmt],["BRN :","C25225434"]];
  meta.forEach(([lab,val],i) => {
    const my = y+i*6.5;
    doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt2);
    doc.text(lab, R-38, my, {align:"right"});
    setC(B.txt); doc.text(val, R, my, {align:"right"});
  });

  // Subject
  y = y+10+addr.length*4.5+6;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt2);
  doc.text("Subject :", ML, y); setC(B.txt); doc.text(f.subject||"", ML, y+5);

  // Table
  y += 14;
  const cQ=R-58, cR2=R-30, cA=R-2;
  setF(B.dark); doc.rect(ML, y, CW, 8, "F");
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(255,255,255);
  doc.text("#",ML+3,y+5.5); doc.text("Item & Description",ML+13,y+5.5);
  doc.text("Qty",cQ,y+5.5,{align:"right"}); doc.text("Rate",cR2,y+5.5,{align:"right"}); doc.text("Amount",cA,y+5.5,{align:"right"});
  y += 8;

  items.forEach((item,idx) => {
    const dL = doc.splitTextToSize(item.desc||"", 80);
    const rh = Math.max(12, 8+dL.length*3.5);
    if(idx%2===0){ setF(B.tblAlt); doc.rect(ML,y,CW,rh,"F"); }
    doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt);
    doc.text(String(idx+1), ML+3, y+5);
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.text(item.name, ML+13, y+5);
    doc.setFont("helvetica","normal"); doc.setFontSize(7); setC(B.mid);
    dL.forEach((ln,j) => doc.text(ln, ML+13, y+9+j*3.5));
    doc.setFontSize(8); setC(B.txt);
    doc.text(item.qty.toFixed(2),cQ,y+5,{align:"right"});
    doc.text(fmtN(item.rate),cR2,y+5,{align:"right"});
    doc.text(fmtN(item.amount),cA,y+5,{align:"right"});
    y += rh;
  });

  // Totals
  y += 4; const lx=R-64, vx=R-2;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt);
  doc.text("Sub Total",lx,y,{align:"right"}); doc.text(fmtN(f.subtotal),vx,y,{align:"right"});
  y+=6; doc.text(taxOpt.label,lx,y,{align:"right"}); doc.text(fmtN(f.taxAmt),vx,y,{align:"right"});
  y+=4; setD(B.bdr); doc.setLineWidth(0.2); doc.line(lx-20,y,vx+2,y);
  y+=5; doc.setFont("helvetica","bold"); doc.setFontSize(10); setC(B.dark);
  doc.text("Total",lx,y,{align:"right"}); doc.text("MUR"+fmtN(f.total),vx,y,{align:"right"});

  // Balance Due bar
  y+=4; const bL=lx-32, bR2=vx+2;
  setF(B.dark); doc.rect(bL,y,bR2-bL,8,"F");
  setF(B.teal); doc.rect(bL,y-0.6,bR2-bL,0.6,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(9); setC(B.teal);
  doc.text("Balance Due",lx,y+5.5,{align:"right"});
  doc.setTextColor(255,255,255); doc.text("MUR"+fmtN(f.total),vx,y+5.5,{align:"right"});

  // Notes
  y+=18; doc.setFont("helvetica","bold"); doc.setFontSize(9); setC(B.dark);
  doc.text("Notes",ML,y);
  doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt);
  doc.text(f.notes||"Thank you for your trust.",ML,y+5);
  y+=14; doc.setFont("helvetica","bold"); doc.setFontSize(9); setC(B.dark);
  doc.text("Terms & Conditions",ML,y);
  setD(B.bdr); doc.setLineWidth(0.2); doc.line(ML,283,R,283);
  doc.setFont("helvetica","normal"); doc.setFontSize(7); setC(B.txt2);
  doc.text("1",R,288,{align:"right"});

  // PAGE 2
  doc.addPage(); y=MT;
  doc.setFont("helvetica","bold"); doc.setFontSize(9); setC(B.dark);
  doc.text("Payment mode - Bank transfer ideally or cheque",ML,y);
  y+=5.5; doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt);
  doc.text("All bank charges are for the client",ML,y);
  y+=9; doc.setFont("helvetica","bold"); doc.setFontSize(9); setC(B.dark);
  doc.text("BANKING DETAILS ARE:",ML,y); y+=6;
  doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.txt);
  [["Bank:","MCB"],["Currency:","MUR"],["Account number:","000455533989"],["IBAN:","MU05MCBL0901000455533989000MUR"],["SWIFT:","MCBLMUMU"]].forEach(([l,v]) => { doc.text(l,ML,y); doc.text(v,ML+38,y); y+=5; });

  y+=8; doc.setFont("helvetica","bold"); doc.setFontSize(9); setC(B.dark);
  doc.text("Terms and conditions of sale",ML,y); y+=6;
  doc.setFont("helvetica","normal"); doc.setFontSize(7); setC(B.txt);
  const cgv = [
    "1. The approval of a quote implies that the Client accepts and abides to honour all the terms and conditions set out below.",
    "2. The Job can only start upon receipt of the Client\u2019s Purchase Order (P.O).",
    "3. The quotation stipulates a maximum of five stages regarding presentation/proofs (P1 to P5). Any additional modification steps requested by the Client (beyond P5) or any modifications made by the Client after \u2018signed final validation\u2019 (P5) will be invoiced additionally to the Client.",
    "4. \u2018Change of brief\u2019 requested by the client during job progress: Any variation of the contents of the initial brief and/or specifications approved by the Client will be subject to a readjustment of delivery times and prices.",
    "5. Job ordered and stopped during progress: If the Client decides to modify, reject, cancel or stop a job already in progress, the Company will inform the latter about the amount of the \u2018cancellation fee\u2019 resulting from such change.",
    "6. Payment and Down payment: Upon written request by the Client, the latter may benefit from a credit term of 30 days from the date of the invoice of the Company.",
    "7. Late payment: In the case of late payment, penalties will be invoiced to the Client at the legal rate in force.",
  ];
  cgv.forEach((term) => {
    const lines = doc.splitTextToSize(term, CW);
    if(y+lines.length*3.2>280) return;
    lines.forEach((ln) => { doc.text(ln,ML,y); y+=3.2; }); y+=1.5;
  });
  setD(B.bdr); doc.setLineWidth(0.2); doc.line(ML,283,R,283);
  doc.setFont("helvetica","normal"); doc.setFontSize(7); setC(B.txt2);
  doc.text("2",R,288,{align:"right"});
}

export default function EqxiaInvoiceForm() {
  const ready = true;
  const [form, setForm] = useState({
    inv_num:"INV-", inv_date:new Date().toISOString().split("T")[0],
    termsIdx:0, client:"", addr1:"", addr2:"", postal:"", country:"Mauritius",
    client_brn:"", client_vat:"", subject:"", notes:"Thank you for your trust.", taxIdx:0,
  });
  const [items, setItems] = useState([newItem()]);
  const [dl, setDl] = useState(false);



  const terms=TERMS[form.termsIdx], taxOpt=TAX_OPTS[form.taxIdx];
  const dueDate=calcDue(form.inv_date,terms.calc);
  const subtotal=items.reduce((s,i)=>s+i.qty*i.rate,0);
  const taxAmt=subtotal*taxOpt.rate, total=subtotal+taxAmt;
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const setI=(id,k,v)=>setItems(p=>p.map(i=>i.id===id?{...i,[k]:v}:i));
  const valid=form.inv_num&&form.client&&form.inv_date&&items.some(i=>i.name&&i.rate>0);

  const gen=()=>{
    if(!ready||false)return; setDl(true);
    try{
      const doc=new jsPDF({unit:"mm",format:"a4"});
      generatePDF(doc,{...form,total,subtotal,taxAmt,inv_date_fmt:fmtDate(form.inv_date),due_fmt:fmtDate(dueDate),terms_label:terms.label},
        items.map(i=>({...i,amount:i.qty*i.rate})),taxOpt);
      doc.save("Facture_"+(form.inv_num||"draft")+".pdf");
    }catch(e){console.error(e);} setDl(false);
  };

  const S={
    w:{fontFamily:"'Inter',system-ui,sans-serif",maxWidth:880,margin:"0 auto",padding:"20px 16px",color:B.txt,background:B.bg,minHeight:"100vh"},
    h:{display:"flex",alignItems:"center",gap:16,marginBottom:28,paddingBottom:16,borderBottom:"3px solid "+B.teal},
    s:{background:B.white,borderRadius:10,padding:"18px 22px",marginBottom:16,border:"1px solid "+B.bdr,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
    st:{fontSize:12,fontWeight:700,color:B.dark,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:14,display:"flex",alignItems:"center",gap:8},
    p:{width:4,height:16,background:B.teal,borderRadius:2,display:"inline-block",flexShrink:0},
    l:{fontSize:11,fontWeight:600,color:B.mid,marginBottom:3,display:"block"},
    i:{width:"100%",padding:"7px 10px",border:"1px solid "+B.bdr,borderRadius:6,fontSize:13,color:B.txt,outline:"none",boxSizing:"border-box",background:B.white},
    ro:{width:"100%",padding:"7px 10px",border:"1px solid "+B.bdr,borderRadius:6,fontSize:13,color:B.mid,outline:"none",boxSizing:"border-box",background:"#F1F3F5",cursor:"default"},
    bp:{padding:"11px 24px",background:B.dark,color:B.white,border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer"},
    bd:{padding:"4px 8px",background:"transparent",color:B.red,border:"1px solid "+B.red,borderRadius:5,fontSize:11,cursor:"pointer",lineHeight:"1"},
    ba:{padding:"8px 0",background:"transparent",color:B.dark,border:"2px dashed "+B.bdr,borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",width:"100%",marginTop:10},
  };
  const g=c=>({display:"grid",gridTemplateColumns:c,gap:10});

  return (
    <div style={S.w}>
      <div style={S.h}>
        <div><div style={{fontSize:26,fontWeight:700,color:B.dark,letterSpacing:"-0.5px"}}>EQXIA</div><div style={{fontSize:10,color:B.teal,fontWeight:500,marginTop:-2}}>Applied Intelligence</div></div>
        <div style={{flex:1}}/>
        <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:700,color:B.dark}}>Nouvelle Facture</div><div style={{fontSize:11,color:B.txt2}}>Remplissez les champs ci-dessous</div></div>
      </div>

      <div style={S.s}><div style={S.st}><span style={S.p}/> Informations facture</div>
        <div style={g("1fr 1fr 1fr")}>
          <div><label style={S.l}>Numero de facture *</label><input style={S.i} placeholder="INV-000350" value={form.inv_num} onChange={e=>set("inv_num",e.target.value)}/></div>
          <div><label style={S.l}>Date de facture *</label><input style={S.i} type="date" value={form.inv_date} onChange={e=>set("inv_date",e.target.value)}/></div>
          <div><label style={S.l}>Conditions de paiement</label><select style={{...S.i,cursor:"pointer"}} value={form.termsIdx} onChange={e=>set("termsIdx",+e.target.value)}>{TERMS.map((t,i)=><option key={i} value={i}>{t.label}</option>)}</select></div>
        </div>
        <div style={{...g("1fr 1fr"),marginTop:10}}>
          <div><label style={S.l}>Due Date (auto)</label><div style={S.ro}>{dueDate?fmtDate(dueDate):"\u2014"}</div></div>
          <div><label style={S.l}>BRN / VAT Eqxia</label><div style={S.ro}>C25225434 — VAT28437661</div></div>
        </div>
      </div>

      <div style={S.s}><div style={S.st}><span style={S.p}/> Client (Bill To)</div>
        <div style={g("1fr 1fr")}>
          <div><label style={S.l}>Nom de la compagnie *</label><input style={S.i} placeholder="Terra Ltd" value={form.client} onChange={e=>set("client",e.target.value)}/></div>
          <div><label style={S.l}>BRN du client</label><input style={S.i} placeholder="Optionnel" value={form.client_brn} onChange={e=>set("client_brn",e.target.value)}/></div>
        </div>
        <div style={{...g("1fr 1fr"),marginTop:10}}>
          <div><label style={S.l}>Adresse ligne 1</label><input style={S.i} placeholder="Moka Business Park" value={form.addr1} onChange={e=>set("addr1",e.target.value)}/></div>
          <div><label style={S.l}>Adresse ligne 2</label><input style={S.i} placeholder="Moka" value={form.addr2} onChange={e=>set("addr2",e.target.value)}/></div>
        </div>
        <div style={{...g("1fr 1fr 1fr"),marginTop:10}}>
          <div><label style={S.l}>Code postal</label><input style={S.i} placeholder="80813" value={form.postal} onChange={e=>set("postal",e.target.value)}/></div>
          <div><label style={S.l}>Pays</label><input style={S.i} value={form.country} onChange={e=>set("country",e.target.value)}/></div>
          <div><label style={S.l}>VAT du client</label><input style={S.i} placeholder="Optionnel" value={form.client_vat} onChange={e=>set("client_vat",e.target.value)}/></div>
        </div>
      </div>

      <div style={S.s}><div style={S.st}><span style={S.p}/> Objet</div>
        <input style={S.i} placeholder="Ateliers Generative AI - Mars 2026" value={form.subject} onChange={e=>set("subject",e.target.value)}/>
      </div>

      <div style={S.s}><div style={S.st}><span style={S.p}/> Prestations</div>
        <div style={{...g("32px 1fr 60px 100px 100px 32px"),padding:"6px 0",borderBottom:"2px solid "+B.dark,marginBottom:6}}>
          {["#","Item & Description","Qty","Rate (MUR)","Amount",""].map((h,i)=><div key={i} style={{fontSize:10,fontWeight:700,color:B.dark,textAlign:i>=2&&i<=4?"right":"left"}}>{h}</div>)}
        </div>
        {items.map((item,idx)=>(
          <div key={item.id} style={{...g("32px 1fr 60px 100px 100px 32px"),padding:"8px 0",borderBottom:"1px solid "+B.bdr,alignItems:"start"}}>
            <div style={{fontSize:12,color:B.mid,paddingTop:7}}>{idx+1}</div>
            <div>
              <input style={{...S.i,marginBottom:4,fontWeight:600}} placeholder="Nom de la prestation *" value={item.name} onChange={e=>setI(item.id,"name",e.target.value)}/>
              <textarea style={{...S.i,minHeight:36,resize:"vertical",fontSize:11}} placeholder="Description (optionnel)" value={item.desc} onChange={e=>setI(item.id,"desc",e.target.value)}/>
            </div>
            <input style={{...S.i,textAlign:"right"}} type="number" min="0.01" step="0.01" value={item.qty} onChange={e=>setI(item.id,"qty",parseFloat(e.target.value)||0)}/>
            <input style={{...S.i,textAlign:"right"}} type="number" min="0" step="100" value={item.rate} onChange={e=>setI(item.id,"rate",parseFloat(e.target.value)||0)}/>
            <div style={{fontSize:13,fontWeight:600,color:B.dark,textAlign:"right",paddingTop:7}}>{fmtN(item.qty*item.rate)}</div>
            <div style={{paddingTop:4}}>{items.length>1&&<button style={S.bd} onClick={()=>setItems(p=>p.filter(i=>i.id!==item.id))}>{"\u2715"}</button>}</div>
          </div>
        ))}
        <button style={S.ba} onClick={()=>setItems(p=>[...p,newItem()])}>+ Ajouter une ligne</button>

        <div style={{display:"flex",justifyContent:"flex-end",marginTop:18}}>
          <div style={{width:280}}>
            <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12,color:B.mid}}><span>Sub Total</span><span>{fmtN(subtotal)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",fontSize:12,color:B.mid}}>
              <select style={{...S.i,width:140,padding:"3px 6px",fontSize:11,cursor:"pointer"}} value={form.taxIdx} onChange={e=>set("taxIdx",+e.target.value)}>{TAX_OPTS.map((t,i)=><option key={i} value={i}>{t.label}</option>)}</select>
              <span>{fmtN(taxAmt)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"2px solid "+B.dark,fontSize:14,fontWeight:700,color:B.dark}}><span>Total</span><span>MUR {fmtN(total)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:B.dark,borderRadius:6,color:B.white,fontSize:13,fontWeight:600,borderTop:"3px solid "+B.teal}}><span style={{color:B.teal}}>Balance Due</span><span>MUR {fmtN(total)}</span></div>
          </div>
        </div>
      </div>

      <div style={S.s}><div style={S.st}><span style={S.p}/> Notes</div>
        <input style={S.i} value={form.notes} onChange={e=>set("notes",e.target.value)}/>
      </div>

      <div style={{display:"flex",gap:12,justifyContent:"flex-end",marginTop:4,marginBottom:32}}>
        {!ready&&<span style={{fontSize:12,color:B.txt2,paddingTop:8}}>Chargement moteur PDF...</span>}
        <button style={{...S.bp,opacity:valid&&ready?1:0.4,cursor:valid&&ready?"pointer":"not-allowed"}} disabled={!valid||!ready||dl} onClick={gen}>
          {dl?"Generation...":"Telecharger le PDF"}
        </button>
      </div>
    </div>
  );
}
