//
//   ReactMineur projet DWWM ©2024 HPSdevs, début 15/07/24@10h00
//
import { useState,useEffect} from "react";
import grass from "../src/assets/images/grass.svg";
import flag  from "../src/assets/images/flag.svg";
import mine  from "../src/assets/images/mine.svg";
import pick  from "../src/assets/images/pick.svg";
 
export default function App() {

  // initialisation des variables
  const [redrawed,setredraw]         = useState ();                    
  const [champs,setChamps]           = useState ();                    
  const [nbflag,setNbflag]           = useState (0);                   
  const [nbmine,setNbmine]           = useState (0);                   
  const [status,setStatus]           = useState (0);                   
  const [niveau,setNiveau]           = useState (1);                   
  const [taille,setTaille]           = useState (10);                   
  const [tool  ,setTool]             = useState (0);                   
  const [timestart ,settimestart ]   = useState (0);                        
  const [timeend   ,settimeend ]     = useState (0);                        
  const [buttondisabled, chgbuttonDisabled] = useState(false); 
  const etatjeu = [ "START","STOP","YOU LOSE","WOU WIN"];   
  const etattool= [ "Une pioche","Un drapeau"]; 
  const autour  = [ [0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]]; 
  const contenu = {vu: false, affiche:false,  bombe:false }   

  // INIT juste pour avoir le champ affiché dès le lancement
  useEffect(()=>{   initialisation();  },[])

  // temps de jeu
  function setstart(){
    settimestart( Date.now());
  }
  function setend(){
    settimeend( Date.now());
    document.getElementById(`tool0`).classList.remove("encours"); // arrete les mouvements
    document.getElementById(`tool1`).classList.remove("encours");
  }
  // réaffichage quand je le Veux !
  function redraw(){
    setredraw (Math.random()*1000 )
  }
  // base start/stop
  function handleStart(){
    switch (status) {
      case 0:  // START
        chgbuttonDisabled(true);
        initialisation();
        handleTool(0);
        setStatus(1);
        setstart();
        break;
        default: // STOP/RESET
        setStatus(0);
        chgbuttonDisabled(false);
        initialisation();
        break;
    }
  }
  // handle des boutons des outils, niveaux
  function handleTool(x){
      let a=1-x;
      document.getElementById(`tool${a}`).classList.remove("encours");
      document.getElementById(`tool${x}`).classList.add("encours");
      setTool(x);
  }
  function handleNiveau(x){
      setNiveau((niveau)=> ( (niveau===1 && x<0)? niveau : (niveau===9 && x>0) ? niveau : niveau+x));
  }
  /////////////////////////////////////////////
  function initialisation(){
    const surface = taille**2;                                              // nombre de cases
    const nbm = Math.floor(surface*niveau/10);                              // % de mines par rapport aux cases + alea
    setNbflag(nbm);                                                         // nombre de drapeau disponible
    setNbmine(nbm);                                                         // nombre de mines (même)
    let field = MettreMines(nbm);  
    setChamps(field);                                                        
    redraw();  
  } 
  // affectation aléatoire des mines
  function MettreMines(nbm){
    const field = Array.from(Array(taille), () => new Array(taille).fill({sol:"herbe",terre:"terre",nb:0}));
    for (let i = 0; i < nbm;i++) {
      let c,x,y = null;
      do { 
          x= Number(Math.floor( Math.random()*taille));
          y= Number(Math.floor( Math.random()*taille));
          c= field[y][x].terre;
        } while (c==="mine")      // ne pas mettre une mine là ou il y en a déjà une ! sinon BOOOM!!!!
        autour.forEach((pos)=>{   //  si ok alors faire de suite l'entourage de valeurs
          const xx = x+pos[0]<0 ? "OUT" : x+pos[0]>(taille-1) ? "OUT" : x+pos[0];
          const yy = y+pos[1]<0 ? "OUT" : y+pos[1]>(taille-1) ? "OUT" : y+pos[1];
          const zz = xx!="OUT" && yy!="OUT";
            if (zz) { 
              let old= field[yy][xx];
              field[yy][xx] = {...old, nb: old.nb+1}; //  garder les autres valeurs tout en mettant celle-ci+1
            } 
          }
        )
        field[y][x]={sol:"herbe",terre:"mine", value: 0}; // mettre la mine là prévu.
      }
      return field;
  }
  // regarde selon l'outil
  function Look(x,y){
    if (status===1){                    // only si jeu en marche
      const vue= champs[y][x];
      if (vue.nb   ===0) Search(x,y);   // si rien faire l'auto Search
      if (vue.sol  ==="flag"  && tool===1){ setsol(x,y,"herbe")}
      if (vue.terre==="mine"  && tool===0){ setend(); setStatus(2);}
      if (vue.sol  ==="herbe" && tool===0){ setsol(x,y,"terre")}
      if (vue.sol  ==="herbe" && tool===1 && nbflag>0){ setsol(x,y,"flag")}
    } 
  }
  // La partie récursive: l'auto Search
  function Search(x,y){
         const field= champs;
         autour.forEach((pos)=>{ 
          const xx = x+pos[0]<0 ? "OUT" : x+pos[0]>(taille-1) ? "OUT" : x+pos[0];
          const yy = y+pos[1]<0 ? "OUT" : y+pos[1]>(taille-1) ? "OUT" : y+pos[1];
          const zz = xx!="OUT" && yy!="OUT";
            if (zz) { 
              let vue= field[yy][xx];
              if  (vue.sol==="herbe") {
                    setsol (xx,yy,"terre"); 
                    if (vue.nb===0){Search(xx,yy)}
                  }
            }
          }) 
          return
  }
  // changement du sol   
  function setsol(x,y,objet){
    if (objet==="flag" ){ setNbflag((a)=> --a)}
    if (objet==="herbe"){ setNbflag((a)=> ++a)}
    const field= champs;
    field[y][x] = {...field[y][x], sol: objet};
    setChamps(field);
    redraw(); 
    andTheWinnerIs();      
  }
  // Check si gagnant
  function andTheWinnerIs (){
    let win = 0;
          champs.map((row) =>   
              row.map((carre) =>  
                  { if (carre.sol==="flag" && carre.terre==="mine") { ++win} }
              )
          )
    if (win === nbmine) {setend();setStatus(3);}
  }
  // affichage du sol
  function ShowSol({place}){
    if (status===2){
       if (place.terre==="mine") return <img className="icons coming" src={mine}/>
    }
    switch (place.sol) {
      case "herbe":
        return <img className="icons" src={grass}/>
      case "flag":
        return <img className="icons" src={flag}/>
      default:
        return place.nb >0 ? place.nb : "";
     }
    }
  // affichage de base
  return (
    <>
      <div className="game">
      {status===2 && <div className="info"><h3>VOUS AVEZ PERDU</h3><h6>en {(timeend-timestart)/1000} secondes</h6></div>}
      {status===3 && (<div className="info"><h3>VOUS AVEZ GAGNÉ</h3>le niveau {niveau}
                      <h6>en {(timeend-timestart)/1000} secondes</h6>
                      <span>copie l'écran et partage ton super score !</span></div>)}
      <div className="title">
        <h1><span>DMineur 62</span></h1>
        <h4>programme en cours de développement</h4>
        <h6>©2024 by HPSdevs @ TPDWWM SOFIP Béthune</h6>
      </div>
      <div className="champ">
        <>
          {champs && champs.map((row, j) =>   
            <ul key={j}>
            {row.map((carre, i) => ( 
              <li key={j*3100+i} className={carre.sol} onClick={()=>Look(i,j)}><ShowSol place={carre}/></li> ) )}    
            </ul>
          )}
        </>
      </div><i className="redraw">{redrawed}</i>
      <div className="commands">
        <div className="actions">
              <button className="large" onClick={()=>handleStart()}>{etatjeu[status]}</button>
              <div className="niveaux">
                  <button disabled={buttondisabled}  onClick={()=>handleNiveau(-1)}>-</button>
                  <span>NIV</span><span>{niveau}</span>
                  <button onClick={()=>handleNiveau(1)} disabled={buttondisabled} >+</button>
              </div>  
        </div>
        <div className="tools">
          <button id="tool0" className="tool bttools" onClick={()=>handleTool(0)}><img className="toolimage" src={pick}/></button>
          <button id="tool1" className="tool bttools" onClick={()=>handleTool(1)}><img className="toolimage" src={flag}/>
           <div className="tooltext">{nbflag}<br/>mines</div>
           </button>
        </div> 
      </div> 
      </div>  
    </>
  );
}