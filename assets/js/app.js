const blogForm=document.getElementById("blogForm");

// Controls
const titleControl=document.getElementById("title");
const contentControl=document.getElementById("content");
const userIdControl=document.getElementById("userId");


const showData=document.getElementById("showData")
const addFormBtn=document.getElementById('addFormBtn')
const updateForm=document.getElementById('updateForm')
const loader=document.getElementById("loader");


const BASE_URL=`https://xhr-crud-default-rtdb.firebaseio.com`;
const POST_URL=`${BASE_URL}/posts.json`

let snackBar=(msg,icon)=>{
    Swal.fire({
        title:msg,
        timer:2500,
        icon:icon
    })
}

const objToArr=(object)=>{
    let arr=[];
    for (const key in object) {
        arr.push({...object[key],id:key})
        // console.log(arr);
        
    }
    return arr
}


const templating=(arr)=>{
    let result='';
    arr.forEach((arr)=>{
        result+=`
              <div class="card mb-2" id=${arr.id}>
                  <div class="card-header">${arr.title}</div>
                  <div class="card-body">${arr.content}</div>
                  <div class="card-footer d-flex justify-content-between">
                    <button type="button" class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                    <button type="button" class="btn btn-danger" onclick="onRemove(this)">Remove</button>
                </div>
              </div>
        `
    })
    showData.innerHTML=result;
    
}

const makeApiCall=(methodname,apiUrl,data,cb=()=>{})=>{
    let xhr= new XMLHttpRequest();  //instance created
    xhr.open(methodname,apiUrl)
    xhr.send(data)
    xhr.onload=()=>{
        if(xhr.status>=200 && xhr.status <300){
            let data=JSON.parse(xhr.response)
            cb(null,data)
        }else{
            cb(`found Error,Error code :${xhr.status}`)
        }
    }
}

const fetchAllData=()=>{
    loader.classList.remove("d-none")
    makeApiCall("GET",POST_URL,null,(err,res=null)=>{
        if(!err){
            loader.classList.add("d-none")
            let arr=objToArr(res);
            templating(arr);
        }else{
            loader.classList.add("d-none")
            console.log(err); 
        }
    })
}
fetchAllData();
const createCard=(obj,res)=>{
    let card=document.createElement("div");
    card.className="card mb-2"
    card.id=res.name
    // console.log(card.id=res.name);
    
    // console.log(res.name);
    
    card.innerHTML=`<div class="card-header">${obj.title}</div>
                  <div class="card-body">${obj.content}</div>
                  <div class="card-footer d-flex justify-content-between">
                    <button type="button" class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                    <button type="button" class="btn btn-danger" onclick="onRemove(this)">Remove</button>
                </div>`
    showData.append(card);


}

const onEdit=(eve)=>{ 
    loader.classList.remove("d-none")
    let Edit_ID=eve.closest(".card").id
    console.log(Edit_ID);
    
    localStorage.setItem("editId",JSON.stringify(Edit_ID))

    let EDIT_URL=`${BASE_URL}/posts/${Edit_ID}.json`
    console.log(EDIT_URL);
    

    makeApiCall("GET",EDIT_URL,null,(err,res)=>{
        if(!err){
            titleControl.value=res.title;
            contentControl.value=res.content;
            userIdControl.value=res.userId
            updateForm.classList.remove('d-none');
            addFormBtn.classList.add("d-none");
            loader.classList.add("d-none")
        }else{
            loader.classList.add("d-none")
            console.log(err);

        }
    })
}
const onUpdate=()=>{
    loader.classList.remove("d-none")
    let updateID=JSON.parse(localStorage.getItem("editId"));
    let updatedBlog={
        title:titleControl.value,
        content:contentControl.value,
        userId:userIdControl.value,
    }
    let UPDATED_URL=`${BASE_URL}/posts/${updateID}.json`
    makeApiCall("PATCH",UPDATED_URL,JSON.stringify(updatedBlog),(err,res)=>{
        if(!err){

            let cardChild=document.getElementById(`${updateID}`).children
            cardChild[0].innerHTML=titleControl.value
            cardChild[1].innerHTML=contentControl.value
            updateForm.classList.add('d-none');
            addFormBtn.classList.remove('d-none')
            blogForm.reset();
            loader.classList.add("d-none")
            snackBar("POST Updated successfully","success")
        }else{
            console.log(err);
            
        }
    })
}

const onRemove=(eve)=>{
    loader.classList.remove("d-none")
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
            let removeID=eve.closest(".card").id
            let REMOVE_URL=`${BASE_URL}/posts/${removeID}.json`
            makeApiCall("DELETE",REMOVE_URL,null,(err,res)=>{
                if(!err){
                    loader.classList.add("d-none")
                    document.getElementById(`${removeID}`).remove()
                }else{
                    loader.classList.add("d-none")
                    console.log(err);
                    
                }
            })
        }else{
            loader.classList.add("d-none")
        }
      });



}

const onBlogAdd=(eve)=>{
    eve.preventDefault();
    loader.classList.remove("d-none")

    let newObj={
        title:titleControl.value,
        content:contentControl.value,
        userId:userIdControl.value
    }
    // console.log(newObj);
    blogForm.reset();
    makeApiCall("POST",POST_URL,JSON.stringify(newObj),(err,res)=>{
        if(!err){
            loader.classList.add("d-none")
            createCard(newObj,res)
            snackBar("POST Added Successfully","success")
        }else{
            loader.classList.add("d-none")
            console.log(err);
        }
    });
    
}
updateForm.addEventListener("click",onUpdate)
blogForm.addEventListener('submit',onBlogAdd)