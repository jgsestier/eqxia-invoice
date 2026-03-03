import { useState } from "react";
import { jsPDF } from "jspdf";

const B = {
  dark: "#1A1A2E", teal: "#C3D2D2", mid: "#4A5568", txt: "#2D3748",
  txt2: "#718096", bg: "#F7F8F9", white: "#fff", bdr: "#E2E8F0",
  red: "#E53E3E", tblAlt: "#F1F3F5",
};

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
  doc.setFont("helvetica","bold"); doc.setFontSize(22); setC(B.dark);
  doc.text("EQXIA", ML+5, MT+10);
  doc.setFont("helvetica","normal"); doc.setFontSize(8); setC(B.teal);
  doc.text("Applied Intelligence", ML+5, MT+14.5);

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
    inv_num:"", inv_date:new Date().toISOString().split("T")[0],
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
