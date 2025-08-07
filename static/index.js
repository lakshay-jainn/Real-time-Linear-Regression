
function showFileName() {
      const input = document.getElementById('real-file');
      const fileNameDiv = document.getElementById('file-name');
      if (input.files.length > 0) {
        fileNameDiv.textContent = `Selected file: ${input.files[0].name}`;
      } else {
        fileNameDiv.textContent = 'Upload File';
      }
    }


const form = document.getElementById("csvForm")
let minX;
let maxX;
let scaledMaxX;
form.addEventListener("submit",async function (event){
  event.preventDefault();
  formdata = new FormData(form);
  try{
    const response = await fetch("/upload_csv",{
    method:"POST",
    body:formdata
    });
    const data = await response.json();
    window.location.href = data.redirect_url;


  }catch(error){
    console.error(error);
  }})

