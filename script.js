let btn = document.createElement("button");
btn.classList.add("btn-ext");
var recognition;
var transcript = "";
var apikey="AIzaSyCCNsBOQWcVP75pe6PL6s-7csupt515fEo";
var apiurl=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`;
var mapskey="4182fde27a504f7cae646c4bbdf18a5a"
var selectedText="";
speechtotext();

btn.addEventListener("click", () => {
  if (!btn.classList.contains("activate")) {
    btn.classList.add("activate");
    transcript = "";
    recognition.start();
  } else {
    btn.classList.remove("activate");
    recognition.stop();
  }
});

document.body.appendChild(btn);

function speechtotext() {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
 
    recognition.onresult = function (event) {
      transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
    };
  
    recognition.onspeechend = function () {
      console.log("Speech ended. Checking transcript...");
      if (!transcript.trim()) {
        console.log("No speech detected.");
      }
      else{
      console.log(transcript);
      debouncechatgpt(transcript,5000,"checking");
      }
    };
  
    recognition.onerror = function (event) {
      console.error("Speech recognition error:", event.error);
    };
  }

  async function responsechatgpt(message,reason){
    let search;
    if(reason=="checking"){
      search=`${message}. Analyze the given text and determine if it's about a person, place, or general word. give the result in one word from the above list person place general word`
      let options={
        method:'POST',
        body:JSON.stringify({
     contents: [{
      parts:[{"text": search}]
      }]
      })
    }
  
      try{
        let response=await fetch(apiurl,options)
        let result=await response.json();
       output=result.candidates[0].content.parts[0].text;
       console.log( typeof (output));
        redirecting(output);
      }
      catch(error){
        console.log(error.message)
      }
    }
    if(reason=="asking"){
       search=message+"Give the meaning and key details of a general word in a short, crisp, and layman-friendly way. Use meaningful line breaks for clarity";
       let options={
        method:'POST',
        body:JSON.stringify({
     contents: [{
      parts:[{"text": search}]
      }]
      })
    }
  
      try{
        let response=await fetch(apiurl,options)
        let result=await response.json();
       output=result.candidates[0].content.parts[0].text;
        createPopup(output,"chatgpt")
      }
      catch(error){
        console.log(error.message)
      }
    }
  
  }

var id;
  function debouncechatgpt(transcript,delay=2000,reason){
          clearTimeout(id);
          id=setTimeout(()=>{
               responsechatgpt(transcript,reason);
          },delay)
  }
  document.addEventListener("mouseup", () => {
    let selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
      console.log("Selected text:", selectedText);
      transcript=selectedText;
      console.log("Selected text:", transcript);
      if (!btn.classList.contains("activate")) {
        debouncechatgpt(transcript, 3000,"checking"); 
      }
    }
  });

  function redirecting(output){
    console.log("i am in redirecting function ")
    console.log(output);
    if(output.toLowerCase().trim()==='person'){
      console.log("true");
      searchperson();
    }
    else if(output.toLowerCase().trim()==='place'){
      searchplaces();
    }
    else if(output.toLowerCase().trim()==="general word"){
debouncechatgpt(transcript,3000,"asking");
    }
  }

  function searchperson(){
    console.log("i am in searchperson")
    if(window.confirm("redirecting to linkedin")){
      window.open(`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(transcript)}`,"_blank");
    }
  }

  async function searchplaces(){
    let response=await fetch(`https://api.geoapify.com/v1/geocode/search?text=${transcript}&apiKey=${mapskey}`)
    let result=await response.json();
    console.log(result);
    console.log("i am in search places");
    console.log(result.features[0].properties.address_line2)
    createPopup(result,"place");
  }

  function createPopup(content,condition) {
 
    const existingPopup = document.querySelector("#customPopup");
    if (existingPopup) 
      existingPopup.remove();
    if(condition=="place"){
    let popup = document.createElement("div");
    popup.id = "customPopup";
    popup.innerHTML = `
        <div class="popup-content">
            <span class="close-btn">x</span>
            <h2>Place You Have Searched For</h2>
            <p><b>Address:-</b> ${content.features[0].properties.address_line2}</p>
            <p><b>City:-</b> ${content.features[0].properties.city}</p>
             <p><b>State:-</b> ${content.features[0].properties.state}</p>
            <p><b>Country:-</b> ${content.features[0].properties.country}</p>
        </div>
    `;
    let a=document.createElement("a");
    a.href=`https://www.google.com/maps?q=${content.features[0].properties.lat},${content.features[0].properties.lon}`
    a.innerText="Click the link to visit the location";
  let p=document.createElement("p");
  p.appendChild(a);
 popup.append(p);
     
    popup.querySelector(".close-btn").onclick = function () {
        popup.remove();
    };
    document.body.appendChild(popup);
    setTimeout(()=>{
     
        if(confirm("Do You Want To Plan a Trip ?")){
          window.open(`https://giholidays.makemytrip.com/holidays/india/search?dest=${content.features[0].properties.city}`);
        }
      
    },6000)
    document.body.appendChild(popup);

  }

else if (condition=="chatgpt"){
  console.log("i am inside popup2")
  let popup2 = document.createElement("div");
    popup2.id = "customPopup";
    popup2.innerHTML = `
        <div class="popup-content">
            <span class="close-btn">x</span>
            <h2>Text Which You Have Searched</h2>
            <p>${content}</p>
        </div>
    `;
    popup2.querySelector(".close-btn").onclick = function () {
      popup2.remove();
  };
    document.body.appendChild(popup2);
}

}
