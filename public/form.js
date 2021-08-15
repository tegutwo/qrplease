var codeInput = document.querySelector("#class_id");
var codeNameInput = document.querySelector("#class_name");

console.log(codeInput,codeNameInput);
["keydown" ,"paste" ,"focus" ,"mousedown"].forEach(elem=>{
    codeNameInput.addEventListener(elem,(event)=>{
        if(event.keyCode != 9)
        event.preventDefault();
    })
    codeInput.addEventListener(elem,(event)=>{
        if(event.keyCode != 9)
        event.preventDefault();
    })
})