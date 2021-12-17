const generateListItem = (link, editable = false) => {

  //create the li element
  const li = document.createElement("li");

  //create the a tag
  const a = document.createElement("a")
        a.append(link.name) //insert the contents of the a tag
        a.setAttribute("href", `/data/${link.id}`) //add the href attribute
        if (link.data.approved =='true'){
          console.log("approved")
          // a.style.color = "green"
        } else if(link.data.approved =='false'){
          a.style.color = "red"
          console.log("false")
        } else if (link.data.approved == 'denied'){
          a.style.color = "gray"
          console.log("denied")
        }
  //put the a tag in the li
  li.append(a)
  
  //special routine only if the editable elements are requested
  if(editable === true) {
        
    //add the edit information
    const edit = document.createElement("span");
          edit.setAttribute("data-id", link.id);
          edit.setAttribute("data-author", link.author);
          edit.setAttribute("data-name", link.name);    
          edit.setAttribute("data-data", JSON.stringify(link.data));
          edit.append(' edit')

          edit.addEventListener('click', (e)=>{
            //show the edit form, if available
            
            //show the edit form
            //make the edit form into an update request, rather than a creation request
            const editForm = document.querySelector("#edit");
                  editForm.setAttribute("style", "display:block;")
                  editForm.setAttribute("action", "/data/update");

            
            document.querySelector('#id').value = e.target.dataset.id
            document.querySelector('#author').value = e.target.dataset.author
            document.querySelector('#name').value = e.target.dataset.name
            document.querySelector('#datum').value = e.target.dataset.data         
            console.log("POSTED")
          })

    //add the delete information
    const deletion = document.createElement("span");
          deletion.setAttribute("data-id", link.id);
          deletion.setAttribute("data-author",link.author)
          deletion.append(' delete')

          deletion.addEventListener('click', (e)=>{
            // console.log(e.target.dataset.id)
            const response = confirm(`Are you sure you want to delete post id ${e.target.dataset.id}?`)
            if(response === true) {
              fetch(`/erase/${e.target.dataset.id}`, {method: 'POST'}).then((response)=>{
                window.location = '/edit'
              })
            }
          })  
    
            const approval = document.createElement("span");
          approval.setAttribute("data-id", link.id);
          approval.setAttribute("data-author",link.author)
          approval.setAttribute("data-name",link.name)
          approval.setAttribute("data-data",JSON.stringify(link.data))
          console.log(link)
          console.log(link.data)
          // console.log(link)
          approval.append('approve')

          approval.addEventListener('click', (e)=>{
            // console.log(e.target.dataset.id)
            // const response = confirm(`Are you sure you want to approve post id ${e.target.dataset.id}?`)
            // if(response === true) {
              console.log(e.target.dataset)
              // e.target.dataset.data.approved="true"
            
              let data = JSON.parse(e.target.dataset.data)
              data.approved = "true"
              data = JSON.stringify(data)
              console.log(data)
              // console.log(e.target.dataset.data.approved)
            // console.log(eval(e.target.dataset.data))
              fetch(`/nopage/data/name/update/?name=${e.target.dataset.name}&data=${data}&author=${e.target.dataset.author}`, {method: 'POST'}).then((response)=>{
                // console.log(response)
                window.location = '/edit'
              })
            // }
          })
    
          const removal = document.createElement("span");
          removal.setAttribute("data-id", link.id);
          removal.setAttribute("data-author",link.author)
          removal.setAttribute("data-name",link.name)
          removal.setAttribute("data-data",JSON.stringify(link.data))
          console.log(link)
          removal.append('deny')

          removal.addEventListener('click', (e)=>{
          let data = JSON.parse(e.target.dataset.data)
              data.approved = "denied"
              data = JSON.stringify(data)
              console.log(data)
              // console.log(e.target.dataset.data.approved)
            // console.log(eval(e.target.dataset.data))
              fetch(`/nopage/data/name/update/?name=${e.target.dataset.name}&data=${data}&author=${e.target.dataset.author}`, {method: 'POST'}).then((response)=>{
                // console.log(response)
                window.location = '/edit'
              })
            // }
          }) 
    
              const tweet = document.createElement("a");
          tweet.setAttribute("data-id", link.id);
          tweet.setAttribute("data-author",link.author)
          tweet.setAttribute("data-name",link.name)
          console.log(link)
          console.log(encodeURI(link.name))
          tweet.href = "/oauth/twitter/" + encodeURI(link.name)
          tweet.append(' tweet')
    
    const br = document.createElement("br")

//           post.addEventListener('click', (e)=>{
//            // CLIKCING POST DOES THIS!
//             console.log("post CLICKED")
            

//                       fetch("/postTweet", {method: 'POST'}).then((response)=>{
//                         console.log(response)
//             // window.location = '/'
//           }) 
            
            
//             })
           

    li.append(br, tweet, edit, approval, removal, deletion)
    
    


    // li.append(edit, approval)
  }

  //put the li in the html #data element
  // linkList.append(li);
  return li
};

const generateEraseButton = () => {
  const erase = document.createElement("button");
        erase.append('Erase Everything!')
        erase.addEventListener("click", (e)=>{
          fetch("/erase", {method: 'POST'}).then((response)=>{
            window.location = '/'
          })          
        })
  return erase
}

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
  
  if(urlParams.has('edit')) {
//     let script = document.createElement("script")
//     script.innerHTML = `window.twttr = (function(d, s, id) {
//   var js, fjs = d.getElementsByTagName(s)[0],
//     t = window.twttr || {};
//   if (d.getElementById(id)) return t;
//   js = d.createElement(s);
//   js.id = id;
//   js.src = "https://platform.twitter.com/widgets.js";
//   fjs.parentNode.insertBefore(js, fjs);

//   t._e = [];
//   t.ready = function(f) {
//     t._e.push(f);
//   };

//   return t;
// }(document, "script", "twitter-wjs"));`
    
//     document.body.appendChild(script)



   

  }else{
    
    
  
  
    
      links.forEach((link)=>{
    
    // if (link.data.approved == "true"){
    let li = generateListItem(link, true)
    linkList.append(li);
    // }
    
  })
    
    document.querySelector("#datum").setAttribute("style","display:block")
    
    }
  
  // const options = await generateAuthorsOptions();
  // const select = document.querySelector("#author")
  // options.forEach((option)=>{
  //   select.append(option)
  // })
  
  if(urlParams.has('add')) {
    document.querySelector("#edit").setAttribute("style", "display:block")
    document.querySelector("#addcontainer").setAttribute("style","display:none")
  }

  if(urlParams.has('erase')) {
    const actions = document.querySelector("#actions");
    const erase = generateEraseButton()
    
    actions.append(erase)
  }  
  
}

run().then(()=>{
  // console.log("script executed")
})