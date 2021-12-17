const generateListItem = (link) => {

  //create the li element
  const li = document.createElement("li");

  //create the a tag
  const a = document.createElement("div")
        a.append(link.name) //insert the contents of the a tag
        a.setAttribute("href", `/data/${link.id}`) //add the href attribute
        if (link.data.approved =='true'){
          a.style.color = "white"
        } else if(link.data.approved =='false'){
          a.style.color = "red"
        } else if (link.data.approved == 'denied'){
          a.style.color = "gray"
        }
  //put the a tag in the li
  li.append(a)
  
  //special routine only if the editable elements are requested
 

  //put the li in the html #data element
  // linkList.append(li);
  return li
};


// const generateAuthorsOptions = async () => {
//   const authors = await fetch("/authors").then(res=>res.json())
//   let options = []
//   authors.forEach((author)=>{
    
//     let option = document.createElement("option")
//     option.append(author)
//     option.setAttribute("value", author)
//     options.push(option)
    
//   })
  
//   return options;
// }

const run = async () => {
 
  const urlParams = new URLSearchParams(document.location.search.substring(1));
  const data = [];
  const linkList = document.querySelector("#data");

  // request the links from our app's sqlite database
  let links = await fetch("/data", {}).then((res) => {return res.json()})
    
    
  
  
  links.forEach((link)=>{
    
    if (link.data.approved == "true"){
    let li = generateListItem(link)
    linkList.append(li);
    }
    
  })
    
  
  
  if(urlParams.has('add')) {
    document.querySelector("#edit").setAttribute("style", "display:block")
    document.querySelector("#addcontainer").setAttribute("style","display:none")
  }
}


run().then(()=>{
  const urlParams = new URLSearchParams(document.location.search.substring(1));
 if(urlParams.has('edit')){
    window.location = "/edit"
    }
})